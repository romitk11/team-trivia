import { Redis } from "@upstash/redis";
import { customAlphabet, nanoid } from "nanoid";
import { computePoints } from "./scoring";
import type {
  AnswerRecord,
  HostAccount,
  Player,
  QuestionSet,
  RoomMeta,
  RoomStatus,
} from "./types";

// The Vercel Marketplace Upstash integration provisions KV_REST_API_* vars
// (legacy Vercel KV naming), not the UPSTASH_REDIS_REST_* names Redis.fromEnv() expects.
export const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

const ROOM_TTL_SECONDS = 60 * 60 * 12; // 12h, auto-cleans orphaned rooms
const ROOM_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I
const generateRoomCode = customAlphabet(ROOM_CODE_ALPHABET, 6);

function roomKey(code: string, suffix: string) {
  return `room:${code}:${suffix}`;
}

// ---- Question sets (persistent, scoped per owner) ----

function ownerQsetIndexKey(ownerId: string) {
  return `qset:ids:${ownerId}`;
}

export async function listQuestionSets(ownerId: string): Promise<QuestionSet[]> {
  const ids = await redis.smembers(ownerQsetIndexKey(ownerId));
  if (ids.length === 0) return [];
  const sets = await Promise.all(ids.map((id) => getQuestionSet(id)));
  return sets.filter((s): s is QuestionSet => s !== null).sort((a, b) => a.createdAt - b.createdAt);
}

export async function getQuestionSet(id: string): Promise<QuestionSet | null> {
  const raw = await redis.get<QuestionSet | string>(`qset:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as QuestionSet) : raw;
}

export async function saveQuestionSet(qset: QuestionSet): Promise<void> {
  await redis.set(`qset:${qset.id}`, JSON.stringify(qset));
  await redis.sadd(ownerQsetIndexKey(qset.ownerId), qset.id);
}

export async function deleteQuestionSet(id: string, ownerId: string): Promise<void> {
  await redis.del(`qset:${id}`);
  await redis.srem(ownerQsetIndexKey(ownerId), id);
}

// ---- Host accounts ----

function hostAccountKey(ownerId: string) {
  return `host:${ownerId}`;
}

export async function getHostAccount(ownerId: string): Promise<HostAccount | null> {
  const raw = await redis.get<HostAccount | string>(hostAccountKey(ownerId));
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as HostAccount) : raw;
}

export async function createHostAccount(account: HostAccount): Promise<void> {
  await redis.set(hostAccountKey(account.ownerId), JSON.stringify(account));
}

// ---- Rooms (ephemeral) ----

function serializeMeta(meta: RoomMeta): Record<string, string> {
  return {
    code: meta.code,
    qsetId: meta.qsetId,
    status: meta.status,
    currentQuestionIndex: String(meta.currentQuestionIndex),
    questionStartedAt: meta.questionStartedAt === null ? "" : String(meta.questionStartedAt),
    questionEndsAt: meta.questionEndsAt === null ? "" : String(meta.questionEndsAt),
    createdAt: String(meta.createdAt),
  };
}

function deserializeMeta(raw: Record<string, string>): RoomMeta {
  return {
    code: raw.code,
    qsetId: raw.qsetId,
    status: raw.status as RoomStatus,
    currentQuestionIndex: Number(raw.currentQuestionIndex),
    questionStartedAt: raw.questionStartedAt ? Number(raw.questionStartedAt) : null,
    questionEndsAt: raw.questionEndsAt ? Number(raw.questionEndsAt) : null,
    createdAt: Number(raw.createdAt),
  };
}

export async function createRoom(qsetId: string): Promise<string> {
  let code = generateRoomCode();
  // Extremely unlikely collision at this scale, but guard anyway.
  for (let attempts = 0; attempts < 5 && (await redis.exists(roomKey(code, "meta"))); attempts++) {
    code = generateRoomCode();
  }
  const meta: RoomMeta = {
    code,
    qsetId,
    status: "lobby",
    currentQuestionIndex: -1,
    questionStartedAt: null,
    questionEndsAt: null,
    createdAt: Date.now(),
  };
  const metaKey = roomKey(code, "meta");
  await redis.hset(metaKey, serializeMeta(meta));
  await redis.expire(metaKey, ROOM_TTL_SECONDS);
  return code;
}

export async function getRoomMeta(code: string): Promise<RoomMeta | null> {
  const raw = await redis.hgetall<Record<string, string>>(roomKey(code, "meta"));
  if (!raw || Object.keys(raw).length === 0) return null;
  return deserializeMeta(raw);
}

async function touchTtl(code: string) {
  await Promise.all(
    [roomKey(code, "meta"), roomKey(code, "players")].map((k) => redis.expire(k, ROOM_TTL_SECONDS)),
  );
}

export async function updateRoomMeta(code: string, patch: Partial<RoomMeta>): Promise<void> {
  const current = await getRoomMeta(code);
  if (!current) throw new Error(`Room ${code} not found`);
  const next = { ...current, ...patch };
  await redis.hset(roomKey(code, "meta"), serializeMeta(next));
  await touchTtl(code);
}

export async function joinRoom(code: string, name: string, avatar: string): Promise<Player> {
  const player: Player = { id: nanoid(12), name, avatar, score: 0, joinedAt: Date.now() };
  await redis.hset(roomKey(code, "players"), { [player.id]: JSON.stringify(player) });
  await touchTtl(code);
  return player;
}

export async function getPlayers(code: string): Promise<Player[]> {
  const raw = await redis.hgetall<Record<string, string>>(roomKey(code, "players"));
  if (!raw) return [];
  return Object.values(raw)
    .map((v) => (typeof v === "string" ? (JSON.parse(v) as Player) : (v as Player)))
    .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
}

async function setPlayerScore(code: string, playerId: string, score: number): Promise<void> {
  const raw = await redis.hget<string | Player>(roomKey(code, "players"), playerId);
  if (!raw) throw new Error("Player not found");
  const player = typeof raw === "string" ? (JSON.parse(raw) as Player) : raw;
  player.score = score;
  await redis.hset(roomKey(code, "players"), { [playerId]: JSON.stringify(player) });
}

export async function getAnswers(code: string, questionIndex: number): Promise<AnswerRecord[]> {
  const raw = await redis.hgetall<Record<string, string>>(roomKey(code, `answers:${questionIndex}`));
  if (!raw) return [];
  return Object.values(raw).map((v) => (typeof v === "string" ? (JSON.parse(v) as AnswerRecord) : (v as AnswerRecord)));
}

export type SubmitAnswerResult =
  | { ok: true; record: AnswerRecord }
  | { ok: false; reason: "already-answered" | "time-expired" | "room-not-in-question-phase" };

export async function submitAnswer(
  code: string,
  meta: RoomMeta,
  question: { id: string; correctOptionId: string; timeLimitSec: number; points: number },
  playerId: string,
  optionId: string,
  now: number,
): Promise<SubmitAnswerResult> {
  if (meta.status !== "question" || meta.questionStartedAt === null || meta.questionEndsAt === null) {
    return { ok: false, reason: "room-not-in-question-phase" };
  }
  if (now > meta.questionEndsAt) {
    return { ok: false, reason: "time-expired" };
  }

  const answersKey = roomKey(code, `answers:${meta.currentQuestionIndex}`);
  const existing = await redis.hget(answersKey, playerId);
  if (existing) {
    return { ok: false, reason: "already-answered" };
  }

  const correct = optionId === question.correctOptionId;
  const pointsAwarded = correct
    ? computePoints(question.points, question.timeLimitSec, meta.questionStartedAt, now)
    : 0;
  const record: AnswerRecord = { playerId, optionId, correct, pointsAwarded, answeredAt: now };

  await redis.hset(answersKey, { [playerId]: JSON.stringify(record) });
  await redis.expire(answersKey, ROOM_TTL_SECONDS);

  if (pointsAwarded > 0) {
    const players = await getPlayers(code);
    const player = players.find((p) => p.id === playerId);
    if (player) {
      await setPlayerScore(code, playerId, player.score + pointsAwarded);
    }
  }

  return { ok: true, record };
}

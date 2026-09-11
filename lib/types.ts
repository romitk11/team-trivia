export type AnswerOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
};

export type Question = {
  id: string;
  prompt: string;
  imageUrl?: string;
  options: AnswerOption[];
  correctOptionId: string;
  timeLimitSec: number;
  points: number;
};

export type QuestionSet = {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  announcement?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
};

export type HostAccount = {
  username: string; // display casing, e.g. "Romit"
  ownerId: string; // normalized lowercase, used as the stable key/owner id
  passwordHash: string;
  salt: string;
  createdAt: number;
};

export type RoomStatus = "lobby" | "question" | "results" | "ended";

export type RoomMeta = {
  code: string;
  qsetId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  questionEndsAt: number | null;
  createdAt: number;
};

export type Player = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  joinedAt: number;
};

export type AnswerRecord = {
  playerId: string;
  optionId: string;
  correct: boolean;
  pointsAwarded: number;
  answeredAt: number;
};

export type RoomStateResponse = {
  code: string;
  status: RoomStatus;
  qsetTitle: string;
  qsetAnnouncement?: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  question: {
    id: string;
    prompt: string;
    imageUrl?: string;
    options: AnswerOption[];
    timeLimitSec: number;
    correctOptionId: string | null; // only populated once status is "results" or "ended"
  } | null;
  questionStartedAt: number | null;
  questionEndsAt: number | null;
  answeredCount: number;
  players: Player[]; // full list, sorted by score desc; client slices top 5 + finds own rank
  serverNow: number; // for clients to correct clock skew against questionEndsAt
};

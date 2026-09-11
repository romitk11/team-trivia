"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import type { Question, QuestionSet } from "@/lib/types";

const OPTION_IDS = ["A", "B", "C", "D"] as const;

function blankQuestion(): Question {
  return {
    id: nanoid(8),
    prompt: "",
    options: OPTION_IDS.map((id) => ({ id, text: "" })),
    correctOptionId: "A",
    timeLimitSec: 25,
    points: 1000,
  };
}

export default function EditQuestionSetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/qsets/${params.id}`)
      .then((res) => res.json())
      .then((body) => {
        const set: QuestionSet = body.questionSet;
        setTitle(set.title);
        setDescription(set.description ?? "");
        setAnnouncement(set.announcement ?? "");
        setQuestions(set.questions);
      })
      .catch(() => setError("Couldn't load this question set."))
      .finally(() => setLoading(false));
  }, [isNew, params.id]);

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, optIndex: number, text: string) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? { ...o, text } : o)) }
          : q,
      ),
    );
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((qs) => {
      const next = [...qs];
      const target = index + direction;
      if (target < 0 || target >= next.length) return qs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = { title: title || "Untitled Set", description, announcement, questions };
      const res = isNew
        ? await fetch("/api/qsets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/qsets/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't save");
      router.push("/host/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="stage flex-1">
        <p className="p-12 text-center text-surface">Loading…</p>
      </div>
    );
  }

  return (
    <div className="stage flex-1 px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 font-display text-3xl font-bold text-white">
          {isNew ? "New Question Set" : "Edit Question Set"}
        </h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Set title"
          className="mb-3 w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-lg font-bold text-ink shadow-sm outline-none transition-colors focus:border-brand-blue"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="mb-3 w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-ink shadow-sm outline-none transition-colors focus:border-brand-blue"
        />
        <input
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Lobby announcement (optional) — e.g. 🏆 Top three win a prize!"
          className="mb-8 w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-ink shadow-sm outline-none transition-colors focus:border-brand-blue"
        />

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="card-glow rounded-2xl bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display font-bold text-ink/60">Q{qIndex + 1}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveQuestion(qIndex, -1)}
                    className="rounded-lg px-2 py-1 text-ink/60 transition-colors hover:bg-marble"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveQuestion(qIndex, 1)}
                    className="rounded-lg px-2 py-1 text-ink/60 transition-colors hover:bg-marble"
                  >
                    ↓
                  </button>
                  <select
                    value={q.timeLimitSec}
                    onChange={(e) => updateQuestion(qIndex, { timeLimitSec: Number(e.target.value) })}
                    className="rounded-lg border border-surface px-2 py-1 text-sm text-ink"
                  >
                    <option value={25}>25s</option>
                    <option value={30}>30s</option>
                  </select>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="rounded-lg px-2 py-1 text-answer-red transition-colors hover:bg-marble"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <textarea
                value={q.prompt}
                onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
                placeholder="Question prompt"
                rows={2}
                className="mb-3 w-full rounded-xl border border-surface px-3 py-2 text-ink outline-none transition-colors focus:border-brand-blue"
              />

              <input
                value={q.imageUrl ?? ""}
                onChange={(e) => updateQuestion(qIndex, { imageUrl: e.target.value || undefined })}
                placeholder="Image URL (optional) — paste a link to an image for this question"
                className="mb-3 w-full rounded-xl border border-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand-blue"
              />
              {q.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.imageUrl}
                  alt=""
                  className="mb-3 max-h-40 rounded-xl border border-surface object-contain"
                />
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt, optIndex) => (
                  <label key={opt.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctOptionId === opt.id}
                      onChange={() => updateQuestion(qIndex, { correctOptionId: opt.id })}
                      className="accent-brand-blue"
                    />
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${opt.id}`}
                      className="w-full rounded-xl border border-surface px-3 py-2 text-ink outline-none transition-colors focus:border-brand-blue"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}
          className="mt-6 w-full rounded-xl border-2 border-dashed border-white/20 py-3 font-bold text-surface transition-colors hover:border-brand-blue hover:bg-white/5"
        >
          + Add Question
        </button>

        {error && <p className="mt-4 font-semibold text-answer-red">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-4 py-3.5 text-lg font-bold text-white shadow-lg shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Question Set"}
        </button>
      </div>
    </div>
  );
}

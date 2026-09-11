export const AVATAR_OPTIONS = [
  "🦁", "🐸", "🦊", "🐼", "🐧", "🦄", "🐙", "🐝", "🦖", "🐨", "🐯", "🦉",
  "🐢", "🦋", "🐬", "🐵",
] as const;

export type Avatar = (typeof AVATAR_OPTIONS)[number];

export function isValidAvatar(value: unknown): value is Avatar {
  return typeof value === "string" && (AVATAR_OPTIONS as readonly string[]).includes(value);
}

export type PlayerSession = {
  playerId: string;
  name: string;
  avatar: string;
};

function key(code: string) {
  return `trivia_player_${code}`;
}

export function savePlayerSession(code: string, session: PlayerSession) {
  sessionStorage.setItem(key(code), JSON.stringify(session));
}

export function getPlayerSession(code: string): PlayerSession | null {
  const raw = sessionStorage.getItem(key(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlayerSession;
  } catch {
    return null;
  }
}

export function clearPlayerSession(code: string) {
  sessionStorage.removeItem(key(code));
}

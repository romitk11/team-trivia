import type { Question, QuestionSet } from "./types";

function q(
  id: string,
  prompt: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  timeLimitSec: 25 | 30,
): Question {
  const ids = ["A", "B", "C", "D"] as const;
  return {
    id,
    prompt,
    options: options.map((text, i) => ({ id: ids[i], text })),
    correctOptionId: ids[correctIndex],
    timeLimitSec,
    points: 1000,
  };
}

export const LAUNCH_SET_ID = "team-trivia-launch";

const questions: Question[] = [
  q("q1", "What was the main purpose of a Discman?", [
    "Playing CDs on the go",
    "Recording TV shows",
    "Burning DVDs",
    "Listening to satellite radio",
  ], 0, 25),
  q("q2", "Which storage format had the least capacity?", [
    "CD-ROM",
    "DVD",
    "3.5-inch floppy disk",
    "USB flash drive",
  ], 2, 25),
  q("q3", "Emoji were invented in which country in the late 1990s?", [
    "USA",
    "Japan",
    "South Korea",
    "UK",
  ], 1, 25),
  q("q4", "Which tech giant was famously founded in a garage in Los Altos, California in 1976?", [
    "Microsoft",
    "Apple",
    "Google",
    "Amazon",
  ], 1, 25),
  q("q5", "Google's name is a play on which mathematical term, meaning the number 1 followed by 100 zeros?", [
    "Infinity",
    "Googol",
    "Fibonacci",
    "Vector",
  ], 1, 30),
  q("q6", 'Which toy became famous for saying "Feed me!" and responding to interaction?', [
    "Tamagotchi",
    "Furby",
    "Skip-It",
    "Bop It",
  ], 1, 25),
  q("q7", "Which collectible card game became a major playground craze in the late 1990s?", [
    "Uno",
    "Pokémon cards",
    "Exploding Kittens",
    "Cards Against Humanity",
  ], 1, 25),
  q("q8", "In 1999, the average U.S. movie ticket price was closest to which amount?", [
    "$3.25",
    "$5.08",
    "$7.50",
    "$9.25",
  ], 1, 25),
  q("q9", "In the early 2000s, a new PlayStation 2 launched in the U.S. at about what price?", [
    "$149",
    "$199",
    "$299",
    "$399",
  ], 2, 25),
  q("q10", "In the late 1990s, about how much did a new Nintendo 64 console cost at launch?", [
    "$99",
    "$149",
    "$199",
    "$299",
  ], 2, 25),
  q("q11", "In 2001, about how much did the original iPod cost at launch?", [
    "$199",
    "$299",
    "$399",
    "$499",
  ], 2, 25),
  q("q12", "Manager Lou Pearlman defrauded two boy bands out of their own earnings simultaneously. Which pair?", [
    "Backstreet Boys & *NSYNC",
    "*NSYNC & 98 Degrees",
    "Backstreet Boys & New Kids on the Block",
    "98 Degrees & New Kids on the Block",
  ], 0, 30),
  q("q13", 'This song holds the record for the longest run on the Billboard Hot 100 without ever hitting #1 (43 weeks).', [
    '"Come on Eileen" – Dexys Midnight Runners',
    '"Tainted Love" – Soft Cell',
    '"99 Luftballons" – Nena',
    '"Take On Me" – a-ha',
  ], 1, 30),
  q("q14", "Which iconic TV theme song is entirely instrumental, with no lyrics at all?", [
    "Law & Order",
    "The Simpsons",
    "Cheers",
    "Friends",
  ], 1, 30),
  q("q15", '"A man spends years trying to get home, but mostly just runs a very successful seafood business by accident."', [
    "Cast Away",
    "Forrest Gump",
    "Big Fish",
    "The Terminal",
  ], 1, 30),
  q("q16", '"A billionaire dresses up as an animal because he has unresolved childhood trauma."', [
    "Black Panther",
    "Batman Begins",
    "The Wolf of Wall Street",
    "Doctor Dolittle",
  ], 1, 30),
  q("q17", '"A guy ruins a wedding, befriends a tiger, and loses his friend on a roof."', [
    "Wedding Crashers",
    "The Hangover",
    "Old School",
    "Superbad",
  ], 1, 30),
  q("q18", "🏎️💨 — guess the movie", [
    "Speed",
    "Mission: Impossible",
    "Die Hard",
    "The Fast and the Furious",
  ], 0, 25),
  q("q19", "🧊🚢💔 — guess the movie", [
    "The Perfect Storm",
    "Titanic",
    "Frozen",
    "Cast Away",
  ], 1, 25),
  q("q20", "Which streaming service originally launched as a joint venture between NBCUniversal and News Corp?", [
    "Hulu",
    "Netflix",
    "Peacock",
    "Paramount+",
  ], 0, 25),
  q("q21", "Which show helped make Apple TV+ a major awards player by winning multiple Emmys?", [
    "The Morning Show",
    "Ted Lasso",
    "Severance",
    "Foundation",
  ], 1, 25),
  q("q22", "Real or fake: there is a real movie called Sharknado.", [
    "Real",
    "Fake",
    "Fake, but it was a meme",
    "Real, but only as a short film",
  ], 0, 25),
  q("q23", "Real or fake: Shaquille O'Neal released a rap album that went platinum.", [
    "Real",
    "Fake",
    "Real, but it only went gold",
    "Fake, but he only had one song",
  ], 0, 25),
  q("q24", "Which of these premiered first?", [
    "The Sopranos",
    "Lost",
    "Grey's Anatomy",
    "Mad Men",
  ], 0, 25),
  q("q25", "Which of these launched first?", [
    "Facebook",
    "YouTube",
    "Twitter",
    "Instagram",
  ], 0, 25),
  q("q26", "What is a group of flamingos officially called?", [
    "A flock",
    "A flamboyance",
    "A parade",
    "A gaggle",
  ], 1, 25),
  q("q27", "Archaeologists have found still-edible honey in ancient Egyptian tombs about how many years old?", [
    "500 years",
    "1,000 years",
    "3,000 years",
    "10,000 years",
  ], 2, 25),
  q("q28", '"Delulu" went viral after being used in which real-world context?', [
    "A UN youth speech",
    "An Australian senator's parliamentary remarks",
    "A Fortune 500 earnings call",
    "A Supreme Court filing",
  ], 1, 30),
  q("q29", 'This 90s virtual pet got so many kids emotionally attached that some Japanese schools banned it after in-class "funerals" for dead ones.', [
    "Tamagotchi",
    "Furby",
    "Neopets",
    "Webkinz",
  ], 0, 30),
  q("q30", "Which of these texting abbreviations is actually OLDER than texting itself — it appears in a 1917 letter to Winston Churchill?", [
    "BRB",
    "OMG",
    "LOL",
    "TTYL",
  ], 1, 30),
];

export function buildLaunchSet(): QuestionSet {
  const now = Date.now();
  return {
    id: LAUNCH_SET_ID,
    title: "Team Trivia — Launch Set",
    description: "Nostalgia, pop culture, and generational trivia — 30 questions.",
    announcement: "🏆 Top three win a prize!",
    questions,
    createdAt: now,
    updatedAt: now,
  };
}

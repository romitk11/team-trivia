const STYLES = [
  { bg: "bg-answer-red", shape: "▲" },
  { bg: "bg-answer-orange", shape: "●" },
  { bg: "bg-answer-green", shape: "■" },
  { bg: "bg-answer-blue", shape: "◆" },
];

export function answerButtonStyle(index: number) {
  return STYLES[index % STYLES.length];
}

export default function AnswerButton({
  index,
  text,
  onClick,
  disabled,
  selected,
  dimmed,
}: {
  index: number;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  dimmed?: boolean;
}) {
  const style = answerButtonStyle(index);
  // Ring width/color utilities conflict if both a base and a "selected" ring class
  // are present at once — Tailwind doesn't guarantee JSX order wins for same-property
  // utilities, so keep these fully mutually exclusive rather than layering them.
  const ringClasses = selected
    ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-jet scale-[1.02] shadow-[0_0_28px_rgba(52,211,153,0.65)]"
    : "ring-1 ring-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`animate-pop-in group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-5 py-6 text-left text-lg font-bold text-white shadow-lg transition-all duration-150 ease-out disabled:cursor-not-allowed ${
        style.bg
      } ${ringClasses} ${dimmed ? "opacity-35 saturate-50" : "opacity-100"} ${
        !disabled
          ? "hover:-translate-y-0.5 hover:shadow-2xl hover:brightness-110 active:translate-y-0 active:scale-[0.97] active:brightness-95"
          : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span className="relative text-2xl leading-none drop-shadow-sm">{style.shape}</span>
      <span className="relative font-display">{text}</span>
    </button>
  );
}

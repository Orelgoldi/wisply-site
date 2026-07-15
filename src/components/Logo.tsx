import { clsx } from "clsx";

/**
 * Wisply logo — a rounded chat bubble holding an AI "spark".
 * variant: "full" (mark + wordmark) | "mark" (icon only)
 * tone: "color" | "white"
 */
export function Logo({
  variant = "full",
  tone = "color",
  className,
}: {
  variant?: "full" | "mark";
  tone?: "color" | "white";
  className?: string;
}) {
  const wordColor = tone === "white" ? "#ffffff" : "#0b1f24";
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark tone={tone} />
      {variant === "full" && (
        <span
          className="font-extrabold tracking-tight leading-none"
          style={{ color: wordColor, fontSize: "1.5rem" }}
        >
          Wisply
        </span>
      )}
    </span>
  );
}

function Mark({ tone }: { tone: "color" | "white" }) {
  const id = "wisply-grad";
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00c2bf" />
          <stop offset="1" stopColor="#007a7c" />
        </linearGradient>
      </defs>
      {/* chat bubble */}
      <path
        d="M12 4h16a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8h-6.3l-6.1 5.1a1.4 1.4 0 0 1-2.3-1.1V30H12a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z"
        fill={tone === "white" ? "#ffffff" : `url(#${id})`}
      />
      {/* AI spark */}
      <path
        d="M20 10.5c.5 3.2 1.8 4.5 5 5-3.2.5-4.5 1.8-5 5-.5-3.2-1.8-4.5-5-5 3.2-.5 4.5-1.8 5-5Z"
        fill={tone === "white" ? "#007a7c" : "#ffffff"}
      />
      {/* small secondary spark */}
      <circle cx="27.5" cy="21.5" r="1.6" fill={tone === "white" ? "#00b3b0" : "#bff4f2"} />
    </svg>
  );
}

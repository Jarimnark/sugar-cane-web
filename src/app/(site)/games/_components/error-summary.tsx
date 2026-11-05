interface ErrorSummaryProps {
  errors: Record<string, string>;
}

export default function ErrorSummary({ errors }: ErrorSummaryProps) {
  const count = Object.keys(errors).length;
  if (count === 0) return null;
  const word = count === 1 ? "error" : "errors";
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-[var(--color-danger-surface,#FBEDE7)] px-4 py-3 text-sm font-semibold text-[var(--color-danger,#9A4E39)]"
    >
      Fix {count} {word} below before submitting.
    </div>
  );
}

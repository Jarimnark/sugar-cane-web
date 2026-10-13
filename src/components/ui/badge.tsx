interface BadgeProps {
  label: string;
  variant?: "genre" | "platform" | "default";
}

export default function Badge({ label, variant = "default" }: BadgeProps) {
  const styles = {
    genre: "bg-accent/10 text-accent",
    platform: "bg-surface text-muted",
    default: "bg-surface text-muted",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

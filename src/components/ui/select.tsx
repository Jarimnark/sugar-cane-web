import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, invalid, className = "", ...rest },
  ref,
) {
  const classes = [
    "h-11 w-full rounded-xl border bg-surface px-4 pr-10 text-sm text-text outline-none transition-colors appearance-none",
    invalid ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative w-full">
      <select ref={ref} className={classes} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
});

export default Select;

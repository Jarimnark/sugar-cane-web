import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className = "", ...rest },
  ref,
) {
  const classes = [
    "h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text outline-none transition-colors placeholder:text-muted",
    invalid ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input ref={ref} className={classes} {...rest} />;
});

export default Input;

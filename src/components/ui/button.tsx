import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-accent text-text hover:opacity-90",
  secondary: "bg-bg text-text border border-border-strong hover:bg-surface",
  ghost: "bg-transparent text-text hover:bg-surface",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-nav rounded-full",
  lg: "h-12 px-6 text-base rounded-full",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth, className = "", type = "button", ...rest },
  ref,
) {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button ref={ref} type={type} className={classes} {...rest} />;
});

export default Button;

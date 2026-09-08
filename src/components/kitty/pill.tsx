const variants = {
  primary: "border-primary bg-primary text-white shadow-[0_8px_20px_rgba(255,127,178,0.35)]",
  outline: "border-border bg-surface text-muted",
  now: "border-now bg-surface text-now",
  soft: "border-border bg-surface-soft text-primary",
} as const;

const sizes = {
  sm: "min-h-10 px-4 text-[13px]",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
} as const;

type PillOptions = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  selected?: boolean;
  className?: string;
};

/** 알약(버튼/칩/탭) 클래스. Link 등엔 이 함수로 클래스만 가져다 씀. */
export function pillClass({ variant = "outline", size = "md", selected = false, className = "" }: PillOptions = {}) {
  return `inline-flex items-center justify-center gap-1.5 rounded-full border-2 font-display font-semibold transition-transform hover:-translate-y-px ${
    selected ? variants.primary : variants[variant]
  } ${sizes[size]} ${className}`;
}

export function Pill({
  variant,
  size,
  selected,
  className,
  type = "button",
  ...props
}: PillOptions & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={pillClass({ variant, size, selected, className })} {...props} />;
}

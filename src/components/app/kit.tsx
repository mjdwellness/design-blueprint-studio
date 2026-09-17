import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <div className="mb-2 text-sm text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        className,
      )}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

const toneMap = {
  blue: "bg-info-soft text-primary",
  green: "bg-success-soft text-success-foreground",
  orange: "bg-warning-soft text-warning-foreground",
  red: "bg-danger-soft text-danger-foreground",
  purple: "bg-purple-soft text-purple",
  gray: "bg-muted text-muted-foreground",
} as const;

export type Tone = keyof typeof toneMap;

export function Pill({
  children,
  tone = "gray",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "green" }: { tone?: Tone }) {
  const color = {
    green: "bg-success",
    orange: "bg-warning",
    red: "bg-danger",
    blue: "bg-primary",
    purple: "bg-purple",
    gray: "bg-muted-foreground",
  }[tone];
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}

export function StatCard({
  icon,
  tone = "blue",
  value,
  label,
  sub,
  delta,
  deltaTone = "green",
  children,
}: {
  icon: ReactNode;
  tone?: Tone | undefined;
  value: string;
  label: string;
  sub?: string | undefined;
  delta?: string | undefined;
  deltaTone?: Tone | undefined;
  children?: ReactNode | undefined;
}) {
  const iconBg = {
    blue: "bg-info-soft text-primary",
    green: "bg-success-soft text-success",
    orange: "bg-warning-soft text-warning",
    red: "bg-danger-soft text-danger",
    purple: "bg-purple-soft text-purple",
    gray: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex items-start gap-4">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", iconBg)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-2xl font-bold leading-tight text-foreground">{value}</div>
            {delta ? (
              <span
                className={cn(
                  "text-xs font-semibold",
                  deltaTone === "green" ? "text-success-foreground" : "text-danger-foreground",
                )}
              >
                {delta}
              </span>
            ) : null}
          </div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

const avatarTones = [
  "bg-info-soft text-primary",
  "bg-success-soft text-success-foreground",
  "bg-warning-soft text-warning-foreground",
  "bg-purple-soft text-purple",
  "bg-danger-soft text-danger-foreground",
];

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const tone = avatarTones[name.length % avatarTones.length];
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-border px-5 py-3 last:border-0", className)}>
      {children}
    </div>
  );
}

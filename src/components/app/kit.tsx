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
    <div className="mb-4 flex min-h-12 flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
      <div>
        {eyebrow ? <div className="mb-1 text-[11px] text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
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
        "overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      {title ? (
        <header className="flex h-11 items-center justify-between gap-3 border-b border-border px-4">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
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
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium",
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
  icon?: ReactNode;
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
    <div className="border-r border-border bg-surface px-4 py-3 last:border-r-0">
      <div className="flex items-center gap-3">
        {icon ? <div className={cn("flex size-8 shrink-0 items-center justify-center rounded", iconBg)}>{icon}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-lg font-semibold leading-tight text-foreground">{value}</div>
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
          <div className="text-[11px] text-muted-foreground">{label}</div>
          {sub ? <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div> : null}
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

import { AppShell } from "./app-shell";
import { PageHeader, Panel, Pill, StatCard, type Tone } from "./kit";
import type { ReactNode } from "react";

export type AdminStat = { value: string; label: string; sub?: string; tone?: Tone; icon: ReactNode };

export function AdminListPage({
  title,
  subtitle,
  action,
  stats,
  columns,
  rows,
  statusIndex,
  statusTones,
  aside,
}: {
  title: string;
  subtitle: string;
  action?: string;
  stats: AdminStat[];
  columns: string[];
  rows: string[][];
  statusIndex?: number;
  statusTones?: Tone[];
  aside?: ReactNode;
}) {
  return (
    <AppShell variant="admin" searchPlaceholder="Search the platform...">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          action ? (
            <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {action}
            </button>
          ) : undefined
        }
      />

      {stats.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} tone={s.tone ?? "blue"} value={s.value} label={s.label} sub={s.sub} />
          ))}
        </div>
      ) : null}

      <div className={aside ? "mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]" : "mt-6"}>
        <Panel title={title} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c} className="px-5 py-3 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                    {r.map((cell, j) => (
                      <td key={j} className={`px-5 py-3 ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {statusIndex === j ? <Pill tone={statusTones?.[i] ?? "gray"}>{cell}</Pill> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        {aside}
      </div>
    </AppShell>
  );
}

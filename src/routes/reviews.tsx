import { createFileRoute } from "@tanstack/react-router";
import { Send, Star, ThumbsUp, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Track patient reviews, request feedback and respond to comments about MJD Wellness.",
      },
      { property: "og:title", content: "Reviews | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Patient reviews, ratings and feedback requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewsPage,
});

const reviews = [
  { name: "Sarah Johnson", rating: 5, text: "Front desk was welcoming and Dr. Smith never rushes an appointment.", date: "Today", source: "Google", tone: "green" as const },
  { name: "Robert Chen", rating: 4, text: "Easy check-in with the digital forms. Wait was a little long.", date: "Yesterday", source: "Google", tone: "green" as const },
  { name: "Emily Davis", rating: 5, text: "Got a text reminder and a call back the same day. Great service.", date: "Sep 15", source: "Healthgrades", tone: "green" as const },
  { name: "Michael Brown", rating: 3, text: "Care was good but billing took a while to sort out.", date: "Sep 13", source: "Google", tone: "orange" as const },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-4 ${i <= n ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

function ReviewsPage() {
  return (
    <AppShell searchPlaceholder="Search reviews...">
      <PageHeader
        title="Reviews"
        subtitle="Ask happy patients for feedback and respond to what they say."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Send className="size-4" /> Request Reviews
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Star className="size-5" />} tone="orange" value="4.8" label="Average rating" sub="Across 312 reviews" />
        <StatCard icon={<TrendingUp className="size-5" />} tone="green" value="28" label="New reviews" sub="Last 30 days" delta="+9%" />
        <StatCard icon={<Send className="size-5" />} tone="blue" value="146" label="Requests sent" sub="42% response rate" />
        <StatCard icon={<ThumbsUp className="size-5" />} tone="purple" value="92%" label="4★ and above" />
      </div>

      <Panel className="mt-6" title="Recent Reviews" bodyClassName="p-0">
        <ul>
          {reviews.map((r) => (
            <li key={r.name + r.date} className="flex gap-4 border-b border-border px-5 py-4 last:border-0">
              <Initials name={r.name} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{r.name}</span>
                  <Stars n={r.rating} />
                  <Pill tone={r.tone}>{r.source}</Pill>
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
                <button className="mt-2 text-xs font-medium text-primary">Reply</button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

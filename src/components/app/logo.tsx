export function LeafMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 8c9 0 16 5 16 5s-1 18-12 22c-2 .7-4 .9-5.7.8"
        stroke="currentColor"
        strokeWidth="0"
      />
      <path
        d="M40 10s-14-3-22 4c-6 5.3-6 14 0 18 2 1.3 4 2 4 2s-1-9 4-14 14-10 14-10z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M39 9c-1 7-5 13-11 16-3 1.5-6 2-6 2s2-8 7-12 10-6 10-6z"
        fill="currentColor"
      />
      <path d="M13 34c2-8 7-14 14-18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M14 30c-3 3-4 7-3 10 3 .5 6-.7 8-3.4"
        fill="currentColor"
      />
    </svg>
  );
}

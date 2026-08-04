export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 pb-24">
      <div className="flex items-center justify-between py-4">
        <div className="h-6 w-32 rounded-full bg-cream-200" />
      </div>
      <div className="mb-4 h-8 w-56 rounded-full bg-cream-200" />
      <div className="mb-6 h-11 rounded-full bg-cream-200" />
      <div className="mb-4 flex gap-1.5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-cream-200" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-tile bg-cream-200" />
        ))}
      </div>
    </div>
  );
}

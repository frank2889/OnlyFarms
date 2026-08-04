export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 pb-24">
      <div className="flex items-center justify-between py-4">
        <div className="h-6 w-32 rounded-full bg-cream-200" />
        <div className="h-5 w-28 rounded-full bg-cream-200" />
      </div>
      <div className="mb-2 h-4 w-40 rounded-full bg-cream-200" />
      <div className="mb-2 h-8 w-2/3 rounded-full bg-cream-200" />
      <div className="mb-5 h-4 w-1/2 rounded-full bg-cream-200" />
      <div className="mb-5 flex gap-2">
        <div className="h-11 w-24 rounded-full bg-cream-200" />
        <div className="h-11 w-24 rounded-full bg-cream-200" />
      </div>
      <div className="mb-5 h-28 rounded-tile bg-cream-200" />
      <div className="mb-5 flex gap-2 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 w-32 shrink-0 rounded-tile bg-cream-200" />
        ))}
      </div>
      <div className="h-40 rounded-tile bg-cream-200" />
    </div>
  );
}

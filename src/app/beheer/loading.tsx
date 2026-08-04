export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 pb-24 pt-4">
      <div className="mb-4 h-7 w-40 rounded-full bg-cream-200" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 rounded-tile bg-cream-200" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-tile bg-cream-200" />
        ))}
      </div>
    </div>
  );
}

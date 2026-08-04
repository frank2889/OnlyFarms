export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 pb-24">
      <div className="flex items-center justify-between py-4">
        <div className="h-7 w-40 rounded-full bg-cream-200" />
      </div>
      <div className="mb-4 h-16 rounded-tile bg-cream-200" />
      <div className="mb-2 h-5 w-32 rounded-full bg-cream-200" />
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-tile bg-cream-200" />
        ))}
      </div>
    </div>
  );
}

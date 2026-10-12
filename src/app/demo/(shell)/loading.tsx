export default function Loading() {
  return (
    <div aria-busy className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-72 max-w-full rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 pt-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

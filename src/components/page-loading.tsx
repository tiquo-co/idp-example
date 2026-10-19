// Shown while the session-dependent part of a page streams in.
export function PageLoading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-foreground/[0.06]" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-foreground/[0.05]" />
      <div className="h-32 w-full animate-pulse rounded-2xl bg-foreground/[0.04]" />
    </div>
  );
}

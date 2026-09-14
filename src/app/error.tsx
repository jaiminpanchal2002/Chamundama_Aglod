"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-temple-gradient p-8 text-center text-temple-cream">
      <span className="text-6xl text-temple-gold">ॐ</span>
      <h1 className="mt-6 font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-temple-cream/70">
        Please try again in a moment.
      </p>
      <button onClick={reset} className="btn-gold mt-8">
        Try again
      </button>
    </div>
  );
}

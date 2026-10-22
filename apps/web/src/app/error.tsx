"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Could not load RFQs</h1>
      <p className="text-sm text-zinc-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </main>
  );
}

import { Suspense } from "react";

import { fetchRfqs } from "@/rfqs/fetch-rfqs";
import { RfqBrowser } from "@/rfqs/rfq-browser";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { date } = await searchParams;
  const requestedDate = typeof date === "string" ? date : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">DIBBS RFQ Finder</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Today&apos;s DLA Requests for Quotation — search, filter, and open
            the ones worth quoting.
          </p>
        </div>
        <form className="flex items-end gap-2 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Issue date</span>
            <input
              type="date"
              name="date"
              defaultValue={requestedDate}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Load
          </button>
        </form>
      </header>

      <Suspense
        key={requestedDate ?? "latest"}
        fallback={
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600">
            Pulling RFQs from DIBBS… A day that was never loaded before takes
            about a minute; after that it is instant.
          </p>
        }
      >
        <Rfqs date={requestedDate} />
      </Suspense>
    </main>
  );
}

async function Rfqs({ date }: { date?: string }) {
  const result = await fetchRfqs(date);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm text-zinc-600 dark:text-zinc-400">
        Issued on <strong>{result.date}</strong>
      </h2>
      <RfqBrowser rfqs={result.rfqs} />
    </section>
  );
}

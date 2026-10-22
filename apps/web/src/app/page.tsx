import { Suspense } from "react";

import { fetchRfqs } from "@/rfqs/fetch-rfqs";
import { RfqBrowser } from "@/rfqs/rfq-browser";
import type { RfqCriteria } from "@/rfqs/filter-rfqs";
import {
  criteriaFromSearchParams,
  sortFromSearchParams,
} from "@/rfqs/rfq-search-params";
import type { RfqSort } from "@/rfqs/sort-rfqs";

type SearchParams = PageProps<"/">["searchParams"];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">DIBBS RFQ Finder</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Today&apos;s DLA Requests for Quotation — search, filter, and open
            the ones worth quoting.
          </p>
        </div>
        <Suspense fallback={<DateForm />}>
          <DateFormForRequest searchParams={searchParams} />
        </Suspense>
      </header>

      <Suspense fallback={<Loading />}>
        <RfqSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function requestedDate(
  searchParams: SearchParams,
): Promise<string | undefined> {
  const { date } = await searchParams;
  return typeof date === "string" && date !== "" ? date : undefined;
}

async function DateFormForRequest({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return <DateForm date={await requestedDate(searchParams)} />;
}

function DateForm({ date }: { date?: string }) {
  return (
    <form className="flex items-end gap-2 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Issue date</span>
        <input
          type="date"
          name="date"
          defaultValue={date}
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
  );
}

async function RfqSection({ searchParams }: { searchParams: SearchParams }) {
  const date = await requestedDate(searchParams);
  const params = toUrlSearchParams(await searchParams);
  const criteria = criteriaFromSearchParams(params);
  const sort = sortFromSearchParams(params);

  // Keyed by date so picking another day shows the loading state again.
  return (
    <Suspense key={date ?? "latest"} fallback={<Loading />}>
      <Rfqs date={date} criteria={criteria} sort={sort} />
    </Suspense>
  );
}

function toUrlSearchParams(params: Awaited<SearchParams>): URLSearchParams {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") result.set(key, value);
  }
  return result;
}

async function Rfqs({
  date,
  criteria,
  sort,
}: {
  date?: string;
  criteria: RfqCriteria;
  sort: RfqSort;
}) {
  const result = await fetchRfqs(date);

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-sm text-zinc-600 dark:text-zinc-400">
        Issued on <strong>{result.date}</strong>
      </h2>
      <RfqBrowser
        rfqs={result.rfqs}
        initialCriteria={criteria}
        initialSort={sort}
      />
    </section>
  );
}

function Loading() {
  return (
    <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      Pulling RFQs from DIBBS… A day that was never loaded before takes about
      two minutes; after that it is instant.
    </p>
  );
}

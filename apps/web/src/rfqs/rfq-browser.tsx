"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ALL_RFQS, filterRfqs, type RfqCriteria } from "./filter-rfqs";
import type { Rfq } from "./rfq";

const CLOSING_WINDOWS = [3, 7, 14, 30];

interface RfqBrowserProps {
  rfqs: Rfq[];
  today?: Date;
}

export function RfqBrowser({ rfqs, today: todayProp }: RfqBrowserProps) {
  // Fixed for the component's lifetime so memoised filtering is not invalidated on every render.
  const [today] = useState(() => todayProp ?? new Date());
  const [criteria, setCriteria] = useState<RfqCriteria>(ALL_RFQS);
  // Keeps typing responsive while ~2k rows re-render.
  const deferredCriteria = useDeferredValue(criteria);
  const visible = useMemo(
    () => filterRfqs(rfqs, deferredCriteria, today),
    [rfqs, deferredCriteria, today],
  );
  const setAsides = useMemo(
    () => [...new Set(rfqs.map((rfq) => rfq.setAside).filter(Boolean))].sort(),
    [rfqs],
  );
  const update = (patch: Partial<RfqCriteria>) =>
    setCriteria((current) => ({ ...current, ...patch }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-4">
          <span className="font-medium">Search</span>
          <input
            type="search"
            placeholder="Solicitation, NSN, part name or PR…"
            value={criteria.query}
            onChange={(e) => update({ query: e.target.value })}
            className={inputClass}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Closes within</span>
          <select
            value={criteria.closesWithinDays ?? ""}
            onChange={(e) =>
              update({
                closesWithinDays:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className={inputClass}
          >
            <option value="">Any time</option>
            {CLOSING_WINDOWS.map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Set-aside</span>
          <select
            value={criteria.setAside}
            onChange={(e) => update({ setAside: e.target.value })}
            className={inputClass}
          >
            <option value="">All</option>
            {setAsides.map((setAside) => (
              <option key={setAside} value={setAside}>
                {setAside}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">FSC / FSG</span>
          <input
            inputMode="numeric"
            placeholder="e.g. 5905 or 59"
            value={criteria.fsc}
            onChange={(e) => update({ fsc: e.target.value.replace(/\D/g, "") })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Min quantity</span>
          <input
            type="number"
            min={0}
            value={criteria.minQuantity ?? ""}
            onChange={(e) =>
              update({
                minQuantity:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Technical documents</span>
          <select
            value={criteria.techDocs}
            onChange={(e) =>
              update({ techDocs: e.target.value as RfqCriteria["techDocs"] })
            }
            className={inputClass}
          >
            <option value="any">Any</option>
            <option value="with">Has tech docs</option>
            <option value="without">No tech docs</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={criteria.fastAwardOnly}
            onChange={(e) => update({ fastAwardOnly: e.target.checked })}
          />
          <span>Fast award only</span>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={criteria.includeClosed}
            onChange={(e) => update({ includeClosed: e.target.checked })}
          />
          <span>Include closed</span>
        </label>
        <div className="flex items-end justify-between gap-2">
          <p
            className="pb-2 text-sm text-zinc-600 dark:text-zinc-400"
            aria-live="polite"
          >
            {visible.length} of {rfqs.length} RFQs
          </p>
          <button
            type="button"
            onClick={() => setCriteria(ALL_RFQS)}
            className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-100 text-xs uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2">Solicitation</th>
              <th className="px-3 py-2">NSN</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2">Set-aside</th>
              <th className="px-3 py-2">Return by</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rfq) => (
              <tr
                key={`${rfq.solicitationNumber}-${rfq.nsn}-${rfq.purchaseRequest}`}
                className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  <a
                    href={rfq.packageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                  >
                    {rfq.solicitationNumber}
                  </a>
                  {rfq.fastAward && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 font-sans text-xs text-amber-800">
                      Fast award
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  {rfq.nsn}
                </td>
                <td className="px-3 py-2">
                  {rfq.nomenclature}
                  {rfq.hasTechnicalDocuments && (
                    <span className="ml-2 text-xs text-zinc-500">
                      · tech docs
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {rfq.quantity?.toLocaleString("en-US") ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs">{rfq.setAside}</td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                  {rfq.returnByDate}
                  <span className="ml-1 text-xs text-zinc-500">
                    ({daysUntil(rfq.returnByDate, today)}d)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">
            No RFQs match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950";

function daysUntil(isoDate: string, today: Date): number {
  const todayIso = today.toISOString().slice(0, 10);
  return Math.round(
    (Date.parse(isoDate) - Date.parse(todayIso)) / (24 * 60 * 60 * 1000),
  );
}

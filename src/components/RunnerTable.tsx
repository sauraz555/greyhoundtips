import type { Runner } from '@/types/database';
import { toNum, fmtPct, fmtPrice } from '@/lib/raceUtils';

interface Props {
  runners: Runner[];
}

export default function RunnerTable({ runners }: Props) {
  const sorted = [...runners].sort((a, b) => a.box - b.box);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
            <th className="py-2 pr-3 font-semibold">Box</th>
            <th className="py-2 pr-3 font-semibold">Runner</th>
            <th className="py-2 pr-3 font-semibold">Trainer</th>
            <th className="py-2 pr-3 text-right font-semibold">Price</th>
            <th className="py-2 pr-3 text-right font-semibold">Win %</th>
            <th className="py-2 text-right font-semibold">Top 4 %</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-ink-100 transition-colors hover:bg-ink-50 ${
                r.is_false_fav ? 'bg-amber-50/50' : ''
              }`}
            >
              <td className="py-2.5 pr-3">
                <span className="mono inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink-900 font-bold text-ink-50">
                  {r.box}
                </span>
              </td>
              <td className="py-2.5 pr-3">
                <span className="font-medium text-ink-900">{r.name}</span>
                {r.is_false_fav && (
                  <span className="ml-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                    False Fav
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-3 text-ink-500">{r.trainer ?? '—'}</td>
              <td className="mono py-2.5 pr-3 text-right text-ink-700">
                {fmtPrice(r.price)}
              </td>
              <td className="mono py-2.5 pr-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${toNum(r.win_pct)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-ink-700">
                    {fmtPct(r.win_pct)}
                  </span>
                </div>
              </td>
              <td className="mono py-2.5 text-right text-ink-500">
                {fmtPct(r.top4_pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

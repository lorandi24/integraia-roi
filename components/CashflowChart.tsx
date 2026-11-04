import type { MonthPoint } from "@/lib/roi";
import { moneyShort } from "@/lib/format";

/**
 * Flujo acumulado (inversión + ahorros netos) en SVG puro, renderizado en servidor:
 * cero JavaScript en el cliente.
 */
export default function CashflowChart({ points, payback }: { points: MonthPoint[]; payback: number | null }) {
  const W = 640;
  const H = 240;
  const pad = { l: 56, r: 30, t: 24, b: 32 };
  const data = [{ month: 0, cumulative: points.length ? points[0].cumulative - points[0].netSavings : 0 }, ...points];

  const ys = data.map((p) => p.cumulative);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(0, ...ys);
  const span = maxY - minY || 1;
  const maxX = data[data.length - 1].month;

  const x = (m: number) => pad.l + (m / maxX) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((maxY - v) / span) * (H - pad.t - pad.b);

  const line = data.map((p, i) => `${i ? "L" : "M"}${x(p.month).toFixed(1)},${y(p.cumulative).toFixed(1)}`).join(" ");
  const area = `${line} L${x(maxX).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const ticks = Array.from(new Set([minY, 0, maxY].map((v) => Math.round(v / 1000) * 1000)));
  const xTicks = data.filter((p) => p.month % (maxX > 12 ? 6 : 3) === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Flujo acumulado mes a mes">
      <defs>
        <linearGradient id="cf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cf-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.08" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity="0.55">
            {moneyShort(t)}
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 4" />

      <path d={area} fill="url(#cf-area)" />
      <path d={line} fill="none" stroke="url(#cf-line)" strokeWidth="2.5" strokeLinejoin="round" />

      {payback !== null && payback <= maxX && (
        <g>
          <line x1={x(payback)} x2={x(payback)} y1={pad.t} y2={H - pad.b} stroke="#22D3EE" strokeOpacity="0.6" />
          <circle cx={x(payback)} cy={y(0)} r="5" fill="#22D3EE" />
          <text
            x={Math.min(x(payback) + 8, W - pad.r - 110)}
            y={pad.t - 8}
            fontSize="11"
            fill="#22D3EE"
            fontWeight="600"
          >
            Recuperas tu inversión
          </text>
        </g>
      )}

      {xTicks.map((p) => (
        <text key={p.month} x={x(p.month)} y={H - 10} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.55">
          {p.month === 0 ? "Hoy" : `Mes ${p.month}`}
        </text>
      ))}
    </svg>
  );
}

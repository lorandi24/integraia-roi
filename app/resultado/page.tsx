import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CashflowChart from "@/components/CashflowChart";
import ResultActions from "@/components/ResultActions";
import { calculateRoi, inputToParams, paramsToInput } from "@/lib/roi";
import { integer, money, oneDecimal, paybackLabel } from "@/lib/format";
import { buildSummary } from "@/lib/summary";

export const metadata: Metadata = {
  title: "Tu ROI de IA – IntegraIA by EMET",
  robots: { index: false },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ResultadoPage({ searchParams }: { searchParams: SP }) {
  const input = paramsToInput(await searchParams);
  if (!input) redirect("/calculadora");

  const r = calculateRoi(input);
  const editHref = `/calculadora?${inputToParams(r.input).toString()}`;
  const positive = r.netSavingsMonth > 0;
  const remainingManualCost = r.monthlyManualCost - r.grossSavingsMonth;
  const costWithAi = remainingManualCost + r.runningCostMonth;
  const barMax = Math.max(r.monthlyManualCost, costWithAi, 1);
  const horizon = r.paybackMonths !== null && r.paybackMonths > 10 ? 24 : 12;
  const verdict = getVerdict(r.paybackMonths, r.roi12, positive);

  return (
    <div className="relative">
      <div className="glow-bg no-print pointer-events-none absolute inset-x-0 top-0 h-[480px]" aria-hidden />

      <div className="print-plain relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Encabezado */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="print-accent text-xs font-semibold uppercase tracking-[0.18em] text-cyan-glow">
              Tu resultado · {r.sector.label}
            </p>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {r.improvement.icon} {r.improvement.label}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">{verdict}</p>
          </div>
          <Link href={editHref} className="btn-ghost no-print shrink-0 self-start lg:self-auto">
            ✎ Editar datos
          </Link>
        </div>

        {/* KPIs principales */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi
            highlight
            label="Ahorro neto mensual"
            value={money(r.netSavingsMonth)}
            note={`Ya descontando ${money(r.runningCostMonth)}/mes de operación`}
          />
          <Kpi label="Ahorro neto anual (año 1)" value={money(r.annualSavings)} note={`A partir del año 2: ${money(r.annualSavingsSteady)}/año`} />
          <Kpi
            label="Horas ahorradas al mes"
            value={`${integer(r.hoursSavedMonth)} h`}
            note={`≈ ${oneDecimal(r.fteFreed)} persona(s) de tiempo completo liberada(s)`}
          />
          <Kpi
            label="Inversión estimada"
            value={`${money(r.investmentLow)} – ${money(r.investmentHigh)}`}
            note="Implementación única, rango típico para una pyme"
            small
          />
          <Kpi highlight label="Recuperas la inversión en" value={paybackLabel(r.paybackMonths)} note="Considerando 2 meses de arranque" />
          <Kpi
            highlight
            label="ROI a 12 meses"
            value={`${integer(r.roi12)}%`}
            note={r.roi12 >= 0 ? "Retorno sobre la inversión en el primer año" : "Aún negativo en el primer año"}
            negative={r.roi12 < 0}
          />
        </section>

        {/* Visuales */}
        <section className="mt-6 grid gap-4 lg:grid-cols-5">
          <div className="card break-avoid p-5 sm:p-6 lg:col-span-2">
            <h2 className="font-semibold text-white">Costo mensual de estas tareas</h2>
            <p className="mt-1 text-sm text-slate-400">Hoy vs. con IA (incluye el costo de la herramienta).</p>
            <div className="mt-6 space-y-5">
              <Bar label="Hoy (manual)" value={r.monthlyManualCost} max={barMax} muted />
              <Bar label="Con IA" value={costWithAi} max={barMax} />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-5 text-sm">
              <Stat k="Horas manuales hoy" v={`${integer(r.monthlyManualHours)} h/mes`} />
              <Stat k="Costo por hora" v={money(r.hourlyCost)} />
              <Stat k="Automatización estimada" v={`${integer(r.automationRate * 100)}%`} />
              <Stat k="Operación mensual" v={money(r.runningCostMonth)} />
            </dl>
          </div>

          <div className="card break-avoid p-5 sm:p-6 lg:col-span-3">
            <h2 className="font-semibold text-white">Tu dinero mes a mes</h2>
            <p className="mt-1 text-sm text-slate-400">
              Empiezas en negativo por la inversión; cuando la línea cruza el cero, la IA ya se pagó sola.
            </p>
            <div className="mt-4 text-slate-300">
              <CashflowChart points={r.timeline.slice(0, horizon)} payback={r.paybackMonths} />
            </div>
          </div>
        </section>

        {/* Explicación sencilla */}
        <section className="card break-avoid mt-6 p-5 sm:p-8">
          <h2 className="font-semibold text-white">¿Cómo llegamos a estos números?</h2>
          <ol className="mt-4 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <Explain n={1}>
              Tu equipo dedica <b>{integer(r.input.weeklyHours)} h/semana</b> a tareas manuales, es decir{" "}
              <b>{integer(r.monthlyManualHours)} h al mes</b>, con un costo de <b>{money(r.monthlyManualCost)}</b>.
            </Explain>
            <Explain n={2}>
              Con <b>{r.improvement.short}</b>, una pyme de tu giro y volumen ({integer(r.input.monthlyVolume)}{" "}
              {r.improvement.volumeLabel}) automatiza de forma realista el <b>{integer(r.automationRate * 100)}%</b> de
              ese tiempo: <b>{integer(r.hoursSavedMonth)} h/mes</b>.
            </Explain>
            <Explain n={3}>
              Eso equivale a <b>{money(r.grossSavingsMonth)}</b> al mes. Restamos <b>{money(r.runningCostMonth)}</b> de
              licencias, API y soporte: ahorro neto de <b>{money(r.netSavingsMonth)}</b>.
            </Explain>
            <Explain n={4}>
              Usamos la inversión media (<b>{money(r.investment)}</b>) y una curva de arranque (mes 1 sin ahorro, mes 2
              al 50%). Así obtenemos un ROI a 12 meses de <b>{integer(r.roi12)}%</b>.
            </Explain>
          </ol>
          <p className="mt-6 text-xs text-slate-500">
            Estimación orientativa con supuestos conservadores. El tiempo liberado no siempre implica reducir personal:
            normalmente se reinvierte en vender, atender mejor y crecer. Una cotización formal requiere un diagnóstico.
          </p>
        </section>

        {/* Acciones */}
        <section className="no-print mt-8 flex flex-col items-start gap-4 rounded-2xl border border-cyan-glow/20 bg-gradient-to-br from-cyan-glow/[0.07] to-teal-brand/[0.04] p-5 sm:p-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">¿Quieres aterrizar estos números en tu negocio?</h2>
            <p className="mt-1 text-sm text-slate-300">
              Envíanos tu resultado y te proponemos un plan de implementación sin costo.
            </p>
          </div>
          <ResultActions summary={buildSummary(r)} />
        </section>
      </div>
    </div>
  );
}

function getVerdict(payback: number | null, roi12: number, positive: boolean) {
  if (!positive)
    return "Con estos datos, el costo de operar la herramienta supera el ahorro. Conviene evaluar otra mejora o un proceso con más horas manuales.";
  if (payback === null) return "El ahorro es positivo pero la recuperación es lenta (más de 3 años). Vale la pena empezar con una versión más acotada.";
  if (payback <= 6)
    return `Excelente candidato: la inversión se recupera en ${paybackLabel(payback)} y el primer año deja un ROI de ${integer(roi12)}%.`;
  if (payback <= 12) return `Buen proyecto: recuperas la inversión antes de cumplir un año (${paybackLabel(payback)}).`;
  return `Proyecto viable a mediano plazo: recuperas la inversión en ${paybackLabel(payback)}. Una implementación por fases puede acelerarlo.`;
}

function Kpi({
  label,
  value,
  note,
  highlight,
  small,
  negative,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
  small?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`card break-avoid relative overflow-hidden p-5 sm:p-6 ${
        highlight ? "border-cyan-glow/25 shadow-[0_0_40px_-20px_rgba(34,211,238,0.6)]" : ""
      }`}
    >
      {highlight && (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/70 to-transparent" aria-hidden />
      )}
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={`mt-2 font-semibold tracking-tight ${small ? "text-2xl sm:text-[1.7rem]" : "text-3xl sm:text-4xl"} ${
          negative ? "text-rose-300" : highlight ? "print-accent text-cyan-glow" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function Bar({ label, value, max, muted }: { label: string; value: number; max: number; muted?: boolean }) {
  const pct = Math.max(2, (Math.max(value, 0) / max) * 100);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{money(value)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${
            muted ? "print-bar-muted bg-slate-500/70" : "print-bar bg-gradient-to-r from-cyan-electric to-teal-brand"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="mt-0.5 font-medium text-white">{v}</dd>
    </div>
  );
}

function Explain({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="print-accent grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-glow/10 font-mono text-xs text-cyan-glow">
        {n}
      </span>
      <span className="[&_b]:font-semibold [&_b]:text-white">{children}</span>
    </li>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  HOURS_PER_MONTH_FULLTIME,
  IMPROVEMENTS,
  SECTORS,
  SOCIAL_LOAD,
  WEEKS_PER_MONTH,
  inputToParams,
  type RoiInput,
} from "@/lib/roi";
import { money } from "@/lib/format";

const STEPS = ["Tu negocio", "Tiempo y costo", "Qué mejorar"] as const;
const HOUR_PRESETS = [10, 20, 40, 80];
const VOLUME_PRESETS = [50, 200, 500, 1500];

type Draft = Omit<RoiInput, "people" | "weeklyHours" | "costValue" | "monthlyVolume"> & {
  people: string;
  weeklyHours: string;
  costValue: string;
  monthlyVolume: string;
};

const toDraft = (i: RoiInput): Draft => ({
  ...i,
  people: String(i.people),
  weeklyHours: String(i.weeklyHours),
  costValue: String(i.costValue),
  monthlyVolume: String(i.monthlyVolume),
});

const n = (v: string) => {
  const x = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(x) ? x : 0;
};

export default function Wizard({ initial }: { initial: RoiInput }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(() => toDraft(initial));
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const people = n(d.people);
  const hours = n(d.weeklyHours);
  const cost = n(d.costValue);
  const volume = n(d.monthlyVolume);

  const hourly = d.costMode === "sueldo" ? (cost / HOURS_PER_MONTH_FULLTIME) * SOCIAL_LOAD : cost;
  const currentMonthlyCost = hours * WEEKS_PER_MONTH * hourly;

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Draft, string>> = {};
    if (people < 1) e.people = "Indica al menos 1 persona.";
    if (people > 500) e.people = "Esta calculadora está pensada para pymes (hasta 500 personas).";
    if (volume <= 0) e.monthlyVolume = "Indica un volumen aproximado.";
    if (hours <= 0) e.weeklyHours = "Indica cuántas horas a la semana.";
    else if (hours > Math.max(people, 1) * 60)
      e.weeklyHours = `Con ${people || 1} persona(s), el máximo razonable es ${Math.max(people, 1) * 60} h/semana.`;
    if (cost <= 0) e.costValue = "Indica un monto aproximado.";
    else if (d.costMode === "hora" && cost > 2000) e.costValue = "Revisa el monto: parece alto para costo por hora.";
    else if (d.costMode === "sueldo" && cost < 1000) e.costValue = "¿Es sueldo mensual? Parece bajo.";
    return e;
  }, [people, volume, hours, cost, d.costMode]);

  const stepValid = [
    !errors.people && !errors.monthlyVolume,
    !errors.weeklyHours && !errors.costValue,
    Boolean(d.improvement),
  ];

  const selectedImprovement = IMPROVEMENTS.find((i) => i.id === d.improvement);

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    const input: RoiInput = {
      sector: d.sector,
      improvement: d.improvement,
      costMode: d.costMode,
      people: Math.round(people),
      weeklyHours: hours,
      costValue: cost,
      monthlyVolume: Math.round(volume),
    };
    router.push(`/resultado?${inputToParams(input).toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Progreso */}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="group w-full text-left disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span
                className={`block h-1 rounded-full transition-colors ${
                  i <= step ? "bg-gradient-to-r from-cyan-electric to-teal-brand" : "bg-white/10"
                }`}
              />
              <span className={`mt-2 block text-xs sm:text-sm ${i === step ? "text-white" : "text-slate-500"}`}>
                <span className="font-mono text-cyan-glow/80">{i + 1}.</span> {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <form
        className="card p-5 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (stepValid[step]) next();
        }}
      >
        {step === 0 && (
          <div className="space-y-7">
            <Header title="Cuéntanos de tu negocio" subtitle="Con datos aproximados es suficiente." />

            <div>
              <span className="label">Giro o sector</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SECTORS.map((s) => (
                  <Chip key={s.id} active={d.sector === s.id} onClick={() => set("sector", s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            <NumberField
              id="people"
              label="Personas involucradas en el proceso a mejorar"
              hint="Solo quienes hacen estas tareas, no toda la plantilla."
              value={d.people}
              onChange={(v) => set("people", v)}
              error={errors.people}
              suffix="personas"
            />

            <div>
              <NumberField
                id="volume"
                label="Volumen aproximado de operaciones al mes"
                hint="Pedidos, clientes atendidos, facturas, movimientos… lo que más se repita."
                value={d.monthlyVolume}
                onChange={(v) => set("monthlyVolume", v)}
                error={errors.monthlyVolume}
                suffix="al mes"
              />
              <Presets values={VOLUME_PRESETS} current={volume} onPick={(v) => set("monthlyVolume", String(v))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <Header
              title="Tiempo y costo actual"
              subtitle="Atención a clientes, inventarios, reportes, facturación, captura de datos…"
            />

            <div>
              <NumberField
                id="hours"
                label="Horas por semana dedicadas a tareas manuales (sumando a todo el equipo)"
                hint={`Ejemplo: 2 personas × 3 h al día × 6 días ≈ 36 h/semana.`}
                value={d.weeklyHours}
                onChange={(v) => set("weeklyHours", v)}
                error={errors.weeklyHours}
                suffix="h/semana"
              />
              <Presets values={HOUR_PRESETS} current={hours} onPick={(v) => set("weeklyHours", String(v))} unit="h" />
            </div>

            <div>
              <span className="label">¿Cómo prefieres indicar el costo?</span>
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-ink-800/80 p-1">
                {(
                  [
                    ["sueldo", "Sueldo mensual"],
                    ["hora", "Costo por hora"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode === d.costMode) return;
                      // Convierte el valor para no perder la referencia
                      const converted =
                        mode === "hora"
                          ? Math.round((cost / HOURS_PER_MONTH_FULLTIME) * SOCIAL_LOAD)
                          : Math.round((cost * HOURS_PER_MONTH_FULLTIME) / SOCIAL_LOAD / 100) * 100;
                      setD((p) => ({ ...p, costMode: mode, costValue: String(converted || "") }));
                    }}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      d.costMode === mode ? "bg-cyan-glow/15 text-cyan-glow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <NumberField
                id="cost"
                label={d.costMode === "sueldo" ? "Sueldo mensual promedio por persona (bruto)" : "Costo promedio por hora"}
                hint={
                  d.costMode === "sueldo"
                    ? "Sumamos ~30% de carga social (IMSS, aguinaldo, vacaciones). Referencia: auxiliar administrativo $9,000–$15,000."
                    : "Costo real para la empresa por hora trabajada. Referencia: $55–$120 MXN."
                }
                value={d.costValue}
                onChange={(v) => set("costValue", v)}
                error={errors.costValue}
                prefix="$"
                suffix="MXN"
              />
            </div>

            {!errors.weeklyHours && !errors.costValue && (
              <div className="rounded-xl border border-cyan-glow/20 bg-cyan-glow/5 p-4 text-sm text-slate-300">
                Hoy estas tareas le cuestan a tu negocio aprox.{" "}
                <strong className="text-white">{money(currentMonthlyCost)} al mes</strong>{" "}
                <span className="text-slate-400">({money(hourly)} por hora)</span>.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Header title="¿Qué quieres mejorar con IA?" subtitle="Elige la mejora que quieres evaluar primero." />
            <div className="grid gap-3 sm:grid-cols-2">
              {IMPROVEMENTS.map((imp) => {
                const active = d.improvement === imp.id;
                return (
                  <button
                    key={imp.id}
                    type="button"
                    onClick={() => set("improvement", imp.id)}
                    aria-pressed={active}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-cyan-glow/60 bg-cyan-glow/[0.07] shadow-glow"
                        : "border-white/10 bg-ink-800/50 hover:border-white/25"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {imp.icon}
                    </span>
                    <span className="mt-2 block font-medium text-white">{imp.label}</span>
                    <span className="mt-1 block text-sm text-slate-400">{imp.description}</span>
                  </button>
                );
              })}
            </div>
            {selectedImprovement && (
              <p className="text-xs text-slate-400">
                Tu volumen se interpretará como {integerLabel(volume)} {selectedImprovement.volumeLabel}.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
          {step > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
              ← Atrás
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn-primary" disabled={!stepValid[step] || submitting}>
            {step < STEPS.length - 1 ? "Continuar →" : submitting ? "Calculando…" : "Ver mis resultados"}
          </button>
        </div>
      </form>
    </div>
  );
}

const integerLabel = (v: number) => new Intl.NumberFormat("es-MX").format(Math.round(v));

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
      <p className="mt-1 text-slate-400">{subtitle}</p>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
        active
          ? "border-cyan-glow/60 bg-cyan-glow/10 text-white"
          : "border-white/10 bg-ink-800/50 text-slate-300 hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function Presets({
  values,
  current,
  onPick,
  unit = "",
}: {
  values: number[];
  current: number;
  onPick: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            current === v ? "border-cyan-glow/60 text-cyan-glow" : "border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          {integerLabel(v)}
          {unit && ` ${unit}`}
        </button>
      ))}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>
        )}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          className={`field ${prefix ? "pl-8" : ""} ${suffix ? "pr-24" : ""} ${error ? "border-rose-400/60" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      <p id={`${id}-hint`} className={error ? "mt-1.5 text-xs text-rose-300" : "hint"}>
        {error ?? hint}
      </p>
    </div>
  );
}

/**
 * Modelo de cálculo de ROI para proyectos de IA en pymes mexicanas.
 *
 * Supuestos (conservadores, en MXN):
 * - Un mes laboral = 4.33 semanas.
 * - Si se captura sueldo mensual, la hora se calcula sobre 208 h/mes (48 h/semana, LFT)
 *   y se suma ~30% de carga social (IMSS, INFONAVIT, aguinaldo, vacaciones, prima).
 * - La IA no elimina el 100% del trabajo: cada solución tiene una tasa de automatización
 *   realista, ajustada por sector y por volumen de operaciones, con tope de 70%.
 * - Hay curva de adopción: mes 1 = 0% (implementación), mes 2 = 50%, mes 3+ = 100%.
 * - Se descuenta el costo mensual de operación (licencias, API, WhatsApp Business, soporte).
 */

export const WEEKS_PER_MONTH = 4.33;
export const HOURS_PER_MONTH_FULLTIME = 208;
export const SOCIAL_LOAD = 1.3;
export const MAX_AUTOMATION = 0.7;
export const RAMP = [0, 0.5]; // meses 1 y 2; del 3 en adelante 100%

export type SectorId =
  | "comercio"
  | "restaurantes"
  | "servicios"
  | "salud"
  | "manufactura"
  | "educacion"
  | "logistica"
  | "inmobiliaria"
  | "otro";

export type ImprovementId =
  | "whatsapp"
  | "reportes"
  | "inventarios"
  | "facturacion"
  | "contenido"
  | "crm";

export interface Sector {
  id: SectorId;
  label: string;
  /** Multiplicador sobre la tasa de automatización (qué tan repetitivos suelen ser los procesos). */
  factor: number;
}

export interface Improvement {
  id: ImprovementId;
  label: string;
  short: string;
  description: string;
  /** Fracción de horas manuales que realistamente se eliminan. */
  automation: number;
  /** Inversión inicial (implementación) en MXN. */
  setup: [number, number];
  /** Costo mensual de operación en MXN. */
  monthly: [number, number];
  volumeLabel: string;
  icon: string;
}

export const SECTORS: Sector[] = [
  { id: "comercio", label: "Comercio / Retail", factor: 1.05 },
  { id: "restaurantes", label: "Restaurantes y alimentos", factor: 0.95 },
  { id: "servicios", label: "Servicios profesionales", factor: 1.05 },
  { id: "salud", label: "Salud / Consultorios", factor: 1.0 },
  { id: "manufactura", label: "Manufactura / Industria", factor: 0.95 },
  { id: "educacion", label: "Educación / Capacitación", factor: 1.05 },
  { id: "logistica", label: "Logística / Distribución", factor: 1.0 },
  { id: "inmobiliaria", label: "Inmobiliaria / Construcción", factor: 0.95 },
  { id: "otro", label: "Otro giro", factor: 1.0 },
];

export const IMPROVEMENTS: Improvement[] = [
  {
    id: "whatsapp",
    label: "Atención a clientes por WhatsApp con IA",
    short: "Atención por WhatsApp",
    description: "Asistente que responde preguntas frecuentes, cotiza y agenda 24/7.",
    automation: 0.45,
    setup: [25000, 60000],
    monthly: [1500, 4000],
    volumeLabel: "conversaciones o clientes atendidos al mes",
    icon: "💬",
  },
  {
    id: "reportes",
    label: "Automatización de reportes",
    short: "Reportes automáticos",
    description: "Reportes de ventas, gastos y KPIs generados solos desde tus hojas o sistema.",
    automation: 0.65,
    setup: [20000, 50000],
    monthly: [800, 2000],
    volumeLabel: "registros o movimientos al mes",
    icon: "📊",
  },
  {
    id: "inventarios",
    label: "Control de inventarios inteligente",
    short: "Control de inventarios",
    description: "Existencias en tiempo real, alertas de reorden y pronóstico de demanda.",
    automation: 0.4,
    setup: [35000, 90000],
    monthly: [1500, 3500],
    volumeLabel: "movimientos de inventario al mes",
    icon: "📦",
  },
  {
    id: "facturacion",
    label: "Facturación (CFDI) y cobranza",
    short: "Facturación y cobranza",
    description: "Emisión de CFDI, conciliación y recordatorios de pago automáticos.",
    automation: 0.55,
    setup: [20000, 55000],
    monthly: [1000, 3000],
    volumeLabel: "facturas al mes",
    icon: "🧾",
  },
  {
    id: "contenido",
    label: "Generación de contenido y marketing",
    short: "Contenido con IA",
    description: "Posts, descripciones de producto, correos y campañas con tu tono de marca.",
    automation: 0.5,
    setup: [15000, 40000],
    monthly: [1000, 2500],
    volumeLabel: "piezas de contenido al mes",
    icon: "✨",
  },
  {
    id: "crm",
    label: "Seguimiento de clientes y ventas (CRM)",
    short: "Seguimiento de ventas",
    description: "Registro de prospectos, recordatorios y seguimiento automático de cotizaciones.",
    automation: 0.4,
    setup: [25000, 65000],
    monthly: [1200, 3000],
    volumeLabel: "prospectos o cotizaciones al mes",
    icon: "🎯",
  },
];

export type CostMode = "hora" | "sueldo";

export interface RoiInput {
  sector: SectorId;
  people: number;
  weeklyHours: number;
  costMode: CostMode;
  /** Costo por hora (MXN) o sueldo mensual bruto (MXN) según costMode. */
  costValue: number;
  monthlyVolume: number;
  improvement: ImprovementId;
}

export interface MonthPoint {
  month: number;
  netSavings: number;
  cumulative: number; // flujo acumulado (incluye inversión inicial negativa)
}

export interface RoiResult {
  input: RoiInput;
  sector: Sector;
  improvement: Improvement;
  hourlyCost: number;
  monthlyManualHours: number;
  monthlyManualCost: number;
  automationRate: number;
  hoursSavedMonth: number;
  grossSavingsMonth: number;
  runningCostMonth: number;
  netSavingsMonth: number;
  annualSavings: number; // neto, año 1 con curva de adopción
  annualSavingsSteady: number; // neto, a régimen (12 × mensual)
  investmentLow: number;
  investmentHigh: number;
  investment: number; // punto medio usado para cálculos
  paybackMonths: number | null; // null = no se recupera en 36 meses
  roi12: number; // %
  timeline: MonthPoint[];
  fteFreed: number; // equivalentes de tiempo completo liberados
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function volumeTier(volume: number) {
  // Más volumen => procesos más repetitivos (más automatizables) y más integración (más inversión)
  if (volume < 100) return { automation: 0.9, investment: 0.9 };
  if (volume < 500) return { automation: 1.0, investment: 1.0 };
  if (volume < 2000) return { automation: 1.08, investment: 1.15 };
  return { automation: 1.15, investment: 1.3 };
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function calculateRoi(input: RoiInput): RoiResult {
  const sector = SECTORS.find((s) => s.id === input.sector) ?? SECTORS[SECTORS.length - 1];
  const improvement = IMPROVEMENTS.find((i) => i.id === input.improvement) ?? IMPROVEMENTS[0];

  const people = clamp(Math.round(input.people) || 1, 1, 500);
  const weeklyHours = clamp(input.weeklyHours || 0, 0, people * 60);
  const hourlyCost =
    input.costMode === "sueldo"
      ? (clamp(input.costValue, 0, 1_000_000) / HOURS_PER_MONTH_FULLTIME) * SOCIAL_LOAD
      : clamp(input.costValue, 0, 10_000);

  const tier = volumeTier(input.monthlyVolume);

  const monthlyManualHours = weeklyHours * WEEKS_PER_MONTH;
  const monthlyManualCost = monthlyManualHours * hourlyCost;

  const automationRate = clamp(improvement.automation * sector.factor * tier.automation, 0, MAX_AUTOMATION);
  const hoursSavedMonth = monthlyManualHours * automationRate;
  const grossSavingsMonth = hoursSavedMonth * hourlyCost;

  // Costo de operación crece moderadamente con el tamaño del equipo/volumen
  const sizeFactor = clamp(1 + 0.04 * (people - 1), 1, 2);
  const runningCostMonth = roundTo(
    ((improvement.monthly[0] + improvement.monthly[1]) / 2) * Math.sqrt(sizeFactor * tier.investment),
    50,
  );
  const netSavingsMonth = grossSavingsMonth - runningCostMonth;

  const investmentLow = roundTo(improvement.setup[0] * sizeFactor * tier.investment, 1000);
  const investmentHigh = roundTo(improvement.setup[1] * sizeFactor * tier.investment, 1000);
  const investment = (investmentLow + investmentHigh) / 2;

  // Línea de tiempo de 36 meses con curva de adopción
  const timeline: MonthPoint[] = [];
  let cumulative = -investment;
  let paybackMonths: number | null = null;
  for (let m = 1; m <= 36; m++) {
    const adoption = RAMP[m - 1] ?? 1;
    // El costo mensual se paga desde el mes 1
    const net = grossSavingsMonth * adoption - runningCostMonth;
    const prev = cumulative;
    cumulative += net;
    if (paybackMonths === null && cumulative >= 0 && net > 0) {
      // Interpolación para un payback con decimales
      paybackMonths = m - 1 + (0 - prev) / net;
    }
    timeline.push({ month: m, netSavings: net, cumulative });
  }

  const year1Net = timeline.slice(0, 12).reduce((acc, p) => acc + p.netSavings, 0);
  const roi12 = investment > 0 ? ((year1Net - investment) / investment) * 100 : 0;

  return {
    input: { ...input, people, weeklyHours },
    sector,
    improvement,
    hourlyCost,
    monthlyManualHours,
    monthlyManualCost,
    automationRate,
    hoursSavedMonth,
    grossSavingsMonth,
    runningCostMonth,
    netSavingsMonth,
    annualSavings: year1Net,
    annualSavingsSteady: netSavingsMonth * 12,
    investmentLow,
    investmentHigh,
    investment,
    paybackMonths,
    roi12,
    timeline,
    fteFreed: hoursSavedMonth / (WEEKS_PER_MONTH * 40),
  };
}

/* ---------- Serialización en URL (resultados compartibles) ---------- */

export const DEFAULT_INPUT: RoiInput = {
  sector: "comercio",
  people: 3,
  weeklyHours: 60,
  costMode: "sueldo",
  costValue: 13000,
  monthlyVolume: 600,
  improvement: "whatsapp",
};

export function inputToParams(input: RoiInput): URLSearchParams {
  return new URLSearchParams({
    s: input.sector,
    p: String(input.people),
    h: String(input.weeklyHours),
    m: input.costMode,
    c: String(input.costValue),
    v: String(input.monthlyVolume),
    i: input.improvement,
  });
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function paramsToInput(params: RawParams): RoiInput | null {
  const s = first(params.s);
  const i = first(params.i);
  if (!s || !i) return null;
  if (!SECTORS.some((x) => x.id === s) || !IMPROVEMENTS.some((x) => x.id === i)) return null;
  const m = first(params.m) === "hora" ? "hora" : "sueldo";
  return {
    sector: s as SectorId,
    improvement: i as ImprovementId,
    people: num(first(params.p), DEFAULT_INPUT.people),
    weeklyHours: num(first(params.h), DEFAULT_INPUT.weeklyHours),
    costMode: m,
    costValue: num(first(params.c), DEFAULT_INPUT.costValue),
    monthlyVolume: num(first(params.v), DEFAULT_INPUT.monthlyVolume),
  };
}

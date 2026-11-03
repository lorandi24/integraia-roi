import type { RoiResult } from "./roi";
import { integer, money, paybackLabel } from "./format";

export const WHATSAPP_NUMBER = "5219992978891";

export function buildSummary(r: RoiResult): string {
  return [
    "📊 Calculadora de ROI de IA – IntegraIA by EMET",
    "",
    `Giro: ${r.sector.label}`,
    `Mejora evaluada: ${r.improvement.label}`,
    `Personas involucradas: ${r.input.people} · Horas manuales: ${integer(r.input.weeklyHours)} h/semana`,
    "",
    `⏱️ Horas ahorradas: ${integer(r.hoursSavedMonth)} h/mes`,
    `💰 Ahorro neto mensual: ${money(r.netSavingsMonth)}`,
    `📅 Ahorro neto anual (año 1): ${money(r.annualSavings)}`,
    `🧩 Inversión estimada: ${money(r.investmentLow)} – ${money(r.investmentHigh)}`,
    `🔁 Recuperación de la inversión: ${paybackLabel(r.paybackMonths)}`,
    `📈 ROI a 12 meses: ${integer(r.roi12)}%`,
  ].join("\n");
}

export function buildWhatsAppUrl(summary: string, pageUrl: string): string {
  const text = [
    "Hola, IntegraIA 👋 Usé la Calculadora de ROI de IA y me interesa platicar sobre este proyecto:",
    "",
    summary,
    "",
    `Ver resultado: ${pageUrl}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

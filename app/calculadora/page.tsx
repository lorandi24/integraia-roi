import type { Metadata } from "next";
import Wizard from "@/components/Wizard";
import { DEFAULT_INPUT, paramsToInput } from "@/lib/roi";

export const metadata: Metadata = {
  title: "Calcula tu ROI – IntegraIA by EMET",
};

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Permite "Editar datos" desde resultados conservando lo capturado
  const initial = paramsToInput(await searchParams) ?? DEFAULT_INPUT;
  return <Wizard initial={initial} />;
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const int = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
const dec1 = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

export const money = (n: number) => mxn.format(Math.round(n));
export const integer = (n: number) => int.format(Math.round(n));
export const oneDecimal = (n: number) => dec1.format(n);

/** $1.2 M / $350 k — para cifras compactas en gráficas */
export function moneyShort(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1_000_000) return `${sign}$${dec1.format(a / 1_000_000)} M`;
  if (a >= 1_000) return `${sign}$${int.format(a / 1_000)} k`;
  return `${sign}$${int.format(a)}`;
}

export function paybackLabel(months: number | null) {
  if (months === null) return "Más de 36 meses";
  if (months < 1) return "Menos de 1 mes";
  return `${oneDecimal(months)} meses`;
}

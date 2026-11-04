import Image from "next/image";
import Link from "next/link";
import logoFull from "@/public/logo-integraia-full.webp";

const steps = [
  { n: "01", title: "Cuéntanos de tu negocio", text: "Giro, equipo y horas que hoy se van en tareas manuales." },
  { n: "02", title: "Elige qué mejorar", text: "WhatsApp, reportes, inventarios, facturación, contenido o ventas." },
  { n: "03", title: "Recibe tus números", text: "Ahorro mensual y anual, inversión sugerida y en cuánto la recuperas." },
];

const outputs = [
  "Horas ahorradas al mes",
  "Ahorro mensual y anual",
  "Inversión sugerida",
  "Meses para recuperarla",
  "ROI a 12 meses",
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="glow-bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-grid [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-16">
        <Image
          src={logoFull}
          alt="IntegraIA by EMET"
          priority
          placeholder="blur"
          sizes="(min-width: 640px) 200px, 150px"
          className="mx-auto mb-8 h-auto w-[150px] drop-shadow-[0_0_40px_rgba(34,211,238,0.25)] sm:w-[200px]"
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/25 bg-cyan-glow/5 px-3 py-1 text-xs font-medium text-cyan-glow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" />
          Gratis · 2 minutos · Sin registro
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          ¿Cuánto le ahorraría la{" "}
          <span className="bg-gradient-to-r from-cyan-electric to-teal-brand bg-clip-text text-transparent">
            inteligencia artificial
          </span>{" "}
          a tu negocio?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-slate-300">
          Calcula con números de tu propia pyme cuántas horas y pesos puedes recuperar automatizando tareas, cuánto
          costaría y en cuántos meses se paga sola.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/calculadora" className="btn-primary w-full px-8 py-4 text-base sm:w-auto">
            Calcular mi ROI ahora
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a href="#que-es" className="btn-ghost w-full sm:w-auto">
            ¿Qué es el ROI?
          </a>
        </div>
        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
          {outputs.map((o) => (
            <li key={o} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
              {o}
            </li>
          ))}
        </ul>
      </section>

      {/* Qué es el ROI */}
      <section id="que-es" className="relative mx-auto grid max-w-6xl scroll-mt-20 gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-glow">¿Qué es el ROI?</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Retorno de inversión: cuánto te regresa cada peso</h2>
          <p className="mt-4 text-slate-300">
            El ROI compara lo que ganas (o ahorras) contra lo que inviertes. Si inviertes $50,000 y en un año ahorras
            $110,000, tu ROI es de <strong className="text-white">120%</strong>: recuperaste lo invertido y además
            ganaste $60,000.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-ink-800/60 p-4 font-mono text-sm text-slate-300">
            ROI = (Ahorro − Inversión) ÷ Inversión × 100
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-brand">¿Por qué importa en una pyme?</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Porque cada peso y cada hora cuentan</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            {[
              "Decides con números, no con intuición ni con la promesa del proveedor.",
              "Sabes en cuántos meses recuperas lo invertido y cuidas tu flujo de efectivo.",
              "Priorizas la mejora que más te conviene primero.",
              "Liberas a tu equipo de tareas repetitivas para vender y atender mejor.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-glow" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">Cómo funciona</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <span className="font-mono text-sm text-cyan-glow">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/calculadora" className="btn-primary px-8 py-4 text-base">
            Empezar
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Usamos supuestos conservadores basados en proyectos reales con pymes en México.
          </p>
        </div>
      </section>
    </div>
  );
}

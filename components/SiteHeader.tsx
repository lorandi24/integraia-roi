import Link from "next/link";
import Logo from "./Logo";

export default function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
        <Link
          href="/calculadora"
          className="rounded-full border border-cyan-glow/30 px-4 py-2 text-sm font-medium text-cyan-glow transition hover:bg-cyan-glow/10"
        >
          Calcular mi ROI
        </Link>
      </div>
    </header>
  );
}

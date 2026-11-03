import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

// Se resuelve en servidor/build: si existe /public/logo-integraia.png se usa;
// si no, se muestra un placeholder claro. Cero JavaScript en el cliente.
const LOGO_FILE = "logo-integraia.png";
const hasLogo = fs.existsSync(path.join(process.cwd(), "public", LOGO_FILE));

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {hasLogo ? (
        <Image
          src={`/${LOGO_FILE}`}
          alt="IntegraIA by EMET"
          width={36}
          height={36}
          priority
          className="h-9 w-9 rounded-lg object-contain"
        />
      ) : (
        <span
          role="img"
          aria-label="Espacio para logo: agrega public/logo-integraia.png"
          title="Placeholder: agrega public/logo-integraia.png"
          className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-cyan-glow/60 bg-ink-800 text-[9px] font-bold tracking-tight text-cyan-glow"
        >
          LOGO
        </span>
      )}
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight text-white">
          Integra<span className="text-cyan-glow">IA</span>
        </span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">by EMET</span>
      </span>
    </span>
  );
}

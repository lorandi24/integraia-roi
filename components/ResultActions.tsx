"use client";

import { useState } from "react";
import { buildWhatsAppUrl } from "@/lib/summary";

export default function ResultActions({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `${summary}\n\nVer resultado: ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para navegadores sin Clipboard API (http, webviews)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function openWhatsApp() {
    window.open(buildWhatsAppUrl(summary, window.location.href), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="no-print flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button type="button" onClick={openWhatsApp} className="btn-primary order-first px-6 py-3.5 sm:order-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.93.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.42 9.42 0 0 1 9.47 9.48c0 5.22-4.25 9.47-9.47 9.47M20.1 3.9A11.33 11.33 0 0 0 12.04.56C5.76.56.65 5.67.65 11.95c0 2.01.52 3.97 1.52 5.7L.55 23.56l6.04-1.58a11.38 11.38 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.4-11.39 0-3.04-1.19-5.9-3.34-8.06" />
        </svg>
        Platicar mi caso por WhatsApp
      </button>
      <button type="button" onClick={copy} className="btn-ghost" aria-live="polite">
        {copied ? "✓ Resultado copiado" : "Copiar resultado"}
      </button>
      <button type="button" onClick={() => window.print()} className="btn-ghost">
        Descargar PDF
      </button>
    </div>
  );
}

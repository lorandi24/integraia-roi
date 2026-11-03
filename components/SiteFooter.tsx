export default function SiteFooter() {
  return (
    <footer className="no-print border-t border-white/5 px-4 py-8 text-center text-xs text-slate-500">
      <p>
        © {new Date().getFullYear()} IntegraIA by EMET · Estimaciones con fines orientativos; no constituyen una
        cotización formal.
      </p>
    </footer>
  );
}

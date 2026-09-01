import PixSupport from "@/components/monetization/PixSupport";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-700 bg-surface-950 mt-8">
      <div className="container mx-auto px-4 max-w-6xl py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Créditos */}
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <p className="font-medium text-gray-400">
              ⚡ CS<span className="text-brand-500">Tracker</span>
            </p>
            <p className="mt-0.5">
              © {year} — Plataforma pessoal de análise CS2
            </p>
            <p className="mt-0.5 text-gray-600">
              Não afiliado à Valve Corporation
            </p>
          </div>

          {/* Pix */}
          <PixSupport />
        </div>
      </div>
    </footer>
  );
}

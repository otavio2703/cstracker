/**
 * PixSupport — Componente de Apoio via Pix
 *
 * ⚠️  CONFIGURAÇÃO NECESSÁRIA:
 * Adicione suas informações no .env.local:
 *
 *   NEXT_PUBLIC_PIX_ENABLED=true
 *   NEXT_PUBLIC_PIX_KEY=sua-chave-pix-aqui
 *   NEXT_PUBLIC_PIX_QR_URL=https://... (URL do QR Code, opcional)
 *   NEXT_PUBLIC_PIX_PAYMENT_URL=https://... (URL de pagamento, opcional)
 *
 * Enquanto não configurado, o botão não aparece.
 * Não invente chaves ou QR Codes — configure apenas com dados reais.
 */

const PIX_ENABLED    = process.env.NEXT_PUBLIC_PIX_ENABLED === "true";
const PIX_KEY        = process.env.NEXT_PUBLIC_PIX_KEY;
const PIX_QR_URL     = process.env.NEXT_PUBLIC_PIX_QR_URL;
const PIX_PAYMENT_URL = process.env.NEXT_PUBLIC_PIX_PAYMENT_URL;

export default function PixSupport() {
  // Não renderizar se não configurado
  if (!PIX_ENABLED || (!PIX_KEY && !PIX_PAYMENT_URL && !PIX_QR_URL)) {
    return null;
  }

  const linkHref = PIX_PAYMENT_URL || (PIX_KEY ? `#pix-${PIX_KEY}` : "#");

  return (
    <div className="flex flex-col items-center sm:items-end gap-2">
      <p className="text-xs text-gray-500">Apoie o Projeto</p>
      <a
        href={linkHref}
        target={PIX_PAYMENT_URL ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-green-900/40 hover:bg-green-800/60 
                   text-green-400 hover:text-green-300
                   border border-green-700/50 hover:border-green-600/70
                   text-sm font-medium transition-all duration-150"
        aria-label="Apoie o projeto via Pix"
      >
        <span className="text-base">🤝</span>
        Pix
      </a>

      {/* QR Code (se configurado) */}
      {PIX_QR_URL && (
        <div className="mt-2 p-2 bg-white rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PIX_QR_URL}
            alt="QR Code Pix"
            width={120}
            height={120}
            className="block"
          />
        </div>
      )}

      {/* Chave Pix textual (se configurado e sem URL de pagamento) */}
      {PIX_KEY && !PIX_PAYMENT_URL && (
        <p className="text-2xs text-gray-500 font-mono">{PIX_KEY}</p>
      )}
    </div>
  );
}

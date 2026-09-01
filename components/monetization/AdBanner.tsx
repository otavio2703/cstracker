"use client";

/**
 * AdBanner — Componente de Anúncio AdSense
 *
 * ⚠️  CONFIGURAÇÃO NECESSÁRIA:
 * 1. Crie uma conta no Google AdSense (https://adsense.google.com)
 * 2. Aguarde a aprovação do site
 * 3. Obtenha seu Publisher ID (formato: ca-pub-XXXXXXXXXXXXXXXX)
 * 4. Configure NEXT_PUBLIC_ADSENSE_PUBLISHER_ID no .env.local e na Vercel
 * 5. Defina NEXT_PUBLIC_ADS_ENABLED=true para ativar os anúncios
 *
 * Os anúncios são INATIVOS por padrão para evitar bloqueio antes da aprovação.
 *
 * Política AdSense:
 * - Não clique em seus próprios anúncios
 * - O site deve ter conteúdo original e útil para ser aprovado
 * - Revise as políticas em: https://support.google.com/adsense/answer/48182
 */

import { useEffect } from "react";

interface AdBannerProps {
  slot?: string;       // ID do ad unit (configurar após aprovação)
  format?: "auto" | "rectangle" | "leaderboard";
  className?: string;
}

// Verificar se os anúncios estão habilitados por configuração
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

export default function AdBanner({
  slot,
  format = "auto",
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    if (!ADS_ENABLED || !PUBLISHER_ID || !slot) return;
    try {
      // @ts-expect-error — adsbygoogle não tem tipagem oficial
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Ignorar erros de inicialização (ex: bloqueador de anúncios)
    }
  }, [slot]);

  // Não renderizar se desabilitado ou não configurado
  if (!ADS_ENABLED || !PUBLISHER_ID || !slot) {
    // Em desenvolvimento, mostrar placeholder visual
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`flex items-center justify-center border border-dashed border-surface-600 rounded-lg bg-surface-800/30 text-gray-600 text-xs text-center p-4 ${className}`}
        >
          <div>
            <p className="font-mono text-2xs mb-1">📢 AD PLACEHOLDER</p>
            <p>Configure NEXT_PUBLIC_ADS_ENABLED=true</p>
            <p>e NEXT_PUBLIC_ADSENSE_PUBLISHER_ID</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

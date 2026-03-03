"use client";

import { Award, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

type CertificateProps = {
  volunteerName: string;
  taskTitle: string;
  category: string;
  impactLetter?: string | null;
  completedAt: string;
  certificateId?: string | null;
  proofTxHash?: string | null;
  proofExplorerUrl?: string | null;
  taskTxHash?: string | null;
};

export function ImpactCertificate({
  volunteerName, taskTitle, category, impactLetter,
  completedAt, certificateId,
}: CertificateProps) {
  const { t } = useLanguage();

  async function handleShare() {
    const text = `I just completed "${taskTitle}" as a volunteer on Takafol! #TakafolImpact`;
    if (navigator.share) {
      try { await navigator.share({ title: "Takafol - شهادة تطوع", text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  function handleDownload() {
    if (certificateId) {
      window.open(`/api/certificates/${certificateId}/pdf`, "_blank");
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 rounded-2xl p-5 border border-emerald-100">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
          <Award size={32} className="text-white" />
        </div>
      </div>

      <div className="text-center mb-5">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{t("certificateOfImpact")}</p>
        <h3 className="text-xl font-extrabold text-gray-900">{volunteerName}</h3>
        <p className="text-sm text-gray-500 mt-1">{t("hasCompleted")}</p>
      </div>

      <div className="bg-white/80 rounded-xl p-4 mb-4 border border-emerald-50">
        <h4 className="text-sm font-bold text-gray-900 mb-1">{taskTitle}</h4>
        <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2">{category}</span>
        {impactLetter && (
          <p className="text-xs text-gray-500 leading-relaxed italic mt-2">&ldquo;{impactLetter}&rdquo;</p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500">{t("completedOn")}</span>
          <span className="text-xs font-bold text-gray-700">
            {new Date(completedAt).toLocaleDateString("ar-JO", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {certificateId && (
          <Button onClick={handleDownload} variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <Download size={14} className="me-2" /> {t("downloadCertificate")}
          </Button>
        )}
        <Button onClick={handleShare} className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white">
          <Share2 size={14} className="me-2" /> {t("shareCertificate")}
        </Button>
      </div>
    </div>
  );
}

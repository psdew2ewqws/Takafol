"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CertificateInfo {
  id: string;
  recipientName: string;
  title: string;
  description: string;
  category: string;
  certHash: string;
  blockchainTx: string | null;
  explorerUrl: string | null;
  issuedAt: string;
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyCertificateContent />
    </Suspense>
  );
}

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const certId = searchParams.get("id");
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certId) {
      setError("No certificate ID provided");
      setLoading(false);
      return;
    }
    async function verify() {
      try {
        const res = await fetch(`/api/certificates?id=${certId}`);
        const data = await res.json();
        if (data.data) {
          setCertificate(data.data);
        } else {
          setError("Certificate not found — may be invalid or revoked");
        }
      } catch {
        setError("Failed to verify certificate");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [certId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="flex items-center gap-3 text-emerald-700">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">جاري التحقق من الشهادة...</span>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">فشل التحقق</h1>
            <p className="text-sm text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12">
      <Card className="w-full max-w-lg border-emerald-200">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          {/* Verified badge */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-emerald-800">
              تم التحقق من الشهادة
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              هذه الشهادة أصلية وموثّقة
            </p>
          </div>

          {/* Certificate details */}
          <div className="w-full space-y-4 rounded-xl bg-gray-50 p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-gray-400">المستلم</p>
                <p className="text-lg font-bold text-gray-900">
                  {certificate.recipientName}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400">الشهادة</p>
              <p className="text-sm font-medium text-gray-700">{certificate.title}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">الفئة</p>
              <p className="text-sm text-gray-700">{certificate.category}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">تاريخ الإصدار</p>
              <p className="text-sm text-gray-700">
                {new Date(certificate.issuedAt).toLocaleDateString("ar-JO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">رقم الشهادة</p>
              <p className="font-mono text-xs text-gray-600">{certificate.id}</p>
            </div>
          </div>

          {/* Download PDF */}
          <Button
            onClick={() => window.open(`/api/certificates/${certificate.id}/pdf`, "_blank")}
            className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Download className="mr-2 h-4 w-4" />
            تحميل الشهادة PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

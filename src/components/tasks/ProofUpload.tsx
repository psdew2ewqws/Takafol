"use client";

import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProofUploadProps = {
  taskId: string;
  volunteerId: string;
  onProofSubmitted: (result: {
    proofHash: string;
    proofTxHash: string | null;
    proofExplorerUrl: string | null;
  }) => void;
};

async function hashFile(base64: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(base64);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function ProofUpload({ taskId, volunteerId, onProofSubmitted }: ProofUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitProof() {
    if (!preview) return;
    setUploading(true);
    try {
      const proofHash = await hashFile(preview);
      const res = await fetch(`/api/tasks/${taskId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, proofPhotoBase64: preview, proofHash }),
      });
      const data = await res.json();
      setDone(true);
      onProofSubmitted({
        proofHash,
        proofTxHash: data.proofTxHash || null,
        proofExplorerUrl: data.proofExplorerUrl || null,
      });
    } catch (err) {
      console.error("Proof submission failed:", err);
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <CheckCircle2 size={18} className="text-emerald-600" />
        <span className="text-sm font-bold text-emerald-700">Proof submitted & verified on blockchain!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {preview && (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="Proof" className="w-full h-48 object-cover rounded-xl" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {!preview && (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center gap-2 py-6 px-4 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Camera size={24} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Take Photo</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 py-6 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Upload size={24} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Upload File</span>
          </button>
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {preview && (
        <Button
          onClick={submitProof}
          disabled={uploading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          {uploading ? (
            <><Loader2 size={16} className="animate-spin me-2" /> Recording on Blockchain...</>
          ) : (
            <><CheckCircle2 size={16} className="me-2" /> Submit Proof to Blockchain</>
          )}
        </Button>
      )}
    </div>
  );
}

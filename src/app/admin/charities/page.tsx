"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/providers/language-provider";
import { toast } from "sonner";

interface Charity {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  website: string | null;
  isVerified: boolean;
  isActive: boolean;
  _count: { volunteerPrograms: number; zakatDonations: number };
}

const EMPTY_FORM = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  website: "",
  isVerified: false,
};

export default function AdminCharitiesPage() {
  const { data: session } = useSession();
  const { lang, t } = useLanguage();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;
    fetchCharities();
  }, [session]);

  async function fetchCharities() {
    try {
      const res = await fetch("/api/charities");
      const data = await res.json();
      if (data.data) setCharities(data.data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(charity: Charity) {
    setEditingId(charity.id);
    setForm({
      name: charity.name,
      nameAr: charity.nameAr,
      description: charity.description || "",
      descriptionAr: charity.descriptionAr || "",
      website: charity.website || "",
      isVerified: charity.isVerified,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.nameAr.trim()) return;
    setSaving(true);

    try {
      const url = editingId
        ? `/api/charities/${editingId}/admin`
        : "/api/charities";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? t("updatedSuccess") : t("createdSuccess"));
        setDialogOpen(false);
        setLoading(true);
        await fetchCharities();
      } else {
        const data = await res.json();
        toast.error(data.error || t("errorOccurred"));
      }
    } catch {
      toast.error(t("errorOccurred"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(charity: Charity) {
    try {
      const res = await fetch(`/api/charities/${charity.id}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !charity.isActive }),
      });

      if (res.ok) {
        toast.success(t("updatedSuccess"));
        setCharities((prev) =>
          prev.map((c) =>
            c.id === charity.id ? { ...c, isActive: !c.isActive } : c,
          ),
        );
      }
    } catch {
      toast.error(t("errorOccurred"));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-emerald-900">{t("adminCharities")}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              size="sm"
            >
              <Plus className="mx-1 h-4 w-4" /> {t("addCharity")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editCharity") : t("addCharity")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("charityName")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("charityNameAr")}</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("charityDescription")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("charityDescriptionAr")}</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("charityWebsite")}</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("charityVerified")}
              </label>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.nameAr.trim()}
                className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {charities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <p>{t("noCharities")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="border-emerald-100">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {lang === "ar" ? charity.nameAr : charity.name}
                    </span>
                    {charity.isVerified && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                        <CheckCircle2 className="mx-0.5 h-3 w-3" /> {t("charityVerified")}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        charity.isActive
                          ? "border-green-200 bg-green-50 text-xs text-green-700"
                          : "border-red-200 bg-red-50 text-xs text-red-700"
                      }
                    >
                      {charity.isActive ? t("charityActive") : t("charityInactive")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {charity._count.volunteerPrograms} {t("programs")} · {charity._count.zakatDonations} {t("donations")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-emerald-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(charity)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(charity)}
                    className={
                      charity.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }
                  >
                    {charity.isActive ? t("deactivate") : t("activate")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

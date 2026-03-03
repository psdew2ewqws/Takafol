"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/providers/language-provider";
import { toast } from "sonner";

interface Program {
  id: string;
  title: string;
  titleAr: string;
  description: string | null;
  descriptionAr: string | null;
  charityId: string;
  capacity: number;
  enrolled: number;
  isActive: boolean;
  charity: { id: string; name: string; nameAr: string };
  _count: { applications: number };
}

interface CharityOption {
  id: string;
  name: string;
  nameAr: string;
}

const EMPTY_FORM = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  charityId: "",
  capacity: 0,
};

export default function AdminProgramsPage() {
  const { data: session } = useSession();
  const { lang, t } = useLanguage();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [charities, setCharities] = useState<CharityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;
    fetchData();
  }, [session]);

  async function fetchData() {
    try {
      const [progRes, charRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/charities"),
      ]);
      const [progData, charData] = await Promise.all([
        progRes.json(),
        charRes.json(),
      ]);
      if (progData.data) setPrograms(progData.data);
      if (charData.data) setCharities(charData.data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(program: Program) {
    setEditingId(program.id);
    setForm({
      title: program.title,
      titleAr: program.titleAr,
      description: program.description || "",
      descriptionAr: program.descriptionAr || "",
      charityId: program.charityId,
      capacity: program.capacity,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.titleAr.trim() || !form.charityId) return;
    setSaving(true);

    try {
      const url = editingId
        ? `/api/programs/${editingId}`
        : "/api/programs";
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
        await fetchData();
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

  async function toggleActive(program: Program) {
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !program.isActive }),
      });

      if (res.ok) {
        toast.success(t("updatedSuccess"));
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === program.id ? { ...p, isActive: !p.isActive } : p,
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
        <h2 className="text-lg font-bold text-emerald-900">{t("adminPrograms")}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              size="sm"
            >
              <Plus className="mx-1 h-4 w-4" /> {t("addProgram")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editProgram") : t("addProgram")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("programCharity")}</Label>
                <Select
                  value={form.charityId}
                  onValueChange={(v) => setForm({ ...form, charityId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {charities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {lang === "ar" ? c.nameAr : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("programTitle")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("programTitleAr")}</Label>
                <Input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("programDescription")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("programDescriptionAr")}</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("programCapacity")}</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.titleAr.trim() || !form.charityId}
                className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {programs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <p>{t("noPrograms2")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <Card key={program.id} className="border-emerald-100">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {lang === "ar" ? program.titleAr : program.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        program.isActive
                          ? "border-green-200 bg-green-50 text-xs text-green-700"
                          : "border-red-200 bg-red-50 text-xs text-red-700"
                      }
                    >
                      {program.isActive ? t("charityActive") : t("charityInactive")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? program.charity.nameAr : program.charity.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {program.enrolled}/{program.capacity} {t("programEnrolled")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(program)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(program)}
                    className={
                      program.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }
                  >
                    {program.isActive ? t("deactivate") : t("activate")}
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

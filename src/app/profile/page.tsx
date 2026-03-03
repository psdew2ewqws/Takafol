"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Trophy,
  CheckCircle2,
  Star,
  Calendar,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/posts/post-card";
import { ConnectionCard } from "@/components/connections/connection-card";
import { useLanguage } from "@/components/providers/language-provider";
import { toast } from "sonner";
import type { District, PostWithRelations, ConnectionWithRelations } from "@/types";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  districtId: string | null;
  impactScore: number;
  tasksCompleted: number;
  averageRating: number;
  createdAt: string;
  district: District | null;
}

const NO_DISTRICT = "__none__";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [districtId, setDistrictId] = useState(NO_DISTRICT);

  // Tab data
  const [myPosts, setMyPosts] = useState<PostWithRelations[]>([]);
  const [myConnections, setMyConnections] = useState<ConnectionWithRelations[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [connectionsLoaded, setConnectionsLoaded] = useState(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchData() {
      try {
        const [profileRes, distRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/districts"),
        ]);
        const [profileData, distData] = await Promise.all([
          profileRes.json(),
          distRes.json(),
        ]);

        if (profileData.data) {
          const p = profileData.data;
          setProfile(p);
          setName(p.name || "");
          setPhone(p.phone || "");
          setBio(p.bio || "");
          setDistrictId(p.districtId || NO_DISTRICT);
        }
        if (distData.data) setDistricts(distData.data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          districtId: districtId === NO_DISTRICT ? null : districtId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("unexpectedError"));
        return;
      }

      setProfile(data.data);
      toast.success(t("savedSuccessfully"));
    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setSaving(false);
    }
  }

  async function loadMyPosts() {
    if (postsLoaded) return;
    setPostsLoading(true);
    try {
      const res = await fetch("/api/posts/my");
      const data = await res.json();
      if (data.data) setMyPosts(data.data);
      setPostsLoaded(true);
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadMyConnections() {
    if (connectionsLoaded) return;
    setConnectionsLoading(true);
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      if (data.data) setMyConnections(data.data);
      setConnectionsLoaded(true);
    } finally {
      setConnectionsLoading(false);
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session || !profile) return null;

  const joinDate = new Date(profile.createdAt).toLocaleDateString(
    lang === "ar" ? "ar-JO" : "en-US",
    { year: "numeric", month: "long" },
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6 border-emerald-100">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-emerald-100 text-2xl font-bold text-emerald-700">
              {profile.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-emerald-900">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold">{profile.impactScore}</span>
              <span className="text-xs text-muted-foreground">{t("impactScore")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-lg font-bold">{profile.tasksCompleted}</span>
              <span className="text-xs text-muted-foreground">{t("tasksCompleted")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-bold">
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "-"}
              </span>
              <span className="text-xs text-muted-foreground">{t("rating")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-bold">{joinDate}</span>
              <span className="text-xs text-muted-foreground">{t("joinDate")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="edit"
        onValueChange={(v) => {
          if (v === "posts") loadMyPosts();
          if (v === "connections") loadMyConnections();
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="edit">{t("editProfileTab")}</TabsTrigger>
          <TabsTrigger value="posts">{t("myPosts")}</TabsTrigger>
          <TabsTrigger value="connections">{t("myConnectionsTab")}</TabsTrigger>
        </TabsList>

        {/* Edit Profile Tab */}
        <TabsContent value="edit">
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-emerald-900">
                {t("editProfile")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07xxxxxxxx"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t("district")}</Label>
                  <Select value={districtId} onValueChange={setDistrictId}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder={t("selectYourDistrict")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_DISTRICT}>{t("notSpecified")}</SelectItem>
                      {districts.map((dist) => (
                        <SelectItem key={dist.id} value={dist.id}>
                          {lang === "ar" ? dist.nameAr : dist.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("bio")}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("bioPlaceholder")}
                    rows={3}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/500</p>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Save className="mx-1 h-4 w-4" /> {t("save")}</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Posts Tab */}
        <TabsContent value="posts">
          {postsLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : myPosts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p>{t("noPostsYet")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {myPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Connections Tab */}
        <TabsContent value="connections">
          {connectionsLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : myConnections.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p>{t("noConnectionsYet")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {myConnections.map((conn) => (
                <ConnectionCard key={conn.id} connection={conn} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

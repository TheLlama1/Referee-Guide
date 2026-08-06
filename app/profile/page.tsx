"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase";

interface QuizResult {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  // UI Modes
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields State
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [refereeTier, setRefereeTier] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Safe State (to revert changes if the user clicks "Cancel")
  const [originalData, setOriginalData] = useState({
    username: "",
    country: "",
    refereeTier: "",
    avatarUrl: "",
  });

  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | "info";
    msg: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/auth");
          return;
        }

        setUser(session.user);

        // 1. Fetch Profile Data
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUsername(profile.username || "");
          setCountry(profile.country || "");
          setRefereeTier(profile.referee_tier || "");
          setAvatarUrl(profile.avatar_url || "");

          // Save a baseline so we can revert if they cancel edits
          setOriginalData({
            username: profile.username || "",
            country: profile.country || "",
            refereeTier: profile.referee_tier || "",
            avatarUrl: profile.avatar_url || "",
          });
        }

        // 2. Fetch Quiz History
        const { data: quizRecords } = await supabase
          .from("quiz_results")
          .select("id, score, total_questions, percentage, completed_at")
          .eq("user_id", session.user.id)
          .order("completed_at", { ascending: false });

        if (quizRecords) {
          setHistory(quizRecords);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [supabase, router]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return; // Prevent upload if not in edit mode

    try {
      setUploading(true);
      setSaveStatus(null);

      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
      setSaveStatus({
        type: "success",
        msg: "Image uploaded! Remember to save changes.",
      });
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: `Upload error: ${err.message || err}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ type: "info", msg: "Saving alterations..." });

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          country,
          referee_tier: refereeTier,
          avatar_url: avatarUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile records");

      // Update the safe state to the new values
      setOriginalData({ username, country, refereeTier, avatarUrl });

      setSaveStatus({ type: "success", msg: "Profile successfully updated!" });
      setIsEditing(false); // Close edit mode automatically
      router.refresh();

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus({ type: "error", msg: `Save Error: ${err.message}` });
    }
  };

  const handleCancelEdit = () => {
    // Revert inputs back to the originally fetched data
    setUsername(originalData.username);
    setCountry(originalData.country);
    setRefereeTier(originalData.refereeTier);
    setAvatarUrl(originalData.avatarUrl);
    setSaveStatus(null);
    setIsEditing(false);
  };

  const totalExams = history.length;
  const avgPercentage = totalExams
    ? Math.round(
        history.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams,
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-6 lg:p-12 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-4 space-y-6">
            <div className="h-80 bg-slate-800/50 rounded-2xl border border-slate-800" />
            <div className="h-32 bg-slate-800/50 rounded-2xl border border-slate-800" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 bg-slate-800/50 rounded-2xl border border-slate-800" />
            <div className="h-64 bg-slate-800/50 rounded-2xl border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 lg:p-12 font-sans selection:bg-emerald-500/30">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Profile & Performance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your academy credentials and review your certification
            history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Identity & Quick Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">
              <div className="h-24 w-full bg-gradient-to-r from-emerald-900/40 to-slate-900 absolute top-0 left-0 border-b border-slate-800/50" />

              <div className="relative pt-12 pb-8 px-6 flex flex-col items-center text-center">
                {/* Avatar (Interactive ONLY when isEditing is true) */}
                <label
                  className={`relative mb-4 ${isEditing ? "group cursor-pointer" : ""}`}
                >
                  <div
                    className={`h-28 w-28 rounded-full border-4 border-[#111827] bg-slate-900 overflow-hidden flex items-center justify-center shadow-lg transition-transform duration-300 ${isEditing ? "group-hover:scale-105" : ""}`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-slate-700">
                        REF
                      </span>
                    )}

                    {/* Hover Overlay - Only renders in Edit Mode */}
                    {isEditing && (
                      <div
                        className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${uploading ? "opacity-100" : ""}`}
                      >
                        {uploading ? (
                          <div className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <svg
                              className="w-6 h-6 text-white mb-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                              Upload
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    disabled={uploading || !isEditing}
                    className="hidden"
                  />
                </label>

                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
                  Official Roster
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {username || "Unknown Official"}
                </h2>
                <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {country || "No Region Set"}
                </p>

                {/* Edit Profile Button (Visible only when NOT editing) */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 w-full rounded-xl bg-slate-800/80 border border-slate-700 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards Stacked */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-sm flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Exams
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {totalExams}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-sm flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Avg Score
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-3xl font-black text-emerald-400">
                    {avgPercentage}
                  </p>
                  <span className="text-sm font-bold text-emerald-500/50">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Metadata Card (Switches between Read-Only and Form) */}
            <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-xl overflow-hidden">
              <div className="border-b border-slate-800/60 bg-slate-900/50 px-6 py-5 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Metadata & Credentials
                  </h3>
                  <p className="text-sm text-slate-400">
                    {isEditing
                      ? "Update your public facing academy details."
                      : "Your public facing academy details."}
                  </p>
                </div>
                {!isEditing && (
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Status Toast Notification */}
                {saveStatus && (
                  <div
                    className={`mb-6 rounded-xl p-4 flex items-center gap-3 text-sm border ${
                      saveStatus.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : saveStatus.type === "error"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}
                  >
                    {saveStatus.type === "success" && (
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {saveStatus.msg}
                  </div>
                )}

                {isEditing ? (
                  /* --- EDIT MODE FORM --- */
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username Input */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Display Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                              className="h-4 w-4 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-colors focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                      </div>

                      {/* Country Input */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Region / Country
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                              className="h-4 w-4 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-colors focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. United Kingdom"
                          />
                        </div>
                      </div>

                      {/* Tier Input */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Certification Tier
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                              className="h-4 w-4 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={refereeTier}
                            onChange={(e) => setRefereeTier(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-colors focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Grade 7 / Regional"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/60 mt-6">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveStatus?.type === "info"}
                        className="rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saveStatus?.type === "info" ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* --- READ ONLY MODE --- */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Display Name
                      </span>
                      <p className="mt-1.5 text-sm text-white font-medium">
                        {username || (
                          <span className="text-slate-600 italic">
                            Not specified
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Region / Country
                      </span>
                      <p className="mt-1.5 text-sm text-white font-medium">
                        {country || (
                          <span className="text-slate-600 italic">
                            Not specified
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 md:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        Certification Tier
                      </span>
                      <p className="mt-1.5 text-sm text-white font-medium">
                        {refereeTier || (
                          <span className="text-slate-600 italic">
                            Not specified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-xl overflow-hidden flex flex-col">
              <div className="border-b border-slate-800/60 bg-slate-900/50 px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Evaluation Log
                  </h3>
                  <p className="text-sm text-slate-400">
                    Your past academy quiz results.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h4 className="text-slate-300 font-semibold mb-1">
                    No Records Found
                  </h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    You haven't completed any official exams yet. Your results
                    will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900/20">
                        <th className="px-6 py-4 whitespace-nowrap">
                          Date Completed
                        </th>
                        <th className="px-6 py-4">Accuracy</th>
                        <th className="px-6 py-4 text-right">Final Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {history.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-800/20 transition-colors group"
                        >
                          <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                            {new Date(record.completed_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            <span className="text-slate-200 font-medium">
                              {record.score}
                            </span>{" "}
                            / {record.total_questions}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${
                                record.percentage >= 80
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : record.percentage >= 60
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {record.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

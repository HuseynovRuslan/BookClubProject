import { useMemo, useState } from "react";
import { Users, ShieldCheck, Sparkles } from "lucide-react";

const groups = [
  {
    name: "Fantasy Readers",
    members: "2.1K üzv",
    highlight: "Həftəlik müzakirələr, spoiler-siz qaydalar",
    badge: "Açıq qrup",
    tier: "trend",
  },
  {
    name: "Non‑fiction & Self‑growth",
    members: "1.3K üzv",
    highlight: "Hər ay bir kitab, real-life case study",
    badge: "Təsdiqlənmiş",
    tier: "professional",
  },
  {
    name: "Local Authors Lounge",
    members: "820 üzv",
    highlight: "Yeni əsərlərin beta oxunuşu və rəy sessiyaları",
    badge: "Premium",
    tier: "professional",
  },
];

export default function GroupsPage() {
  const [filter, setFilter] = useState("trend");
  const filteredGroups = useMemo(() => {
    if (filter === "all") return groups;
    return groups.filter((g) => g.tier === filter);
  }, [filter]);

  const buttonBase =
    "px-4 py-2 rounded-xl font-semibold border transition-all";
  const buttonActive =
    "bg-white text-amber-700 border-amber-200 shadow-sm hover:shadow-md";
  const buttonGhost =
    "bg-white/70 text-gray-800 border-gray-200 hover:border-amber-200 hover:text-amber-700";
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_10%_20%,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(248,113,113,0.22),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(248,180,0,0.18),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 shadow-sm border border-amber-100">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Groups
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                İcma qrupları
              </h1>
            </div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Hədəflərinə və janrına uyğun oxu qruplarına qoşul, müzakirə et, yeni dostlar tap.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonBase} ${filter === "trend" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("trend")}
            >
              Trend
            </button>
            <button
              className={`${buttonBase} ${filter === "professional" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("professional")}
            >
              Professional
            </button>
            <button
              className={`${buttonBase} ${filter === "all" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("all")}
            >
              Hamısı
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredGroups.map((group) => (
          <div
            key={group.name}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <ShieldCheck className="w-4 h-4" />
              {group.badge}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
            <p className="text-gray-600">{group.highlight}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4" />
                {group.members}
              </span>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all">
                Qoşul
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


import { useMemo, useState } from "react";
import { Tag, Flame, Hash, Lightbulb } from "lucide-react";

const topics = [
  { name: "#thriller", posts: "4.2K müzakirə", mood: "Gərgin süjetlər, sürətli ritm", tag: "trend" },
  { name: "#classics", posts: "2.7K müzakirə", mood: "Əbədi hekayələr, dərin analiz", tag: "foryou" },
  { name: "#selfgrowth", posts: "3.1K müzakirə", mood: "Motivasiya, sistemli vərdişlər", tag: "new" },
  { name: "#sff", posts: "1.9K müzakirə", mood: "Fantastika və elmi-fantastika kəşfləri", tag: "trend" },
];

export default function TopicPage() {
  const [filter, setFilter] = useState("trend");
  const filteredTopics = useMemo(() => {
    if (filter === "all") return topics;
    return topics.filter((t) => t.tag === filter);
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
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_15%_25%,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(248,113,113,0.22),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(248,180,0,0.18),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 shadow-sm border border-amber-100">
              <Tag className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Topics
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Müzakirə mövzuları
              </h1>
            </div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Trend tag-lar, tematik oxu siyahıları və icmanın ən aktiv mövzuları.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonBase} ${filter === "trend" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("trend")}
            >
              Trend
            </button>
            <button
              className={`${buttonBase} ${filter === "new" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("new")}
            >
              Yeni
            </button>
            <button
              className={`${buttonBase} ${filter === "foryou" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("foryou")}
            >
              Sənin üçün
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
        {filteredTopics.map((topic) => (
          <div
            key={topic.name}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                <Hash className="w-4 h-4" />
                Aktiv mövzu
              </div>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                <Flame className="w-4 h-4" />
                Populyar
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{topic.name}</h3>
            <p className="text-gray-600">{topic.mood}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{topic.posts}</span>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all">
                İzləməyə başla
                <Lightbulb className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


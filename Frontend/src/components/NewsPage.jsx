import { useMemo, useState } from "react";
import { Newspaper, Sparkles, Clock, Bookmark } from "lucide-react";

const mockNews = [
  {
    title: "Yeni oxu marafonu başladı",
    tag: "Community",
    time: "12 dəqiqə öncə",
    summary: "Oxucular üçün 30 günlük marafon: hər gün 20 səhifə, hər həftə müzakirə.",
    type: "latest",
  },
  {
    title: "Sevilən müəlliflə canlı görüş",
    tag: "Event",
    time: "1 saat öncə",
    summary: "Canlı sessiyada müəllif son romanının ilham mənbəyindən danışacaq.",
    type: "events",
  },
  {
    title: "BookVerse tətbiqində yeni xüsusiyyət",
    tag: "Product",
    time: "Dünən",
    summary: "Oxu statistikası indi daha vizual: sətirlər, qrafiklər və gündəlik hədəflər.",
    type: "product",
  },
];

export default function NewsPage() {
  const [filter, setFilter] = useState("latest");
  const filteredNews = useMemo(() => {
    if (filter === "all") return mockNews;
    return mockNews.filter((n) => n.type === filter);
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
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(248,113,113,0.2),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(248,180,0,0.18),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 shadow-sm border border-amber-100">
              <Newspaper className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Newsroom
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                BookVerse xəbərləri
              </h1>
            </div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Platformadakı yeniliklər, tədbirlər və oxu icması üçün ən son elanlar.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonBase} ${filter === "latest" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("latest")}
            >
              Ən yenilər
            </button>
            <button
              className={`${buttonBase} ${filter === "events" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("events")}
            >
              Tədbirlər
            </button>
            <button
              className={`${buttonBase} ${filter === "product" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("product")}
            >
              Məhsul yenilikləri
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

      <div className="grid gap-4">
        {filteredNews.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 text-sm text-amber-700 font-semibold">
              <Sparkles className="w-4 h-4" />
              {item.tag}
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {item.title}
            </h2>
            <p className="mt-2 text-gray-600">{item.summary}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {item.time}
              </span>
              <span className="inline-flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Oxu siyahısına əlavə et
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


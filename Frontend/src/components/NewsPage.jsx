import { useState } from "react";
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
  const [readNews, setReadNews] = useState([]);

  const markAsRead = (title) => {
    setReadNews((prev) =>
      prev.includes(title) ? prev : [...prev, title]
    );
  };

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
        </div>
      </div>

      <div className="grid gap-4">
        {mockNews.map((item) => {
          const isRead = readNews.includes(item.title);
          return (
          <article
            key={item.title}
            className={`rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all p-5 sm:p-6 ${
              isRead ? "opacity-60 grayscale" : ""
            }`}
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
              <button
                type="button"
                onClick={() => markAsRead(item.title)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isRead
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50 cursor-default"
                    : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isRead ? "Oxundu" : "Oxundu siyahısına əlavə et"}
              </button>
            </div>
          </article>
        )})}
      </div>
    </div>
  );
}


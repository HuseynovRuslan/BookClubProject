import { useMemo, useState } from "react";
import { Bell, CheckCircle, Clock, MessageCircle, Heart } from "lucide-react";

const notifications = [
  { type: "like", title: "Murad postunu bəyəndi", time: "2 dəq", detail: "“Oxuduğum 3 kitab” paylaşımına 1 like" },
  { type: "comment", title: "Aysel rəy yazdı", time: "15 dəq", detail: "“Chapter 5-dəki konflikt” mövzusu" },
  { type: "system", title: "Qrup dəvəti", time: "1 saat", detail: "“Fantasy Readers” qrupuna qoşulmaq üçün dəvət" },
];

const iconByType = {
  like: <Heart className="w-5 h-5 text-rose-500" />,
  comment: <MessageCircle className="w-5 h-5 text-amber-600" />,
  system: <Bell className="w-5 h-5 text-orange-500" />,
};

export default function NotificationPage() {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "social") return notifications.filter((n) => n.type === "like" || n.type === "comment");
    if (filter === "system") return notifications.filter((n) => n.type === "system");
    return notifications;
  }, [filter]);

  const buttonBase =
    "px-4 py-2 rounded-xl font-semibold border transition-all";
  const buttonActive =
    "bg-white text-amber-700 border-amber-200 shadow-sm hover:shadow-md";
  const buttonGhost =
    "bg-white/70 text-gray-800 border-gray-200 hover:border-amber-200 hover:text-amber-700";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(248,113,113,0.22),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(248,180,0,0.18),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 shadow-sm border border-amber-100">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Notifications
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Bildirişlər mərkəzi
              </h1>
            </div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Bəyəni, rəy və dəvətnamələr – hamısı tək yerdə. Sürətli baxış və idarəetmə.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonBase} ${filter === "all" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("all")}
            >
              Hamısı
            </button>
            <button
              className={`${buttonBase} ${filter === "social" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("social")}
            >
              Sosial
            </button>
            <button
              className={`${buttonBase} ${filter === "system" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("system")}
            >
              Sistem
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
        {filtered.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className="p-4 sm:p-5 flex items-start gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              {iconByType[item.type] || <Bell className="w-5 h-5 text-amber-600" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {item.time}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{item.detail}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 font-semibold">
                <CheckCircle className="w-4 h-4" />
                Görüldü kimi işarələ
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


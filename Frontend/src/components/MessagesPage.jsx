import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, UserCircle, Clock, Filter } from "lucide-react";

const baseThreads = [
  {
    user: "Aysel",
    message: "Bugünkü kitab müzakirəsi üçün link paylaşırsan?",
    time: "5 dəq",
    category: "direct",
    userId: "aysel",
  },
  {
    user: "Murad",
    message: "Chapter 3-dəki twist haqda nə düşünürsən?",
    time: "18 dəq",
    category: "group",
    userId: "murad",
  },
  {
    user: "Leyla",
    message: "Oxu marafonuna qoşulmaq istəyirəm, qaydalar nədir?",
    time: "1 saat",
    category: "direct",
    userId: "leyla",
  },
];

export default function MessagesPage() {
  const [threads, setThreads] = useState(baseThreads);
  const [filter, setFilter] = useState("all");
  const [messageText, setMessageText] = useState("");
  const navigate = useNavigate();

  const filteredThreads = useMemo(() => {
    if (filter === "all") return threads;
    if (filter === "group") return threads.filter((t) => t.category === "group");
    if (filter === "filtered") return threads.filter((t) => t.user.toLowerCase().includes("a"));
    return threads;
  }, [filter, threads]);

  const buttonBase =
    "px-4 py-2 rounded-xl font-semibold border transition-all";
  const buttonActive =
    "bg-white text-amber-700 border-amber-200 shadow-sm hover:shadow-md";
  const buttonGhost =
    "bg-white/70 text-gray-800 border-gray-200 hover:border-amber-200 hover:text-amber-700";

  const handleSend = () => {
    if (!messageText.trim()) return;
    const newItem = {
      user: "Sən",
      message: messageText.trim(),
      time: "indi",
      category: "direct",
      userId: "you",
    };
    setThreads((prev) => [newItem, ...prev]);
    setMessageText("");
  };

  const handleOpenProfile = (userId) => {
    // Slug-lanmış userId ilə profile səhifəsinə yönləndiririk
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_10%_30%,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(248,113,113,0.22),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(248,180,0,0.18),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/70 shadow-sm border border-amber-100">
              <MessageCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Messages
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Çat & müzakirə
              </h1>
            </div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Oxu dostlarınla sürətli danışıq, qrup planları və link paylaşımı üçün mükəmməl yer.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonBase} ${filter === "all" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("all")}
            >
              Bütün sohbetlər
            </button>
            <button
              className={`${buttonBase} ${filter === "group" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("group")}
            >
              Qruplar
            </button>
            <button
              className={`${buttonBase} ${filter === "filtered" ? buttonActive : buttonGhost}`}
              onClick={() => setFilter("filtered")}
            >
              Filtrlər
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {filteredThreads.map((thread) => (
            <div
              key={thread.user}
              className="p-4 sm:p-5 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleOpenProfile(thread.userId)}
            >
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <UserCircle className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {thread.user}
                  </h3>
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {thread.time}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{thread.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center gap-3">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Mesaj yaz..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Göndər
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


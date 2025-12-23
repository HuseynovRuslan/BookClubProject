import { useEffect, useState } from "react";
import SocialFeedPost from "./SocialFeedPost";

const FEED_STORAGE_KEY = "bookverse_social_feed";
const SAVED_KEY = "bookverse_saved_posts";

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const rawFeed = localStorage.getItem(FEED_STORAGE_KEY);
      const rawSaved = localStorage.getItem(SAVED_KEY);
      const allPosts = rawFeed ? JSON.parse(rawFeed) : [];
      const savedIds = rawSaved ? JSON.parse(rawSaved) : [];

      const filtered = allPosts.filter((p) => savedIds.includes(p.id));
      setSavedPosts(filtered);
    } catch (err) {
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleSave = (postId, isSaved) => {
    if (!isSaved) {
      // If unsaved from Saved page, drop from list immediately
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-tight mb-2">
          Saved posts
        </h1>
        <p className="text-gray-700 text-base sm:text-lg">
          Sonradan yenidən baxmaq üçün saxladığın postlar burada görünür.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-600">Yüklənir...</div>
      ) : savedPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
            <span className="text-4xl">🔖</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Hələ heç nə saxlamamısan
          </h2>
          <p className="text-lg text-gray-600">
            Sosial lenti gəzərkən istədiyin postun yanındakı save düyməsinə bas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <SocialFeedPost
              key={post.id}
              post={post}
              currentUsername={post.username}
              enableInteractions
              allowEditDelete={false}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}







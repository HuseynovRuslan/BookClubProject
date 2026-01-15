import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Feather,
  Tag,
  MessageSquareText,
  Newspaper,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getAdminStats } from '../../api/admin';

const StatCard = ({ icon: Icon, label, value, color, to, loading }) => (
  <Link
    to={to}
    className="group bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-800/80 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </div>
    <div className="mt-4">
      <p className="text-slate-400 text-sm">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      )}
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalGenres: 0,
    totalUsers: 0,
    totalFeedbacks: 0,
    totalNews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to the BookClub Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Total Books"
          value={stats.totalBooks}
          color="bg-blue-500/20 text-blue-400"
          to="/admin/books"
          loading={loading}
        />
        <StatCard
          icon={Feather}
          label="Total Authors"
          value={stats.totalAuthors}
          color="bg-emerald-500/20 text-emerald-400"
          to="/admin/authors"
          loading={loading}
        />
        <StatCard
          icon={Tag}
          label="Total Genres"
          value={stats.totalGenres}
          color="bg-purple-500/20 text-purple-400"
          to="/admin/genres"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="bg-amber-500/20 text-amber-400"
          to="/admin/users"
          loading={loading}
        />
        <StatCard
          icon={MessageSquareText}
          label="Feedbacks"
          value={stats.totalFeedbacks}
          color="bg-rose-500/20 text-rose-400"
          to="/admin/feedbacks"
          loading={loading}
        />
        <StatCard
          icon={Newspaper}
          label="News/Announcements"
          value={stats.totalNews}
          color="bg-cyan-500/20 text-cyan-400"
          to="/admin/news"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/books"
            className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="text-slate-200">Add New Book</span>
          </Link>
          <Link
            to="/admin/authors"
            className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Feather className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-200">Add New Author</span>
          </Link>
          <Link
            to="/admin/genres"
            className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Tag className="w-5 h-5 text-purple-400" />
            <span className="text-slate-200">Add New Genre</span>
          </Link>
          <Link
            to="/admin/news"
            className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Newspaper className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-200">Create Announcement</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

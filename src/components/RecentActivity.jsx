import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRecentActivity } from "../services/activityService";
import { FileText, Paperclip, BookOpen, FolderOpen, Clock, RefreshCw } from "lucide-react";

const typeConfig = {
  note: { icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
  file: { icon: Paperclip, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  subject: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  folder: { icon: FolderOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
};

const timeAgo = (ts) => {
  if (!ts) return "";
  const seconds = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const RecentActivity = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getRecentActivity(currentUser.uid);
      setActivity(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [currentUser]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-800 rounded w-3/4" />
              <div className="h-2.5 bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <p className="text-slate-600 text-xs text-center py-4">
        No recent activity yet. Start by opening a note!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {activity.map((item) => {
        const cfg = typeConfig[item.type] || typeConfig.note;
        const Icon = cfg.icon;
        return (
          <button
            key={item.id}
            onClick={() => item.path && navigate(item.path)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/60 transition-all text-left group"
          >
            <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon size={14} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 dark:text-slate-300 text-xs font-medium truncate group-hover:text-white transition-colors">
                {item.title || "Untitled"}
              </p>
              <p className="text-slate-600 text-[10px] mt-0.5">{timeAgo(item.createdAt)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RecentActivity;

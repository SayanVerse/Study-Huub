import { useState } from "react";
import { Star, Trash2, FileText, ChevronRight } from "lucide-react";
import { toggleStar } from "../services/noteService";
import { useAuth } from "../context/AuthContext";

const NoteCard = ({ note, subjectId, folderId, onClick, onDelete }) => {
  const { currentUser } = useAuth();
  const [starring, setStarring] = useState(false);

  const handleStar = async (e) => {
    e.stopPropagation();
    setStarring(true);
    try {
      await toggleStar(currentUser.uid, subjectId, folderId, note.id, note.starred);
    } catch (err) {
      console.error("Star toggle failed:", err);
    } finally {
      setStarring(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  const preview = note.content
    ? note.content.replace(/<[^>]+>/g, "").substring(0, 100)
    : "";

  const createdDate = note.createdAt?.toDate?.()
    ? new Date(note.createdAt.toDate()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      onClick={() => onClick(note.id)}
      className="group bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer
        hover:border-slate-600 hover:shadow-lg hover:shadow-black/20 transition-all duration-150 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <FileText size={15} className="text-violet-400 shrink-0 mt-0.5" />
          <h3 className="text-slate-100 font-medium text-sm truncate">
            {note.title || "Untitled"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleStar}
            disabled={starring}
            className={`p-1 rounded transition-colors ${
              note.starred
                ? "text-amber-400"
                : "text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400"
            }`}
            title={note.starred ? "Unstar" : "Star"}
          >
            <Star size={15} fill={note.starred ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {preview && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {preview}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs">{createdDate}</span>
        <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
};

export default NoteCard;

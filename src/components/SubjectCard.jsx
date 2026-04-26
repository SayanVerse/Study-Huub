import { useState } from "react";
import { Trash2, BookOpen, FolderOpen } from "lucide-react";

const COLORS = [
  "from-violet-600 to-indigo-600",
  "from-fuchsia-600 to-pink-600",
  "from-cyan-600 to-blue-600",
  "from-emerald-600 to-teal-600",
  "from-amber-600 to-orange-600",
  "from-rose-600 to-red-600",
];

const getColor = (name) => {
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return COLORS[sum % COLORS.length];
};

const SubjectCard = ({ subject, onClick, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const gradient = getColor(subject.name);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(subject.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      onClick={() => onClick(subject.id)}
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer
        hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Gradient Header */}
      <div className={`bg-gradient-to-br ${gradient} h-24 flex items-center justify-center`}>
        <BookOpen size={32} className="text-white/80" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-1">
          {subject.name}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <FolderOpen size={13} />
          <span>View folders</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all
          ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "opacity-0 group-hover:opacity-100 bg-black/40 text-white/70 hover:bg-red-500/80 hover:text-white"
          }`}
        title={confirmDelete ? "Click again to confirm" : "Delete subject"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SubjectCard;

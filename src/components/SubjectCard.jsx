import { useState } from "react";
import { Trash2, BookOpen, FolderOpen, Edit2 } from "lucide-react";

const SubjectCard = ({ subject, onClick, onDelete, onEdit }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      {/* Cover Photo Header */}
      <div className="h-28 w-full bg-slate-800 relative">
        <img 
          src={`https://picsum.photos/seed/${subject.id}-subject/400/200`} 
          alt={`${subject.name} cover`} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-3 left-4">
          <div className="w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/10">
            <BookOpen size={18} className="text-white/90" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <h3 className="text-white font-semibold text-base truncate mb-1">
          {subject.name}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5">
          <FolderOpen size={13} />
          <span>View folders</span>
        </div>
      </div>

      {/* Edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        className="absolute top-3 right-11 p-1.5 rounded-lg transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 bg-black/40 border border-white/10 text-white/70 hover:bg-slate-700/90 hover:text-white"
        title="Rename subject"
      >
        <Edit2 size={14} />
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all backdrop-blur-sm
          ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "opacity-0 group-hover:opacity-100 bg-black/40 border border-white/10 text-white/70 hover:bg-red-500/90 hover:border-red-500 hover:text-white"
          }`}
        title={confirmDelete ? "Click again to confirm" : "Delete subject"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SubjectCard;

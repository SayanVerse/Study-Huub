import { useState } from "react";
import { Folder, Trash2, ChevronRight } from "lucide-react";

const FolderCard = ({ folder, onClick, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(folder.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      onClick={() => onClick(folder.id)}
      className="group flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5
        cursor-pointer hover:border-violet-500/50 hover:bg-slate-800/60 transition-all duration-150"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 bg-violet-600/20 rounded-lg flex items-center justify-center shrink-0">
          <Folder size={18} className="text-violet-400" />
        </div>
        <span className="text-slate-200 text-sm font-medium truncate">
          {folder.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-all
            ${
              confirmDelete
                ? "bg-red-500 text-white"
                : "opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
            }`}
          title={confirmDelete ? "Click again to confirm" : "Delete folder"}
        >
          <Trash2 size={14} />
        </button>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
};

export default FolderCard;

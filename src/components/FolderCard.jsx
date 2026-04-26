import { useState } from "react";
import { Folder, Trash2, FileText } from "lucide-react";

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
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer
        hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Cover Photo */}
      <div className="h-32 w-full bg-slate-800 relative">
        <img 
          src={`https://picsum.photos/seed/${folder.id}/400/200`} 
          alt={`${folder.name} cover`} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-4">
          <div className="w-8 h-8 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Folder size={16} className="text-violet-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <h3 className="text-white font-semibold text-sm truncate mb-1">
          {folder.name}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <FileText size={13} />
          <span>View files</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all backdrop-blur-sm
          ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "opacity-0 group-hover:opacity-100 bg-black/40 text-white/70 hover:bg-red-500/80 hover:text-white"
          }`}
        title={confirmDelete ? "Click again to confirm" : "Delete folder"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default FolderCard;

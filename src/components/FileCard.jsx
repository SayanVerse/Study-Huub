import { useState } from "react";
import { FileText, Image, Trash2, Download, ExternalLink } from "lucide-react";
import { deleteFile } from "../services/fileService";
import { useAuth } from "../context/AuthContext";

const FileCard = ({ file, subjectId, folderId, onDeleted }) => {
  const { currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isImage = file.fileType?.startsWith("image/");
  const isPdf = file.fileType === "application/pdf";

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await deleteFile(currentUser.uid, subjectId, folderId, file.id);
      onDeleted?.(file.id);
    } catch (err) {
      console.error("Delete file error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3
      hover:border-slate-600 transition-all duration-150">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        isImage ? "bg-emerald-600/20" : "bg-red-600/20"
      }`}>
        {isImage ? (
          <Image size={18} className="text-emerald-400" />
        ) : (
          <FileText size={18} className="text-red-400" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{file.fileName}</p>
        <p className="text-slate-500 text-xs uppercase mt-0.5">
          {isPdf ? "PDF" : isImage ? "Image" : "File"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={file.fileURL}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
          title="Open"
        >
          <ExternalLink size={15} />
        </a>
        <a
          href={file.fileURL}
          download={file.fileName}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
          title="Download"
        >
          <Download size={15} />
        </a>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`p-1.5 rounded-lg transition-all ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          }`}
          title={confirmDelete ? "Click again to confirm" : "Delete"}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default FileCard;

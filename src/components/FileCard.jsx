import { useState } from "react";
import { FileText, Image, Trash2, Download, ExternalLink, Eye, Star } from "lucide-react";
import { deleteFile, toggleFileStar } from "../services/fileService";
import { useAuth } from "../context/AuthContext";

/**
 * Converts a Cloudinary URL to an inline-viewable URL.
 * Injects `fl_inline` so browsers render PDFs in-tab instead of downloading.
 * Works for both /image/upload/ and /raw/upload/ resource types.
 */
const toInlineUrl = (url) => {
  if (!url) return url;
  if (url.includes("fl_inline")) return url;
  return url.replace(/\/upload\/(?!v\d)/, "/upload/fl_inline/")
             .replace(/\/upload\/(v\d+\/)/, "/upload/fl_inline/$1");
};

const FileCard = ({ file, subjectId, folderId, onDeleted }) => {
  const { currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isImage = file.fileType?.startsWith("image/");
  const isPdf = file.fileType === "application/pdf";
  const isDriveFile = file.fileURL && file.fileURL.includes("drive.google.com");

  // For PDFs: use fl_inline so the browser renders inline, not downloads
  const viewUrl = isPdf && !isDriveFile ? toInlineUrl(file.fileURL) : file.fileURL;

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

  const handleStar = async (e) => {
    e.stopPropagation();
    try {
      await toggleFileStar(currentUser.uid, subjectId, folderId, file.id, file.starred);
    } catch (err) {
      console.error("Toggle star error:", err);
    }
  };

  return (
    <>
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
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate flex items-center gap-2">
              {file.fileName}
              {file.starred && <Star size={12} className="text-amber-400 shrink-0" fill="currentColor" />}
            </p>
            <p className="text-slate-500 text-xs uppercase mt-0.5">
              {isPdf ? "PDF" : isImage ? "Image" : "File"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleStar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
            title={file.starred ? "Unstar" : "Star"}
          >
            <Star size={15} fill={file.starred ? "currentColor" : "none"} className={file.starred ? "text-amber-400" : ""} />
          </button>
          
          {/* PDF/Drive: preview modal; others: open in new tab */}
          {isPdf || isDriveFile ? (
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
              title="Preview"
            >
              <Eye size={15} />
            </button>
          ) : (
            <a
              href={viewUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
              title="Open"
            >
              <ExternalLink size={15} />
            </a>
          )}
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

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-red-400" />
                <span className="text-slate-200 text-sm font-medium truncate max-w-xs md:max-w-md">
                  {file.fileName}
                </span>
                {isDriveFile && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 ml-2">
                    Drive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={15} />
                </a>
                <a
                  href={file.fileURL}
                  download={file.fileName}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                  title="Download"
                >
                  <Download size={15} />
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-lg leading-none ml-1"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Iframe PDF viewer or Drive Fallback */}
            <div className="flex-1 bg-slate-950 relative">
              {isDriveFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-blue-500" viewBox="0 0 87.3 122.88">
                      <path fill="currentColor" d="M19.16,122.88H68.14a19.14,19.14,0,0,0,19.16-19.16V36.21H56.55A16.89,16.89,0,0,1,39.66,19.32V0H19.16A19.14,19.14,0,0,0,0,19.16V103.72A19.14,19.14,0,0,0,19.16,122.88ZM43.43,5.65v13.67a13.11,13.11,0,0,0,13.12,13.11H70.22A17.15,17.15,0,0,0,43.43,5.65ZM23.3,64.29a3,3,0,0,1-3-3v0a3,3,0,0,1,3-3H64a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3Zm0,17.44a3,3,0,0,1-3-3v0a3,3,0,0,1,3-3H64a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3Zm0,17.44a3,3,0,0,1-3-3v0a3,3,0,0,1,3-3H64a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3Z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Google Drive Integration</h3>
                  <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                    Google Drive files cannot be securely embedded within Study Hub. To view this document, please open it directly in Google Drive.
                  </p>
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5"
                  >
                    <ExternalLink size={16} />
                    Open in Google Drive
                  </a>
                </div>
              ) : (
                <iframe
                  src={viewUrl}
                  title={file.fileName}
                  className="w-full h-full border-0 absolute inset-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;

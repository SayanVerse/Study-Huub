import { FileText, ExternalLink, Download } from "lucide-react";

// Converts a Cloudinary URL to an inline-viewable URL
export const toInlineUrl = (url) => {
  if (!url || url.includes("fl_inline")) return url;
  return url.replace(/\/upload\/(?!v\d)/, "/upload/fl_inline/")
             .replace(/\/upload\/(v\d+\/)/, "/upload/fl_inline/$1");
};

const FilePreviewModal = ({ file, onClose }) => {
  const isDriveFile = file.fileURL?.includes("drive.google.com");
  const isPdf = file.fileType === "application/pdf";
  const viewUrl = isPdf && !isDriveFile ? toInlineUrl(file.fileURL) : file.fileURL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-red-400" />
            <span className="text-slate-200 text-sm font-medium truncate max-w-xs md:max-w-md">{file.fileName}</span>
            {isDriveFile && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 ml-2">Drive</span>}
          </div>
          <div className="flex items-center gap-2">
            <a href={viewUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 transition-all" title="Open in new tab"><ExternalLink size={15} /></a>
            <a href={file.fileURL} download={file.fileName} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all" title="Download"><Download size={15} /></a>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-lg leading-none ml-1">✕</button>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 relative">
          {isDriveFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={40} className="text-blue-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Google Drive File</h3>
              <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">This file is stored in Google Drive and cannot be embedded. Open it directly in Drive to view it.</p>
              <a href={viewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5">
                <ExternalLink size={16} /> Open in Google Drive
              </a>
            </div>
          ) : (
            <iframe src={viewUrl} title={file.fileName} className="w-full h-full border-0 absolute inset-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;

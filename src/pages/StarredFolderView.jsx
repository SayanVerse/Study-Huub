import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStarredNotes, updateNoteStarredFolder, toggleStar } from "../services/noteService";
import { getStarredFiles, updateFileStarredFolder, toggleFileStar } from "../services/fileService";
import { subscribeToStarredFolders } from "../services/starredService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import MoveToFolderModal from "../components/MoveToFolderModal";
import FilePreviewModal, { toInlineUrl } from "../components/FilePreviewModal";
import { ChevronLeft, Folder, FileText, Paperclip, Star, FolderInput, Eye, Download, ExternalLink } from "lucide-react";

const parseItemRoute = (item, type) => {
  if (!item._path) return null;
  const parts = item._path.split("/");
  if (parts.length < 8) return null;
  return { subjectId: parts[3], folderId: parts[5], itemId: parts[7] };
};

const StarredFolderView = () => {
  const { starredFolderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [folderName, setFolderName] = useState("");
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingItem, setMovingItem] = useState(null);
  const [indexErrorLink, setIndexErrorLink] = useState(null);
  const [previewingFile, setPreviewingFile] = useState(null);

  // Get the folder name
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToStarredFolders(currentUser.uid, (data) => {
      const folder = data.find(f => f.id === starredFolderId);
      if (folder) setFolderName(folder.name);
      else setFolderName("Unknown Folder");
    });
    return () => unsub();
  }, [currentUser, starredFolderId]);

  const fetchItems = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setIndexErrorLink(null);
    try {
      const n = await getStarredNotes(currentUser.uid).catch(err => {
         console.error(err);
         const match = err.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
         if (match) setIndexErrorLink(match[1]);
         return [];
      });
      const f = await getStarredFiles(currentUser.uid).catch(err => {
         console.error(err);
         const match = err.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
         if (match) setIndexErrorLink(match[1]);
         return [];
      });
      setNotes(n.filter(note => note.starredFolderId === starredFolderId));
      setFiles(f.filter(file => file.starredFolderId === starredFolderId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, starredFolderId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleMoveConfirm = async (newFolderId) => {
    if (!movingItem || !currentUser) return;
    const { type, item } = movingItem;
    const route = parseItemRoute(item, type);
    if (!route) return;

    try {
      if (type === "note") {
        await updateNoteStarredFolder(currentUser.uid, route.subjectId, route.folderId, route.itemId, newFolderId);
        setNotes(notes.filter(n => n.id !== item.id)); // Remove from current view
      } else {
        await updateFileStarredFolder(currentUser.uid, route.subjectId, route.folderId, route.itemId, newFolderId);
        setFiles(files.filter(f => f.id !== item.id)); // Remove from current view
      }
    } catch (err) {
      console.error("Move error:", err);
    } finally {
      setMovingItem(null);
    }
  };

  const handleUnstar = async (type, item, e) => {
    e.stopPropagation();
    const route = parseItemRoute(item, type);
    if (!route) return;
    try {
      if (type === "note") {
        await toggleStar(currentUser.uid, route.subjectId, route.folderId, route.itemId, item.starred);
        setNotes(notes.filter(n => n.id !== item.id));
      } else {
        await toggleFileStar(currentUser.uid, route.subjectId, route.folderId, route.itemId, item.starred);
        setFiles(files.filter(f => f.id !== item.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigateItem = (type, item) => {
    const route = parseItemRoute(item, type);
    if (!route) return;
    if (type === "note") {
      navigate(`/subject/${route.subjectId}/folder/${route.folderId}/note/${route.itemId}`);
    } else {
      navigate(`/subject/${route.subjectId}/folder/${route.folderId}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate("/starred")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Back to Starred
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Folder size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">{folderName}</h2>
            <p className="text-slate-500 text-sm">{notes.length + files.length} items</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {indexErrorLink && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl mb-6 shadow-lg shadow-red-900/10">
            <h3 className="text-red-400 font-bold mb-2">Database Index Required</h3>
            <p className="text-slate-300 text-sm mb-4">
              To view starred files across all your subjects, you need to click the link below to enable a Firestore database index. It only takes a few seconds and is a one-time setup.
            </p>
            <a href={indexErrorLink} target="_blank" rel="noreferrer" className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all">
              Create Index in Firebase Console
            </a>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (notes.length === 0 && files.length === 0) ? (
          <div className="py-20 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder size={24} className="text-slate-600" />
             </div>
             <p className="text-slate-400 text-sm max-w-xs mx-auto">This folder is empty. Go back to Starred and use the move button to add items here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map(note => (
              <div key={note.id} onClick={() => navigateItem('note', note)} className="group bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-600 transition-all">
                <div className="flex items-start gap-2.5 mb-2">
                  <FileText size={16} className="text-violet-400 shrink-0 mt-0.5" />
                  <h4 className="text-slate-200 font-medium text-sm flex-1 truncate">{note.title || "Untitled"}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setMovingItem({type: 'note', item: note})}} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded" title="Move to folder">
                      <FolderInput size={14} />
                    </button>
                    <button onClick={(e) => handleUnstar('note', note, e)} className="p-1.5 hover:bg-slate-800 text-amber-400 hover:text-amber-500 rounded" title="Unstar">
                      <Star size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2">
                  {note.content ? note.content.replace(/<[^>]+>/g, "") : "No content"}
                </p>
              </div>
            ))}
            
            {files.map(file => {
              const isDriveFile = file.fileURL?.includes("drive.google.com");
              const isPdf = file.fileType === "application/pdf";
              const canPreview = isPdf || isDriveFile;
              const viewUrl = isPdf && !isDriveFile ? toInlineUrl(file.fileURL) : file.fileURL;

              return (
                <div key={file.id} className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-all">
                  <div className="flex items-start gap-2.5 mb-3">
                    <Paperclip size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <h4 className="text-slate-200 font-medium text-sm flex-1 truncate">{file.fileName || "File"}</h4>
                  </div>
                  <p className="text-slate-600 text-xs uppercase mb-3">{isPdf ? "PDF" : isDriveFile ? "Drive" : "File"}</p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {canPreview ? (
                      <button onClick={() => setPreviewingFile(file)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 text-xs hover:bg-violet-600/30 transition-all">
                        <Eye size={12} /> Preview
                      </button>
                    ) : (
                      <a href={viewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 text-xs hover:bg-violet-600/30 transition-all">
                        <ExternalLink size={12} /> Open
                      </a>
                    )}
                    <a href={file.fileURL} download={file.fileName} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 text-xs hover:bg-cyan-600/30 transition-all">
                      <Download size={12} /> Download
                    </a>
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={(e) => { e.stopPropagation(); setMovingItem({type: 'file', item: file}); }} className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded" title="Move to folder">
                        <FolderInput size={14} />
                      </button>
                      <button onClick={(e) => handleUnstar('file', file, e)} className="p-1.5 hover:bg-slate-800 text-amber-400 hover:text-amber-500 rounded" title="Unstar">
                        <Star size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {movingItem && (
        <MoveToFolderModal
          onClose={() => setMovingItem(null)}
          onConfirm={handleMoveConfirm}
        />
      )}

      {previewingFile && <FilePreviewModal file={previewingFile} onClose={() => setPreviewingFile(null)} />}
    </div>
  );
};

export default StarredFolderView;

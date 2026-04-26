import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStarredNotes, updateNoteStarredFolder, toggleStar } from "../services/noteService";
import { getStarredFiles, updateFileStarredFolder, toggleFileStar } from "../services/fileService";
import { subscribeToStarredFolders, deleteStarredFolder } from "../services/starredService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import CreateModal from "../components/CreateModal";
import MoveToFolderModal from "../components/MoveToFolderModal";
import FilePreviewModal, { toInlineUrl } from "../components/FilePreviewModal";
import { Star, Folder, FileText, Paperclip, FolderInput, RefreshCw, Trash2, ExternalLink, Download, Eye, X } from "lucide-react";
import { createStarredFolder } from "../services/starredService";

const parseItemRoute = (item, type) => {
  if (!item._path) return null;
  const parts = item._path.split("/");
  if (parts.length < 8) return null;
  return {
    subjectId: parts[3],
    folderId: parts[5],
    itemId: parts[7],
  };
};

const StarredPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  
  const [loadingItems, setLoadingItems] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [movingItem, setMovingItem] = useState(null);
  const [indexErrorLink, setIndexErrorLink] = useState(null);
  const [previewingFile, setPreviewingFile] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!currentUser) return;
    setLoadingItems(true);
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
      setNotes(n);
      setFiles(f);
    } catch (err) {
      console.error("Fetch starred items error:", err);
    } finally {
      setLoadingItems(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToStarredFolders(currentUser.uid, (data) => {
      setFolders(data);
    });
    return () => unsub();
  }, [currentUser]);

  const handleCreateFolder = async (name) => {
    setCreatingFolder(true);
    try {
      await createStarredFolder(currentUser.uid, name);
      setShowCreateFolder(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleMoveConfirm = async (folderId) => {
    if (!movingItem || !currentUser) return;
    const { type, item } = movingItem;
    const route = parseItemRoute(item, type);
    if (!route) return;

    try {
      if (type === "note") {
        await updateNoteStarredFolder(currentUser.uid, route.subjectId, route.folderId, route.itemId, folderId);
      } else {
        await updateFileStarredFolder(currentUser.uid, route.subjectId, route.folderId, route.itemId, folderId);
      }
      // Optimistically update local state
      if (type === "note") {
        setNotes(notes.map(n => n.id === item.id ? { ...n, starredFolderId: folderId } : n));
      } else {
        setFiles(files.map(f => f.id === item.id ? { ...f, starredFolderId: folderId } : f));
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

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this folder? Items inside will become unorganized.")) {
      await deleteStarredFolder(currentUser.uid, folderId);
    }
  };

  // Only show items that don't belong to any starred folder (or belong to a deleted one)
  const folderIds = new Set(folders.map(f => f.id));
  const unorganizedNotes = notes.filter(n => !n.starredFolderId || !folderIds.has(n.starredFolderId));
  const unorganizedFiles = files.filter(f => !f.starredFolderId || !folderIds.has(f.starredFolderId));

  const navigateItem = (type, item) => {
    const route = parseItemRoute(item, type);
    if (!route) return;
    if (type === "note") {
      navigate(`/subject/${route.subjectId}/folder/${route.folderId}/note/${route.itemId}`);
    } else {
      // Just navigate to the subject folder where it lives so they can preview it there, 
      // or open Drive link if we wanted. But navigating to its folder is fine.
      navigate(`/subject/${route.subjectId}/folder/${route.folderId}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Starred Collections</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Organize your most important notes and files
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchItems}
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
              title="Refresh Items"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 text-sm font-medium transition-all"
            >
              <Folder size={15} />
              New Folder
            </button>
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

        {/* Folders Grid */}
        {folders.length > 0 && (
          <div className="mb-10">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Folders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.map(folder => {
                const itemCount = 
                  notes.filter(n => n.starredFolderId === folder.id).length + 
                  files.filter(f => f.starredFolderId === folder.id).length;
                  
                return (
                  <div
                    key={folder.id}
                    onClick={() => navigate(`/starred/${folder.id}`)}
                    className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/10 transition-all hover:-translate-y-0.5"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                      <Folder size={24} className="text-amber-400" />
                    </div>
                    <h4 className="text-white font-medium mb-1 truncate pr-8">{folder.name}</h4>
                    <p className="text-slate-500 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                    
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete folder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unorganized Items */}
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
            Unorganized Items
          </h3>
          
          {loadingItems ? (
            <Loader />
          ) : (unorganizedNotes.length === 0 && unorganizedFiles.length === 0) ? (
             <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
               <Star size={32} className="text-slate-700 mx-auto mb-3" />
               <p className="text-slate-400 text-sm">No unorganized starred items.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Notes */}
              {unorganizedNotes.map(note => (
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
              
              {/* Files */}
              {unorganizedFiles.map(file => {
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
      </div>

      {showCreateFolder && (
        <CreateModal
          title="New Starred Folder"
          placeholder="e.g. Important PDFs, Math Notes..."
          onConfirm={handleCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          loading={creatingFolder}
        />
      )}

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

export default StarredPage;

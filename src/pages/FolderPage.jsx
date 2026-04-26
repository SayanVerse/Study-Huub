import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import { useFiles } from "../hooks/useFiles";
import { createNote, deleteNote } from "../services/noteService";
import { uploadFile } from "../services/fileService";
import NoteCard from "../components/NoteCard";
import FileCard from "../components/FileCard";
import CreateModal from "../components/CreateModal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import {
  Plus,
  Upload,
  ChevronLeft,
  FileText,
  Paperclip,
  AlertCircle,
  X,
} from "lucide-react";

const FolderPage = () => {
  const { subjectId, folderId } = useParams();
  const { currentUser } = useAuth();
  const { notes, loading: notesLoading } = useNotes(subjectId, folderId);
  const { files, loading: filesLoading } = useFiles(subjectId, folderId);
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const filteredNotes = search
    ? notes.filter((n) =>
        n.title?.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  const handleCreateNote = async (title) => {
    setCreating(true);
    try {
      const docRef = await createNote(currentUser.uid, subjectId, folderId, {
        title,
        content: "",
      });
      setShowCreate(false);
      navigate(
        `/subject/${subjectId}/folder/${folderId}/note/${docRef.id}`
      );
    } catch (err) {
      console.error("Create note error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(currentUser.uid, subjectId, folderId, noteId);
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF and image files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File size must be under 20 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      await uploadFile(currentUser.uid, subjectId, folderId, file, (p) =>
        setUploadProgress(p)
      );
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF and image files can be dropped here.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      await uploadFile(currentUser.uid, subjectId, folderId, file, (p) => setUploadProgress(p));
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [currentUser, subjectId, folderId]);

  const handleDragEnter = (e) => { e.preventDefault(); dragCounterRef.current++; setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); };

  return (
    <div className="flex-1">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(`/subject/${subjectId}`)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Back to Subject
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-white text-xl font-bold">Folder Contents</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700
                text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all disabled:opacity-60"
            >
              <Upload size={15} />
              {uploading ? `${uploadProgress}%` : "Upload"}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
                text-white text-sm font-medium transition-all shadow-lg shadow-violet-900/40"
            >
              <Plus size={15} />
              New Note
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {uploadError && (
          <div className="flex items-center gap-2 mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-xs flex-1">{uploadError}</p>
            <button onClick={() => setUploadError("")}>
              <X size={14} className="text-red-400" />
            </button>
          </div>
        )}

        {/* Mobile search */}
        <div className="mt-3">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      <div
        className={`px-6 pb-6 space-y-8 relative ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      >
        {/* Drag over overlay */}
        {dragOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-violet-950/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-violet-500 pointer-events-none">
            <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mb-4">
              <Upload size={32} className="text-violet-400" />
            </div>
            <p className="text-violet-300 font-semibold text-lg">Drop to upload</p>
            <p className="text-violet-400/70 text-sm mt-1">PDF or image files</p>
          </div>
        )}
        {/* Notes Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-violet-400" />
            <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Notes ({filteredNotes.length})
            </h3>
          </div>

          {notesLoading ? (
            <Loader />
          ) : filteredNotes.length === 0 ? (
            <p className="text-slate-600 text-sm py-4">
              {search ? "No notes match your search." : "No notes yet. Create your first note!"}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  subjectId={subjectId}
                  folderId={folderId}
                  onClick={(nid) =>
                    navigate(`/subject/${subjectId}/folder/${folderId}/note/${nid}`)
                  }
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </section>

        {/* Files Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Paperclip size={16} className="text-cyan-400" />
            <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Files ({files.length})
            </h3>
          </div>

          {filesLoading ? (
            <Loader />
          ) : files.length === 0 ? (
            <p className="text-slate-600 text-sm py-4">
              No files uploaded yet. Click &ldquo;Upload&rdquo; to add PDFs or images.
            </p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  subjectId={subjectId}
                  folderId={folderId}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <CreateModal
          title="New Note"
          placeholder="Note title..."
          onConfirm={handleCreateNote}
          onClose={() => setShowCreate(false)}
          loading={creating}
        />
      )}
    </div>
  );
};

export default FolderPage;

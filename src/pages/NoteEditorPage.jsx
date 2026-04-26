import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateNote, toggleStar } from "../services/noteService";
import { logActivity } from "../services/activityService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import TagInput from "../components/TagInput";
import {
  ChevronLeft, Star, Save, Bold, Italic, UnderlineIcon, List,
  ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading2,
  Heading3, Check, Highlighter, Code, FileCode,
} from "lucide-react";

const lowlight = createLowlight();

const NoteEditorPage = () => {
  const { subjectId, folderId, noteId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [starred, setStarred] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your note..." }),
      Highlight.configure({ multicolor: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: "prose-editor max-w-none focus:outline-none min-h-[60vh] leading-relaxed",
      },
    },
  });

  // Load note from Firestore
  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, "users", currentUser.uid, "subjects", subjectId, "folders", folderId, "notes", noteId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNote({ id: snap.id, ...data });
          setTitle(data.title || "");
          setStarred(data.starred || false);
          setTags(data.tags || []);
          if (editor && data.content) {
            editor.commands.setContent(data.content);
          }
          // Log activity
          logActivity(currentUser.uid, {
            type: "note",
            title: data.title || "Untitled",
            path: `/subject/${subjectId}/folder/${folderId}/note/${noteId}`,
            subjectId,
            folderId,
          });
        }
      } catch (err) {
        console.error("Load note error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (editor) fetch();
  }, [editor, currentUser.uid, subjectId, folderId, noteId]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await updateNote(currentUser.uid, subjectId, folderId, noteId, {
        title: title.trim() || "Untitled",
        content: editor.getHTML(),
        tags,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setSaving(false);
    }
  }, [editor, title, tags, currentUser.uid, subjectId, folderId, noteId]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  const handleStar = async () => {
    try {
      await toggleStar(currentUser.uid, subjectId, folderId, noteId, starred);
      setStarred((s) => !s);
    } catch (err) {
      console.error("Star error:", err);
    }
  };

  // Word count
  const wordCount = editor
    ? editor.getText().split(/\s+/).filter(Boolean).length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 px-4 lg:px-6 py-3 border-b flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        {/* Top: Back, Title, Star, Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/subject/${subjectId}/folder/${folderId}`)}
            className="hover:opacity-70 transition-opacity shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 bg-transparent font-bold text-lg focus:outline-none placeholder-slate-500"
            style={{ color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleStar}
              className={`p-2 rounded-lg transition-colors ${
                starred ? "text-amber-400 bg-amber-400/10" : "text-slate-500 hover:text-amber-400 hover:bg-amber-400/10"
              }`}
              title={starred ? "Unstar" : "Star note"}
            >
              <Star size={18} fill={starred ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${saved ? "bg-emerald-600 text-white" : "bg-violet-600 hover:bg-violet-500 text-white"} disabled:opacity-60`}
            >
              {saved ? <><Check size={14} /> Saved</> : saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <><Save size={14} /> Save</>}
            </button>
          </div>
        </div>

        {/* Tags */}
        <TagInput tags={tags} onChange={setTags} />

        {/* Formatting toolbar */}
        {editor && (
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)"><Bold size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)"><Italic size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight"><Highlighter size={14} /></ToolbarBtn>
            <div className="w-px h-5 bg-slate-600/40 mx-1" />
            <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 size={14} /></ToolbarBtn>
            <div className="w-px h-5 bg-slate-600/40 mx-1" />
            <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered size={14} /></ToolbarBtn>
            <div className="w-px h-5 bg-slate-600/40 mx-1" />
            <ToolbarBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code"><Code size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block"><FileCode size={14} /></ToolbarBtn>
            <div className="w-px h-5 bg-slate-600/40 mx-1" />
            <ToolbarBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left"><AlignLeft size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center"><AlignCenter size={14} /></ToolbarBtn>
            <ToolbarBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right"><AlignRight size={14} /></ToolbarBtn>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{wordCount} words</span>
              <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Ctrl+S to save</span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 px-4 lg:px-16 xl:px-32 py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active ? "bg-violet-600 text-white" : "hover:bg-slate-700/50"
    }`}
    style={active ? {} : { color: 'var(--text-muted)' }}
  >
    {children}
  </button>
);

export default NoteEditorPage;

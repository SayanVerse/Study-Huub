import { useState } from "react";
import { X, Tag } from "lucide-react";

const TAG_COLORS = [
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "bg-orange-500/20 text-orange-300 border-orange-500/30",
];

const getTagColor = (tag) => {
  let sum = 0;
  for (let c of tag) sum += c.charCodeAt(0);
  return TAG_COLORS[sum % TAG_COLORS.length];
};

export { getTagColor };

const TagInput = ({ tags = [], onChange }) => {
  const [input, setInput] = useState("");

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-slate-800/50 dark:bg-slate-800/50 rounded-xl border border-slate-700 dark:border-slate-700 min-h-[38px] focus-within:border-violet-500/60 transition-colors">
      <Tag size={13} className="text-slate-500 shrink-0" />
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
        className="bg-transparent text-slate-300 text-xs focus:outline-none placeholder-slate-600 min-w-[120px] flex-1"
      />
    </div>
  );
};

export default TagInput;

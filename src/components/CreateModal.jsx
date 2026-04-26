import { useState } from "react";
import { X, Plus } from "lucide-react";

const CreateModal = ({ title, placeholder, initialValue = "", onConfirm, onClose, loading = false }) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5">
          <input
            type="text"
            placeholder={placeholder || "Enter name..."}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl
              px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

          <div className="flex items-center justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center min-w-[100px] gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
                rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Plus size={15} className="shrink-0" />
              )}
              {initialValue ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModal;

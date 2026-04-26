import { Menu, Search } from "lucide-react";

const Navbar = ({ onMenuClick, title, searchValue, onSearchChange, showSearch = false }) => {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 px-4 lg:px-6 py-3.5 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={22} />
      </button>

      <h1 className="text-white font-semibold text-base sm:text-lg flex-1 truncate">
        {title}
      </h1>

      {showSearch && (
        <div className="relative hidden sm:flex items-center">
          <Search
            size={15}
            className="absolute left-3 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 rounded-lg pl-9 pr-4 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search notes..." }) => {
  return (
    <div className="relative w-full sm:hidden">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500
          rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
      />
    </div>
  );
};

export default SearchBar;

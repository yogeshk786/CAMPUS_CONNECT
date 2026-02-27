import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="sticky top-0 bg-black pt-1 pb-3 z-10">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1d9bf0]">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search CampusConnect" 
          className="w-full bg-[#202327] text-white pl-12 pr-4 py-3 rounded-full outline-none focus:bg-black focus:border focus:border-[#1d9bf0] transition"
        />
      </div>
    </div>
  );
}
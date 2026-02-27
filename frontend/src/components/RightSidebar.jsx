import SearchBar from './SearchBar';

export default function RightSidebar() {
  // Dummy data for now
  const suggestedUsers = [
    { _id: '1', name: 'Alumni Network', handle: 'alumni_cell', dept: 'University' },
    { _id: '2', name: 'Tech Club', handle: 'tech_geeks', dept: 'CS' },
  ];

  return (
    <aside className="w-full">
      <SearchBar />

      <div className="bg-[#16181c] rounded-2xl border border-gray-800 pt-3 mt-4">
        <h3 className="text-xl font-extrabold px-4 mb-3 text-white">Suggested Connections</h3>
        
        <div className="flex flex-col">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="hover:bg-white/[0.03] px-4 py-3 cursor-pointer transition flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white uppercase">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-white hover:underline truncate text-[15px]">{user.name}</span>
                  <span className="text-gray-500 text-[14px] truncate">@{user.handle}</span>
                </div>
              </div>
              <button className="bg-white text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-gray-200 transition">
                Connect
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 hover:bg-white/[0.03] transition cursor-pointer rounded-b-2xl">
          <span className="text-[#1d9bf0] text-[15px]">Show more</span>
        </div>
      </div>
    </aside>
  );
}
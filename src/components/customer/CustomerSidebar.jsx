"use client";

import Link from "next/link";

export default function CustomerSidebar({ publicNav, accountNav, pathname, user, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Menu</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <p className="px-4 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Public
        </p>
        <div className="space-y-0.5">
          {publicNav.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm mx-2 rounded-xl transition ${
                pathname === item.path
                  ? "bg-[#1790d7]/10 text-[#1790d7] font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </div>
        <p className="px-4 mt-6 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          My Account
        </p>
        <div className="space-y-0.5">
          {accountNav.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm mx-2 rounded-xl transition ${
                pathname === item.path
                  ? "bg-[#1790d7]/10 text-[#1790d7] font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Support
        </p>
        <div className="space-y-1 text-sm">
          <Link href="/about" className="block text-gray-600 hover:text-[#1790d7]">
            About Us
          </Link>
          <Link href="/contact" className="block text-gray-600 hover:text-[#1790d7]">
            Contact
          </Link>
          <Link href="/blogs" className="block text-gray-600 hover:text-[#1790d7]">
            Blog
          </Link>
        </div>
      </div>
    </aside>
  );
}

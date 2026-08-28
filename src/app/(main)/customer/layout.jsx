"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight, User } from "lucide-react";
import ChatFAB from "@/components/chat/ChatFAB";
import useAuth from "@/hooks/useAuth";
import CustomerSidebarNav from "@/components/customer/sidebar/CustomerSidebarNav";

export default function CustomerAccountLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("customer_sidebar_collapsed");
    if (saved === "1") setSidebarCollapsed(true);
    else if (saved === "0") setSidebarCollapsed(false);
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("customer_sidebar_collapsed", next ? "1" : "0");
    }
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pl-[10px] pr-4 sm:pr-6 lg:pr-8 py-6 lg:py-8 min-h-[60vh] bg-gradient-to-b from-white via-gray-50/30 to-gray-50/50">
      <div className="lg:hidden flex items-center gap-2 w-full">
        <Link
          href="/customer/profile"
          className="inline-flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 hover:text-[#1790d7] transition-all"
          aria-label="Profile"
          title="Profile"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 min-w-0 transition-all hover:shadow-md"
        >
          <Menu size={20} />
          Menu
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden flex flex-col border-r border-gray-100 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Account"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          <CustomerSidebarNav
            pathname={pathname}
            user={user}
            collapsed={false}
            onNavigate={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`flex-shrink-0 hidden lg:block transition-all duration-300 ${
          sidebarCollapsed ? "w-[72px]" : "w-56 xl:w-64"
        }`}
      >
        <div className="sticky top-24 bg-white/95 backdrop-blur rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 overflow-hidden mb-8 flex flex-col max-h-[calc(100vh-7rem)]">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center gap-2 py-2 border-b border-gray-100 text-gray-500 hover:bg-gray-50 text-xs shrink-0"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" /> Collapse
              </>
            )}
          </button>
          <div className={`border-b border-gray-100 shrink-0 ${sidebarCollapsed ? "p-2" : "p-4"}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center text-white font-semibold shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Account"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className={`space-y-0.5 ${sidebarCollapsed ? "flex flex-col items-center" : ""}`}>
              <CustomerSidebarNav
                pathname={pathname}
                user={user}
                collapsed={sidebarCollapsed}
                onLogout={handleLogout}
              />
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-4 sm:p-6 lg:p-8">
        {children}
      </div>
      {user && <ChatFAB />}
    </div>
  );
}

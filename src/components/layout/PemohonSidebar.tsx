"use client";

import { Home, FileText, MessageCircle, User, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PemohonSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      href: "/pemohon/dashboard",
      icon: Home,
      label: "Dashboard"
    },
    {
      href: "/pemohon/permohonan",
      icon: FileText,
      label: "Permohonan"
    },
    {
      href: "/pemohon/keberatan",
      icon: AlertTriangle,
      label: "Keberatan"
    },
    {
      href: "/pemohon/chat",
      icon: MessageCircle,
      label: "Chat"
    },
    {
      href: "/pemohon/profile",
      icon: User,
      label: "Profile"
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-md h-screen transition-all duration-300`}>
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">PPID Diskominfo Garut</h1>
          <div className="text-sm text-gray-600">
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mb-1 inline-block">
              Pemohon
            </div>
            <p className="text-xs">camvr35@gmail.com</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="px-2 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default PemohonSidebar;
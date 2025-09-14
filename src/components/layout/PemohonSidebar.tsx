"use client";

import {
  Home,
  FileText,
  MessageCircle,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePemohonNotifications } from "@/hooks/usePemohonNotifications";

const PemohonSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chatCount, clearNotifications, refreshNotifications } = usePemohonNotifications();
  
  console.log('[PemohonSidebar] chatCount:', chatCount);

  const menuItems = [
    {
      href: "/pemohon/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/pemohon/permohonan",
      icon: FileText,
      label: "Permohonan",
    },
    {
      href: "/pemohon/keberatan",
      icon: AlertTriangle,
      label: "Keberatan",
    },
    {
      href: "/pemohon/chat",
      icon: MessageCircle,
      label: "Chat",
    },
    {
      href: "/pemohon/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-white shadow-md h-screen transition-all duration-300 flex flex-col overflow-hidden`}
    >
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            PPID Diskominfo Garut
          </h1>
          <div className="text-sm text-gray-600">
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mb-1 inline-block">
              Pemohon
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Debug: Chat = {chatCount}
              <button 
                onClick={refreshNotifications}
                className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
              >
                Test
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end p-2 gap-1">
        {!isCollapsed && (
          <button
            onClick={refreshNotifications}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="px-2 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.label === 'Chat') {
                  clearNotifications();
                }
              }}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
              {/* Notification Badge */}
              {item.label === 'Chat' && chatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chatCount > 99 ? '99+' : chatCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default PemohonSidebar;

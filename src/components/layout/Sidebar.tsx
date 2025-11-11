"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleDisplayName } from "@/lib/roleUtils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useOptimizedNotifications } from "@/hooks/useOptimizedNotifications";
import React from "react";

type PermissionKey =
  | "informasi"
  | "kategori"
  | "chat"
  | "permohonan"
  | "keberatan"
  | "kelola_akun"
  | "manajemen_role"
  | "kelola_akses"
  | "log_aktivitas"
  | "pengaturan"
  | "media"
  | "profile"
  | "kelola_halaman";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
  Info,
  FolderOpen,
  UserCog,
  UserCircle,
  MessageCircle,
  Shield,
  Activity,
  HardDrive,
  Minus,
  BarChart3,
  Globe,
  RefreshCw,
} from "lucide-react";

const menuItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: null,
    category: "main",
  },
  {
    href: "/admin/permohonan",
    icon: FileText,
    label: "Permohonan",
    permission: "permohonan",
    category: "request",
  },
  {
    href: "/admin/keberatan",
    icon: AlertTriangle,
    label: "Keberatan",
    permission: "keberatan",
    category: "request",
  },
  {
    href: "/admin/chat",
    icon: MessageCircle,
    label: "Chat",
    permission: "chat",
    category: "request",
  },

  {
    href: "/admin/informasi",
    icon: Info,
    label: "Informasi Publik",
    permission: "informasi",
    category: "content",
  },
  {
    href: "/admin/kategori",
    icon: FolderOpen,
    label: "Kategori",
    permission: "kategori",
    category: "content",
  },

  {
    href: "/admin/akun",
    icon: UserCog,
    label: "Kelola Akun",
    permission: "kelola_akun",
    category: "user",
  },
  {
    href: "/admin/approve-akun",
    icon: Users,
    label: "Approve Akun",
    permission: "kelola_akun",
    category: "user",
  },
  {
    href: "/admin/roles",
    icon: Users,
    label: "Manajemen Role",
    permission: "manajemen_role",
    category: "user",
  },
  {
    href: "/admin/permissions",
    icon: Shield,
    label: "Kelola Akses",
    permission: "kelola_akses",
    category: "user",
  },
  {
    href: "/admin/halaman",
    icon: Globe,
    label: "Kelola Halaman",
    permission: "kelola_halaman",
    category: "user",
  },
  {
    href: "/admin/laporan",
    icon: BarChart3,
    label: "Laporan",
    permission: null,
    category: "report",
  },
  {
    href: "/admin/logs",
    icon: Activity,
    label: "Log Aktivitas",
    permission: "log_aktivitas",
    category: "report",
  },
  {
    href: "/admin/media",
    icon: HardDrive,
    label: "Media",
    permission: "media",
    category: "system",
  },
  {
    href: "/admin/pengaturan",
    icon: Settings,
    label: "Pengaturan",
    permission: "pengaturan",
    category: "system",
  },
  {
    href: "/admin/profile",
    icon: UserCircle,
    label: "Profil Saya",
    permission: "profile",
    category: "profile",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const { hasPermission } = useUserPermissions();
  const { counts, clearNotification, getDisplayCount, refreshNotifications } =
    useOptimizedNotifications();

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true; // Dashboard, Kelola Halaman, Laporan always visible

    // Admin and PPID Utama have full access to all menus immediately
    if (
      userRole === "ADMIN" ||
      userRole === "PPID_UTAMA" ||
      userRole === "PPID"
    )
      return true;

    // Fallback permissions when database is unstable
    // Show basic menus based on role even if permission check fails
    if (userRole === "PPID_PELAKSANA" || userRole === "ATASAN_PPID") {
      const basicMenus = [
        "permohonan",
        "keberatan",
        "chat",
        "informasi",
        "kategori",
        "profile",
      ];
      if (basicMenus.includes(item.permission as string)) {
        return true;
      }
    }

    // PPID Utama gets access to kelola_halaman
    if (
      (userRole === "PPID" || userRole === "PPID_UTAMA") &&
      item.permission === "kelola_halaman"
    ) {
      return true;
    }

    // Try permission check, but don't fail if database is down
    try {
      return hasPermission(item.permission as PermissionKey);
    } catch (error) {
      console.warn("Permission check failed, using fallback:", error);
      // Fallback: show basic menus for authenticated users
      return userRole !== null;
    }
  });

  return (
    <>
      {/* Mobile Toggle Button - Arrow Style */}
      <button
        onClick={onToggle}
        className={`lg:hidden fixed top-1/2 -translate-y-1/2 z-[60] p-2 bg-white rounded-r-lg shadow-lg border hover:bg-gray-50 transition-all duration-300 ${
          isOpen ? "left-64" : "left-0"
        }`}
        title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-all duration-300 ease-in-out flex flex-col
        ${
          isOpen
            ? "w-64 translate-x-0 z-50"
            : "w-16 -translate-x-full lg:translate-x-0 lg:z-40"
        }
      `}
      >
        {/* Header Info with Toggle */}
        <div
          className={`p-4 border-b transition-all duration-300 ${
            isOpen
              ? "opacity-100 block"
              : "opacity-0 lg:opacity-100 hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between">
            {isOpen ? (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-800 truncate">
                  {getRoleDisplayName(userRole)}
                </h2>
                <p className="text-xs text-gray-600 truncate">
                  {userRole === "PPID"
                    ? "PPID Utama"
                    : userRole === "PPID_Pelaksana"
                    ? "PPID Pelaksana"
                    : userRole === "Atasan_PPID"
                    ? "Atasan PPID"
                    : "Administrator"}{" "}
                  - Diskominfo Garut
                </p>
              </div>
            ) : (
              <div className="hidden lg:flex justify-center w-full">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            )}

            {/* Desktop Toggle Button - Integrated */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={refreshNotifications}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Refresh Notifications"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={onToggle}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded transition-colors z-10"
                title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
              >
                {isOpen ? (
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 overflow-y-auto overflow-x-hidden px-2">
          {(() => {
            let lastCategory = "";
            return visibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const showSeparator = item.category !== lastCategory && index > 0;
              lastCategory = item.category;

              return (
                <div key={item.href}>
                  {/* Category Separator */}
                  {showSeparator && isOpen && (
                    <div className="px-4 py-2">
                      <div className="border-t border-gray-200"></div>
                    </div>
                  )}
                  {showSeparator && !isOpen && (
                    <div className="px-4 py-1">
                      <div className="flex justify-center">
                        <Minus className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  )}

                  <Link
                    href={item.href}
                    onClick={() => {
                      // Clear notifications based on menu
                      if (item.label === "Approve Akun") {
                        setTimeout(
                          () => clearNotification("pendingAccounts"),
                          100
                        );
                      } else if (item.label === "Chat") {
                        setTimeout(() => clearNotification("newChats"), 100);
                      } else if (item.label === "Permohonan") {
                        setTimeout(() => clearNotification("newRequests"), 100);
                      } else if (item.label === "Keberatan") {
                        setTimeout(
                          () => clearNotification("newObjections"),
                          100
                        );
                      } else if (item.label === "Log Aktivitas") {
                        setTimeout(
                          () => clearNotification("activityLogs"),
                          100
                        );
                      } else if (item.label === "Media") {
                        setTimeout(() => clearNotification("newMedia"), 100);
                      }

                      // Mark logs as viewed in localStorage with user-specific key
                      if (item.label === "Log Aktivitas") {
                        const token = localStorage.getItem("auth_token");
                        if (token) {
                          const storageKey = `lastViewedLogId_${userRole}_${token.substring(
                            0,
                            10
                          )}`;

                          // Fetch latest log ID and store it
                          fetch("/api/activity-logs?limit=1", {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                            .then((res) => res.json())
                            .then((data) => {
                              if (
                                data.success &&
                                data.data &&
                                data.data.length > 0
                              ) {
                                localStorage.setItem(
                                  storageKey,
                                  String(data.data[0].id)
                                );
                              }
                            })
                            .catch(() => {});
                        }
                      }

                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`flex items-center py-3 text-sm font-medium transition-colors group relative ${
                      isActive
                        ? "text-blue-800 bg-blue-50 border-r-2 border-blue-800"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${isOpen ? "px-4" : "px-4 lg:justify-center"}`}
                    title={!isOpen ? item.label : ""}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isOpen ? "mr-3" : "lg:mr-0"
                      }`}
                    />
                    <span
                      className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                        isOpen
                          ? "opacity-100 max-w-full"
                          : "opacity-0 lg:opacity-0 max-w-0 lg:max-w-0"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Notification Badges */}
                    {(() => {
                      try {
                        let count = 0;
                        if (counts && typeof counts === "object") {
                          if (item.label === "Approve Akun")
                            count = counts.pendingAccounts || 0;
                          else if (item.label === "Chat")
                            count = counts.newChats || 0;
                          else if (item.label === "Permohonan")
                            count = counts.newRequests || 0;
                          else if (item.label === "Keberatan")
                            count = counts.newObjections || 0;
                          else if (item.label === "Log Aktivitas")
                            count = counts.activityLogs || 0;
                          else if (item.label === "Media")
                            count = counts.newMedia || 0;
                        }

                        if (count > 0) {
                          return (
                            <span
                              key={`badge-${item.href}-${count}`}
                              className={`bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${
                                isOpen ? "ml-auto" : "absolute -top-1 -right-1"
                              }`}
                            >
                              {count > 99 ? "99+" : count}
                            </span>
                          );
                        }
                        return null;
                      } catch (error) {
                        console.warn("Badge render error:", error);
                        return null;
                      }
                    })()}

                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="hidden lg:block absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </div>
              );
            });
          })()}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

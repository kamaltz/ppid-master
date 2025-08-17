"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES, getRoleDisplayName, canAccessMenu } from "@/lib/roleUtils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Globe,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
  Info,
  FolderOpen,
  UserCog,
  UserCircle,
} from "lucide-react";

const menuItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: [ROLES.ADMIN, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID],
  },
  {
    href: "/admin/ppid-dashboard",
    icon: LayoutDashboard,
    label: "Dashboard PPID",
    roles: [ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA],
  },
  {
    href: "/admin/permohonan",
    icon: FileText,
    label: "Permohonan",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID],
  },
  {
    href: "/admin/informasi",
    icon: Info,
    label: "Informasi",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA],
  },
  {
    href: "/admin/kategori",
    icon: FolderOpen,
    label: "Kategori Informasi",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA],
  },
  {
    href: "/admin/keberatan",
    icon: AlertTriangle,
    label: "Keberatan",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID],
  },
  {
    href: "/admin/halaman",
    icon: Globe,
    label: "Kelola Halaman",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA],
  },
  {
    href: "/admin/laporan",
    icon: BarChart3,
    label: "Laporan",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID],
  },
  {
    href: "/admin/akun",
    icon: UserCog,
    label: "Kelola Akun",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA],
  },
  {
    href: "/admin/profile",
    icon: UserCircle,
    label: "Profile",
    roles: [ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID],
  },
  {
    href: "/admin/pengaturan",
    icon: Settings,
    label: "Pengaturan",
    roles: [ROLES.ADMIN],
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
  const visibleMenuItems = menuItems.filter((item) =>
    canAccessMenu(userRole, item.roles)
  );



  return (
    <>
      {/* Mobile Toggle Button - Arrow Style */}
      <button
        onClick={onToggle}
        className={`lg:hidden fixed top-1/2 -translate-y-1/2 z-50 p-2 bg-white rounded-r-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${
          isOpen ? 'left-64' : 'left-0'
        }`}
        title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out pt-16
        ${isOpen 
          ? 'w-64 translate-x-0 z-50' 
          : 'w-16 -translate-x-full lg:translate-x-0 lg:z-40'
        }
      `}>
        {/* Header Info with Toggle */}
        <div className={`p-4 border-b transition-all duration-300 ${
          isOpen ? 'opacity-100 block' : 'opacity-0 lg:opacity-100 hidden lg:block'
        }`}>
          <div className="flex items-center justify-between">
            {isOpen ? (
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 text-truncate">
                  {getRoleDisplayName(userRole)}
                </h2>
                <p className="text-xs text-gray-600 text-truncate">
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
            <button
              onClick={onToggle}
              className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            >
              {isOpen ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`flex items-center py-3 text-sm font-medium transition-colors group ${
                  isActive
                    ? "text-blue-800 bg-blue-50 border-r-2 border-blue-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${
                  isOpen ? 'px-4' : 'px-4 lg:justify-center'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isOpen ? 'mr-3' : 'lg:mr-0'
                }`} />
                <span className={`text-truncate transition-all duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0 w-0 lg:w-0'
                }`}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="hidden lg:block absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>


      </div>
    </>
  );
};

export default Sidebar;

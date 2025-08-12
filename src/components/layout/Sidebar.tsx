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
  LogOut,
  BarChart3,
  Globe,
  AlertTriangle,
  User
} from "lucide-react";

const menuItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: [ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]
  },
  {
    href: "/admin/permohonan",
    icon: FileText,
    label: "Permohonan",
    roles: [ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]
  },
  {
    href: "/admin/informasi",
    icon: Users,
    label: "Informasi",
    roles: [ROLES.ADMIN, ROLES.PPID]
  },
  {
    href: "/admin/keberatan",
    icon: AlertTriangle,
    label: "Keberatan",
    roles: [ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]
  },
  {
    href: "/admin/halaman",
    icon: Globe,
    label: "Kelola Halaman",
    roles: [ROLES.ADMIN, ROLES.PPID]
  },
  {
    href: "/admin/laporan",
    icon: BarChart3,
    label: "Laporan",
    roles: [ROLES.ADMIN, ROLES.ATASAN_PPID]
  },
  {
    href: "/admin/akun",
    icon: Users,
    label: "Kelola Akun",
    roles: [ROLES.ADMIN]
  },
  {
    href: "/admin/profile",
    icon: User,
    label: "Profile",
    roles: [ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]
  },
  {
    href: "/admin/pengaturan",
    icon: Settings,
    label: "Pengaturan",
    roles: [ROLES.ADMIN]
  }
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, getUserRole } = useAuth();
  const userRole = getUserRole();
  const visibleMenuItems = menuItems.filter(item => canAccessMenu(userRole, item.roles));

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">{getRoleDisplayName(userRole)}</h2>
        <p className="text-sm text-gray-600">
          {userRole === 'PPID' ? 'PPID Utama' : 
           userRole === 'PPID_Pelaksana' ? 'PPID Pelaksana' :
           userRole === 'Atasan_PPID' ? 'Atasan PPID' : 
           'Administrator'} - Diskominfo Garut
        </p>
      </div>
      
      <nav className="mt-6">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-800 border-r-2 border-blue-800"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
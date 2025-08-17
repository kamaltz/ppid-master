export const ROLES = {
  ADMIN: "ADMIN",
  PPID: "PPID", 
  PPID_UTAMA: "PPID_UTAMA",
  PPID_PELAKSANA: "PPID_PELAKSANA",
  ATASAN_PPID: "ATASAN_PPID",
  PEMOHON: "PEMOHON"
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
export type AdminRole = "ADMIN" | "PPID_PELAKSANA" | "PPID" | "PPID_UTAMA" | "ATASAN_PPID";

export const isAdmin = (role: string | null): boolean => {
  return role === ROLES.ADMIN;
};

export const isPPID = (role: string | null): boolean => {
  return role === ROLES.PPID;
};

export const isAtasanPPID = (role: string | null): boolean => {
  return role === ROLES.ATASAN_PPID;
};

export const isPemohon = (role: string | null): boolean => {
  return role === ROLES.PEMOHON;
};

export const isAdminRole = (role: string | null): boolean => {
  const adminRoles: AdminRole[] = [ROLES.ADMIN, ROLES.PPID, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID];
  return adminRoles.includes(role as AdminRole);
};

export const canAccessMenu = (role: string | null, menuRoles: string[]): boolean => {
  return role ? menuRoles.includes(role) : false;
};

export const getRoleDisplayName = (role: string | null): string => {
  switch (role) {
    case "ADMIN":
    case "Admin":
      return "Administrator";
    case "PPID":
      return "PPID";
    case "PPID_UTAMA":
      return "PPID Utama";
    case "PPID_PELAKSANA":
      return "PPID Pelaksana";
    case "ATASAN_PPID":
      return "Atasan PPID";
    case "PEMOHON":
    case "Pemohon":
      return "Pemohon";
    default:
      return "Unknown";
  }
};
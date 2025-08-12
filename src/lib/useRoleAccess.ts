"use client";

import { useAuth } from "@/context/AuthContext";
import { canAccessMenu, isAdminRole, isPemohon } from "./roleUtils";

export const useRoleAccess = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  const hasAccess = (requiredRoles: string[]): boolean => {
    return canAccessMenu(userRole, requiredRoles);
  };

  const isAdmin = (): boolean => {
    return isAdminRole(userRole);
  };

  const isPemohonUser = (): boolean => {
    return isPemohon(userRole);
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdminRole(userRole);
  };

  const canAccessPemohonPanel = (): boolean => {
    return isPemohon(userRole);
  };

  return {
    userRole,
    hasAccess,
    isAdmin,
    isPemohonUser,
    canAccessAdminPanel,
    canAccessPemohonPanel
  };
};
"use client";

import { ReactNode } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import AccessDenied from "@/components/ui/AccessDenied";

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

const RoleGuard = ({ 
  children, 
  requiredRoles, 
  fallback = null,
  showAccessDenied = true 
}: RoleGuardProps) => {
  const { userRole, hasAccess } = useRoleAccess();

  if (!hasAccess(requiredRoles)) {
    if (showAccessDenied) {
      return <AccessDenied userRole={userRole} requiredRoles={requiredRoles} />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
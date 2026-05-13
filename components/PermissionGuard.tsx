// components/PermissionGuard.tsx
"use client";
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ roles, children, fallback }: PermissionGuardProps) {
  const { isLoading, isAdmin, isTeacher, isParent, user } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole = () => {
    if (roles.includes('admin') && isAdmin) return true;
    if (roles.includes('enseignant') && isTeacher) return true;
    if (roles.includes('parent') && isParent) return true;
    return false;
  };

  if (!hasRequiredRole()) {
    return fallback || (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Accès non autorisé</h2>
        <p className="text-slate-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
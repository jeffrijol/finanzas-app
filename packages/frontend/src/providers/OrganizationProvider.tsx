import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationWithRole } from '../types/organization';
import { useAuth } from './AuthProvider';
import { apiClient } from '../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building2 } from 'lucide-react';

interface OrganizationContextType {
  organizations: OrganizationWithRole[];
  currentOrg: OrganizationWithRole | null;
  setCurrentOrg: (org: OrganizationWithRole) => void;
  userRole: 'admin' | 'viewer' | null;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentOrg, setCurrentOrgState] = useState<OrganizationWithRole | null>(null);

  // Fetch user's organizations
  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['user-organizations', user?.id],
    queryFn: () => apiClient.getUserOrganizations(),
    enabled: !!user,
  });

  const setCurrentOrg = (org: OrganizationWithRole) => {
    setCurrentOrgState(org);
    localStorage.setItem('currentOrganizationId', org.id);
    // Disparar evento para sincronizar otras pestañas/ventanas
    window.dispatchEvent(new Event('storage'));
  };

  // Auto-select first org or from localStorage
  useEffect(() => {
    if (organizations?.length && !currentOrg) {
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const orgToSet = organizations.find((o: OrganizationWithRole) => o.id === savedOrgId) || organizations[0];
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setCurrentOrg(orgToSet), 0);
    }
  }, [organizations, currentOrg]);

  // Escuchar cambios de organización desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentOrganizationId' && e.newValue) {
        const newOrg = organizations?.find((o: OrganizationWithRole) => o.id === e.newValue);
        if (newOrg && newOrg.id !== currentOrg?.id) {
          setCurrentOrgState(newOrg);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [organizations, currentOrg]);



  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-96 border-red-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error al cargar organizaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No pudimos cargar tus organizaciones. Por favor intenta nuevamente.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // EMPTY STATE
  if (!isLoading && organizations?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Sin organizaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No perteneces a ninguna organización. Contacta a un administrador para obtener acceso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OrganizationContext.Provider
      value={{
        organizations: organizations || [],
        currentOrg,
        setCurrentOrg,
        userRole: currentOrg?.role?.id || null,
        isLoading
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

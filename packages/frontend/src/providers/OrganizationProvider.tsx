import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationWithRole } from '../types/organization';
import { useAuth } from './AuthProvider';
import { apiClient } from '../lib/api-client';

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
  const { data: organizations, isLoading } = useQuery({
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

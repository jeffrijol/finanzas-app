import { useState } from 'react';
import { useOrganization } from '@/providers/OrganizationProvider';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, Check, ChevronDown } from 'lucide-react';
import type { OrganizationWithRole } from '@/types/organization';
import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const { organizations, currentOrg, setCurrentOrg, isLoading } = useOrganization();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleOrgChange = async (org: OrganizationWithRole) => {
    if (org.id === currentOrg?.id) return;
    
    setIsSwitching(true);
    
    try {
      // Cambiar organización
      setCurrentOrg(org);
      
      // Invalidar todas las queries relevantes en paralelo
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['items'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading || organizations.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
        <Building2 className="h-4 w-4 text-slate-400 animate-pulse" />
        <span className="text-sm text-slate-500">Cargando...</span>
      </div>
    );
  }

  // Si solo hay una organización, mostrar sin dropdown
  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
        <Building2 className="h-4 w-4 text-emerald-600" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">
            {currentOrg?.name}
          </div>
          <div className="text-xs text-slate-500 capitalize">
            {currentOrg?.role.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between gap-2 h-auto py-2 px-3 border-slate-200 hover:bg-slate-50",
            isSwitching && "opacity-50 cursor-wait"
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 className="h-4 w-4 text-slate-600 shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium text-slate-900 truncate w-full">
                {currentOrg?.name || 'Seleccionar organización'}
              </span>
              {currentOrg && (
                <span className="text-xs text-slate-500 capitalize">
                  {currentOrg.role.name}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-slate-500">
          Cambiar organización
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => {
          const isSelected = org.id === currentOrg?.id;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleOrgChange(org)}
              disabled={isSwitching || isSelected}
              className={cn(
                "cursor-pointer",
                isSelected && "bg-emerald-50"
              )}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className={cn(
                    "font-medium truncate",
                    isSelected ? "text-emerald-900" : "text-slate-900"
                  )}>
                    {org.name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {org.role.name}
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useOrganization } from '@/providers/OrganizationProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function DashboardSkeleton() {
  const { isLoading: isOrgLoading } = useOrganization();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className={isOrgLoading ? "h-8 w-48" : "h-8 w-64"} />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Org Loading Indicator */}
      {isOrgLoading && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <p className="text-sm text-emerald-900 font-medium">
                Cargando información de la organización...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Table Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    </div>
  );
}

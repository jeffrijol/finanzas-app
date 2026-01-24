import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Activity, LogIn, Heart } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  const { data: stats, error, isLoading } = useQuery({
    queryKey: ['security-stats'],
    queryFn: () => apiClient.getSecurityStats(),
    retry: 1,
  });

  // If access is denied (403), show error message
  if (error && (error as any).response?.status === 403) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              Solo administradores pueden acceder a esta página.
              Si crees que esto es un error, contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">
            Métricas básicas de seguridad y uso del sistema
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as any).message || 'No se pudieron cargar las estadísticas'}
            </AlertDescription>
          </Alert>
        ) : stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                title="Total Usuarios"
                value={stats.totalUsers}
                icon={<Users className="h-4 w-4" />}
                description="Usuarios registrados en el sistema"
              />
              <StatCard
                title="Sesiones Activas Hoy"
                value={stats.activeSessionsToday}
                icon={<Activity className="h-4 w-4" />}
                description="Usuarios con sesión activa hoy"
              />
              <StatCard
                title="Logins (24h)"
                value={stats.last24hLogins}
                icon={<LogIn className="h-4 w-4" />}
                description="Inicios de sesión en las últimas 24 horas"
              />
              <StatCard
                title="Estado del Sistema"
                value={stats.systemHealth === 'ok' ? 1 : 0}
                icon={<Heart className="h-4 w-4" />}
                description={stats.systemHealth === 'ok' ? 'Sistema operativo' : 'Revisar sistema'}
              />
            </div>

            <Alert>
              <AlertTitle>Nota de MVP</AlertTitle>
              <AlertDescription>
                Los valores de sesiones y logins son placeholders. En la versión de producción,
                estas métricas se obtendrán directamente de los logs de Supabase Auth usando el MCP.
                <br />
                <strong>Para próxima versión:</strong> Analytics avanzados, gráficos de tendencias, 
                exportación a CSV, y alertas automáticas.
              </AlertDescription>
            </Alert>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

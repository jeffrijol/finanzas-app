import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, PieChart, Wallet, Settings, FileSpreadsheet, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const menuItems = [
    { icon: UploadCloud, label: 'Cargar Datos', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileSpreadsheet, label: 'Excels', path: '/excels' },
    { icon: Wallet, label: 'Mantenimiento', path: '/mantenimiento' },
    { icon: PieChart, label: 'Reportes', path: '/reportes' },
];

export function Sidebar() {
    const location = useLocation();
    const { signOut } = useAuth();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: "Error",
                description: "No se pudo cerrar la sesión.",
                variant: "destructive",
            });
        }
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <span className="font-semibold text-lg text-slate-900 tracking-tight">FinanzasApp</span>
                </div>

                {/* Organization Switcher */}
                <div className="mb-6">
                    <OrganizationSwitcher />
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border-l-2",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-900 border-emerald-500 shadow-sm"
                                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-slate-400")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-50 space-y-2">
                <button className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors w-full p-2 rounded-md hover:bg-slate-50">
                    <Settings className="w-5 h-5" />
                    Configuración
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button 
                            className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-red-600 transition-colors w-full p-2 rounded-md hover:bg-red-50"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro que quieres salir de la aplicación?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                                Cerrar Sesión
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </aside>
    );
}

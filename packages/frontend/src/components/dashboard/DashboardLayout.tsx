import { ReactNode } from 'react';
import { TrendingUp, FileText, Settings } from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <button className="w-10 h-10 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="w-10 h-10 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="pl-16">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
                    <div className="px-8 py-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                            Transaction Manager
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gestiona y organiza tus transacciones financieras
                        </p>
                    </div>
                </header>

                {/* Content */}
                <main className="px-8 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

import { Sidebar } from '@/components/layout/Sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

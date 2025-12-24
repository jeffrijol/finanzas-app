import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ItemsList } from '@/components/items/ItemsList';
import { CategoriesList } from '@/components/items/CategoriesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MaintenancePage() {
    const [activeTab, setActiveTab] = useState('items');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">Mantenimiento</h1>
                    <p className="text-slate-500">Configura tus Items activos y Categorías de transacción.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="items">Items Activos</TabsTrigger>
                        <TabsTrigger value="categories">Categorías</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="items" className="space-y-4 animate-in fade-in-50 duration-300">
                            <ItemsList />
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-4 animate-in fade-in-50 duration-300">
                            <CategoriesList />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

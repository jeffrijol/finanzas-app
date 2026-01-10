import { DashboardLevel } from '@/hooks/useDashboardContext';
import { Item, ItemType } from '@/types';
import { GeneralDashboard } from './views/GeneralDashboard';
import { TypeDashboard } from './views/TypeDashboard';
import { ItemDashboard } from './views/ItemDashboard';
import { CategoryDashboard } from './views/CategoryDashboard';

/*
// Placeholder for now, to be implemented
const PlaceholderView = ({ title }: { title: string }) => (
    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
        <h3 className="text-lg font-medium text-slate-600">{title}</h3>
        <p className="text-slate-400">Vista en construcción...</p>
    </div>
);
*/

interface DashboardChartsRendererProps {
    context: {
        level: DashboardLevel;
        title: string;
        description: string;
        filters: any;
    };
    isGeneratingPdf: boolean;
    items: Item[];
    itemTypes: ItemType[];
}

export function DashboardChartsRenderer({ context, isGeneratingPdf, items, itemTypes }: DashboardChartsRendererProps) {
    // Determine which view to render based on context.level
    switch (context.level) {
        case 'general':
        case 'year':
            // Reuse General View logic for now
            return <GeneralDashboard context={context} isGeneratingPdf={isGeneratingPdf} itemTypes={itemTypes} />;

        case 'type':
            return <TypeDashboard context={context} isGeneratingPdf={isGeneratingPdf} />;

        case 'item':
            return <ItemDashboard context={context} isGeneratingPdf={isGeneratingPdf} />;

        case 'category':
            return <CategoryDashboard context={context} isGeneratingPdf={isGeneratingPdf} />;

        case 'quarter':
            return <GeneralDashboard context={context} isGeneratingPdf={isGeneratingPdf} itemTypes={itemTypes} />;

        default:
            return <GeneralDashboard context={context} isGeneratingPdf={isGeneratingPdf} itemTypes={itemTypes} />;
    }
}

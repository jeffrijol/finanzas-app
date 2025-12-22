import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePeriodStore } from '@/stores/period-store';

export function PeriodSelector() {
    const { year, quarter, setYear, setQuarter } = usePeriodStore();
    const currentYear = new Date().getFullYear();

    // Generar últimos 5 años
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trimestre
                </label>
                <Select
                    value={quarter.toString()}
                    onValueChange={(value: string) => {
                        setQuarter(value === 'all' ? 'all' : (parseInt(value) as 1 | 2 | 3 | 4));
                    }}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo el año</SelectItem>
                        <SelectItem value="1">Trimestre 1 (Ene-Mar)</SelectItem>
                        <SelectItem value="2">Trimestre 2 (Abr-Jun)</SelectItem>
                        <SelectItem value="3">Trimestre 3 (Jul-Sep)</SelectItem>
                        <SelectItem value="4">Trimestre 4 (Oct-Dic)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                </label>
                <Select value={year.toString()} onValueChange={(value: string) => setYear(parseInt(value))}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

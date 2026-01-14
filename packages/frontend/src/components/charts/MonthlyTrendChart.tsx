import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface MonthlyTrendData {
    month: number;
    ingresos: number;
    gastos: number;
}

interface MonthlyTrendChartProps {
    data: MonthlyTrendData[];
    title: string;
    year: number;
}

const chartConfig = {
    ingresos: {
        label: "Ingresos",
        color: "hsl(var(--primary-green))",
    },
    gastos: {
        label: "Gastos",
        color: "hsl(var(--destructive))",
    },
} satisfies ChartConfig;

const MONTH_NAMES = [
    'Ener', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function MonthlyTrendChart({ data, title, year }: MonthlyTrendChartProps) {
    const chartData = React.useMemo(() => {
        return data.map(d => ({
            month: MONTH_NAMES[d.month - 1] || d.month,
            ingresos: d.ingresos,
            gastos: d.gastos,
        }));
    }, [data]);

    return (
        <Card className="shadow-sm border-slate-200" id="dashboard-chart-annual">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
                    <CardDescription>Evolución mensual durante {year}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-ingresos)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-ingresos)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillGastos" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-gastos)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-gastos)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `€${value / 1000}k`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value))}
                                />
                            }
                        />
                        <Area
                            dataKey="ingresos"
                            type="monotone"
                            fill="url(#fillIngresos)"
                            stroke="var(--color-ingresos)"
                            strokeWidth={2}
                            stackId="1" // Stacking might be cleaner for total volume, but user might want comparison. "Net" is separate. 
                        // If I stack, I can't compare G vs I easily.
                        // But usually I > G. 
                        // Let's avoid stackId for pure comparison.
                        />
                        <Area
                            dataKey="gastos"
                            type="monotone"
                            fill="url(#fillGastos)"
                            stroke="var(--color-gastos)"
                            strokeWidth={2}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface CategoryStats {
    categoria: string;
    ingresos: number;
    gastos: number;
}

interface CategoryPieChartProps {
    data: CategoryStats[];
    type: 'ingresos' | 'gastos';
    title?: string;
    disableAnimation?: boolean;
}

const HEX_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
];

export function CategoryPieChart({ data, type, title: titleProp, disableAnimation = false }: CategoryPieChartProps) {
    // Preparar datos
    const chartData = React.useMemo(() => {
        const raw = data
            .map(d => ({
                category: d.categoria,
                value: type === 'ingresos' ? d.ingresos : d.gastos,
            }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);

        // Agrupar si hay demasiados
        let finalData = raw;
        if (raw.length > 6) {
            const top = raw.slice(0, 5);
            const others = raw.slice(5).reduce((sum, item) => sum + item.value, 0);
            finalData = [
                ...top,
                { category: 'Otros', value: others }
            ];
        }

        return finalData.map((item, index) => ({
            ...item,
            fill: HEX_COLORS[index % HEX_COLORS.length]
        }));
    }, [data, type]);

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            value: { label: "Monto" },
        };
        chartData.forEach((item) => {
            config[item.category] = {
                label: item.category,
                color: item.fill,
            };
        });
        return config;
    }, [chartData]);

    const totalAmount = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [chartData]);

    const title = titleProp || (type === 'ingresos' ? 'Ingresos por Categoría' : 'Distribución de Gastos');
    const description = type === 'ingresos' ? 'Fuentes principales' : 'Desglose por categoría';

    if (chartData.length === 0) return null;

    return (
        <Card className="flex flex-col shadow-sm border-slate-200" id={`pie-chart-${type}`}>
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[350px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value))} />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="category"
                            innerRadius={70}
                            outerRadius={110}
                            strokeWidth={3}
                            isAnimationActive={!disableAnimation}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {new Intl.NumberFormat('es-ES', {
                                                        style: 'decimal',
                                                        maximumFractionDigits: 0,
                                                        notation: "compact"
                                                    }).format(totalAmount)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    Total EUR
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="category" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

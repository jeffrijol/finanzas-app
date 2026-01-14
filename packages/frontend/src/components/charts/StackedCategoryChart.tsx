
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface StackedCategoryChartProps {
    data: any[];
    keys: string[];
    title: string;
    description?: string;
}

const MONTH_NAMES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Color palette for dynamic categories
const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function StackedCategoryChart({ data, keys, title, description }: StackedCategoryChartProps) {

    // Generate config dynamically based on keys
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            others: { label: "Otros", color: "hsl(var(--muted-foreground))" }
        };

        keys.forEach((key, index) => {
            if (key !== 'Otros') {
                config[key] = {
                    label: key,
                    color: COLORS[index % COLORS.length]
                };
            }
        });
        return config;
    }, [keys]);

    const formattedData = React.useMemo(() => {
        return data.map(d => ({
            ...d,
            monthStr: MONTH_NAMES[d.month - 1]
        }));
    }, [data]);

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                    <BarChart data={formattedData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="monthStr"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {keys.map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={key === 'Otros' ? "hsl(var(--muted-foreground))" : (chartConfig[key]?.color || "#ccc")}
                                radius={[0, 0, 0, 0]} // Square corners for stack
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

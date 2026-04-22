import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, BarChart, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

// ─── PALETAS ────────────────────────────────────────────────────────────────
const INCOME_COLOR = '#10b981';  // emerald-500
const EXPENSE_COLOR = '#f43f5e'; // rose-500
const BALANCE_COLOR = '#3b82f6'; // blue-500
const PALETTE = ['#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0);
const pct = (a: number, b: number) => b === 0 ? '0%' : `${((a / b) * 100).toFixed(1)}%`;

// ─── SUBCOMPONENTES ────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm print:shadow-none flex flex-col gap-1">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-8 rounded-full bg-slate-900 print:bg-slate-700" />
      <h2 className="text-2xl font-black tracking-tight text-slate-900">{children}</h2>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border-l-4 border-slate-300 rounded-r-xl p-5 text-slate-600 text-sm leading-relaxed italic print:bg-white print:border-slate-400">
      {children}
    </div>
  );
}

// ─── GRÁFICO MENSUAL COMPUESTO ────────────────────────────────────────────
function MonthlyComposedChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="shortMonth" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tickFormatter={fmtK} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip
          formatter={(val: number, name: string) => [fmt(val), name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : 'Balance']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
        <Bar dataKey="ingresos" name="Ingresos" fill={INCOME_COLOR} radius={[3, 3, 0, 0]} opacity={0.85} />
        <Bar dataKey="gastos" name="Gastos" fill={EXPENSE_COLOR} radius={[3, 3, 0, 0]} opacity={0.85} />
        <Line dataKey="balance" name="Balance" type="monotone" stroke={BALANCE_COLOR} strokeWidth={2.5} dot={{ r: 3, fill: BALANCE_COLOR }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── GRÁFICO HORIZONTAL DE CATEGORÍAS ─────────────────────────────────────
function HorizontalCategoryChart({ data, color }: { data: { name: string; amount: number }[]; color: string }) {
  if (!data.length) return <p className="text-xs text-slate-400 italic">Sin datos disponibles</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" tickFormatter={fmtK} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis dataKey="name" type="category" width={130} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip
          formatter={(val: number) => [fmt(val), 'Importe']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
        />
        <Bar dataKey="amount" name="Importe" fill={color} radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: number) => fmt(v), fontSize: 10, fill: '#64748b' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── MINI PieChart de Balance ─────────────────────────────────────────────
function BalancePie({ income, expense }: { income: number; expense: number }) {
  const pieData = [
    { name: 'Ingresos', value: income },
    { name: 'Gastos', value: expense }
  ];
  return (
    <PieChart width={180} height={180}>
      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
        <Cell fill={INCOME_COLOR} />
        <Cell fill={EXPENSE_COLOR} />
      </Pie>
      <Tooltip formatter={(val: number) => fmt(val)} />
    </PieChart>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
export default function Avance2025Report() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/dev/avance2025')
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4 bg-slate-50">
      <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Cargando datos del reporte…</p>
    </div>
  );

  if (!data) return <div className="p-8 text-rose-600 font-bold">Error cargando datos. ¿Está el backend corriendo?</div>;

  const { global: g, monthlyGlobal, itemTypeAnalysis } = data;
  const marginRate = g.totalIncome > 0 ? ((g.netCapital / g.totalIncome) * 100).toFixed(1) : '0';
  const bestMonth = [...monthlyGlobal].sort((a, b) => b.balance - a.balance)[0];
  const worstMonth = [...monthlyGlobal].sort((a, b) => a.balance - b.balance)[0];

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white font-sans print:p-0">

      {/* ── Botón flotante PDF ── */}
      <div className="fixed bottom-8 right-8 print:hidden z-50">
        <Button size="lg" className="shadow-2xl bg-slate-900 hover:bg-slate-700 text-white rounded-full px-8 gap-2" onClick={() => window.print()}>
          <Printer className="h-5 w-5" />
          Generar PDF
        </Button>
      </div>

      <div className="max-w-[900px] mx-auto print:max-w-none print:w-full bg-white print:shadow-none shadow-xl">

        {/* ══════════════════════════════════════════
         *  PORTADA
         * ══════════════════════════════════════════ */}
        <header className="relative overflow-hidden bg-slate-900 text-white px-12 py-16 print:py-12">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 text-slate-400 text-sm font-mono uppercase tracking-widest">
              <BarChart2 className="h-4 w-4" />
              Informe financiero interno · Confidencial
            </div>
            <h1 className="text-6xl font-black leading-none mb-4 print:text-5xl">Reporte<br />Ejecutivo Anual</h1>
            <h2 className="text-3xl text-emerald-400 font-bold mb-10">Organización Avance · 2025</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Ingresos', value: fmt(g.totalIncome), icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Gastos', value: fmt(g.totalExpense), icon: TrendingDown, color: 'text-rose-400' },
                { label: 'Transacciones', value: g.transactionCount.toString(), icon: Activity, color: 'text-blue-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="border border-slate-700 rounded-xl p-4 bg-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
                    <Icon className="h-3 w-3" /> {label}
                  </div>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════
         *  RESUMEN EJECUTIVO GLOBAL
         * ══════════════════════════════════════════ */}
        <section className="px-12 py-10 border-b border-slate-100 print:break-after-page">
          <SectionTitle>Resumen Ejecutivo Global</SectionTitle>

          <Prose>
            Durante el ejercicio 2025, la organización <strong>Avance</strong> registró un total de <strong>{g.transactionCount} transacciones</strong>,
            de las cuales <strong>{g.assignedCount}</strong> ({pct(g.assignedCount, g.transactionCount)}) han sido asignadas a un activo específico.
            Los <strong>ingresos totales</strong> alcanzaron <strong>{fmt(g.totalIncome)}</strong>, mientras que los
            <strong> gastos totales</strong> ascendieron a <strong>{fmt(g.totalExpense)}</strong>, resultando en un
            <strong> capital neto de {fmt(g.netCapital)}</strong> y un margen sobre ingresos del <strong>{marginRate}%</strong>.{' '}
            El mejor mes en términos de balance neto fue <strong>{bestMonth.month}</strong> ({fmt(bestMonth.balance)}), mientras que{' '}
            {worstMonth.balance < 0
              ? `el mes de mayor gasto fue ${worstMonth.month} (${fmt(worstMonth.balance)}).`
              : `el mes con menor balance positivo fue ${worstMonth.month} (${fmt(worstMonth.balance)}).`}
          </Prose>

          <div className="mt-8 grid grid-cols-4 gap-4">
            <MetricCard label="Ingresos Totales" value={fmt(g.totalIncome)} color="text-emerald-600" sub="Flujo positivo 2025" />
            <MetricCard label="Gastos Totales" value={fmt(g.totalExpense)} color="text-rose-600" sub="Flujo negativo 2025" />
            <MetricCard label="Capital Neto" value={fmt(g.netCapital)} color={g.netCapital >= 0 ? 'text-blue-700' : 'text-rose-700'} sub={`Margen: ${marginRate}%`} />
            <MetricCard label="Transacciones" value={g.transactionCount.toString()} color="text-slate-800" sub={`${g.assignedCount} asignadas`} />
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Evolución Mensual: Ingresos, Gastos y Balance Neto</h3>
            <MonthlyComposedChart data={monthlyGlobal} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
         *  ANÁLISIS POR TIPO DE ACTIVO
         * ══════════════════════════════════════════ */}
        {Object.entries(itemTypeAnalysis).map(([typeName, typeData]: [string, any], typeIdx) => {
          const itemsArr = Object.entries(typeData.items) as [string, any][];
          const typeMargin = typeData.totalIncome > 0
            ? ((typeData.totalIncome - typeData.totalExpense) / typeData.totalIncome * 100).toFixed(1)
            : '0';

          return (
            <section key={typeName} className="px-12 py-10 border-b border-slate-100 print:break-before-page">
              {/* Type Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Tipología de Activo</div>
                  <SectionTitle>{typeName}</SectionTitle>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Balance del grupo</div>
                  <div className={`text-2xl font-black ${typeData.totalIncome - typeData.totalExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmt(typeData.totalIncome - typeData.totalExpense)}
                  </div>
                </div>
              </div>

              {/* Prose */}
              <Prose>
                El grupo <strong>{typeName}</strong> concentró <strong>{typeData.txCount} operaciones</strong> durante 2025,
                generando <strong>{fmt(typeData.totalIncome)}</strong> en ingresos y
                <strong> {fmt(typeData.totalExpense)}</strong> en gastos, con un margen operativo neto del <strong>{typeMargin}%</strong>.{' '}
                {typeData.topIncomeCategories[0]
                  ? <>La categoría con mayor aportación de ingresos fue <strong>{typeData.topIncomeCategories[0].name}</strong> ({fmt(typeData.topIncomeCategories[0].amount)}).</>
                  : 'Sin ingresos categorizados registrados.'}
                {' '}
                {typeData.topExpenseCategories[0]
                  ? <>El principal foco de gasto fue <strong>{typeData.topExpenseCategories[0].name}</strong> ({fmt(typeData.topExpenseCategories[0].amount)}).</>
                  : ''}
              </Prose>

              {/* Top Categorías */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Top 5 Categorías — Ingresos</h4>
                  <HorizontalCategoryChart data={typeData.topIncomeCategories} color={INCOME_COLOR} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3">Top 5 Categorías — Gastos</h4>
                  <HorizontalCategoryChart data={typeData.topExpenseCategories} color={EXPENSE_COLOR} />
                </div>
              </div>

              {/* Items individuales */}
              {itemsArr.map(([itemName, metrics], itemIdx) => {
                const balance = metrics.ingresos - metrics.gastos;
                return (
                  <div key={itemName} className="mt-10 bg-slate-50 print:bg-white rounded-2xl p-6 border border-slate-200 print:border-slate-300 print:break-inside-avoid">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-slate-800">{itemName}</h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-emerald-600 font-semibold">{fmt(metrics.ingresos)} ingresos</span>
                        <span className="text-rose-600 font-semibold">{fmt(metrics.gastos)} gastos</span>
                        <span className={`font-black ${balance >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>{fmt(balance)} neto</span>
                      </div>
                    </div>

                    {/* Mini prosa */}
                    <p className="text-xs text-slate-500 italic mb-4">
                      Este activo registró <strong>{metrics.txCount} transacciones</strong>.
                      {balance >= 0
                        ? ` El resultado ha sido positivo, con un excedente de ${fmt(balance)}.`
                        : ` El activo presentó un déficit de ${fmt(Math.abs(balance))}.`}
                    </p>

                    {/* Gráfico mensual del item */}
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Evolución Mensual</h5>
                    <div className="h-[180px]">
                      <MonthlyComposedChart data={metrics.mensual.map((m: any) => ({ ...m, shortMonth: m.month.slice(0, 3) }))} />
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        {/* ── Footer ── */}
        <footer className="px-12 py-8 text-center text-xs text-slate-400 border-t print:break-inside-avoid">
          <p>Reporte generado automáticamente por <strong>Finanzas App</strong> el {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          <p className="mt-1">Información confidencial · Solo para uso interno.</p>
        </footer>

      </div>
    </div>
  );
}

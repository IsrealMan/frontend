import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';

// ── Tabs ─────────────────────────────────────────────────────
const TABS = [
  { id: 'production', label: 'Production', icon: BarChart2 },
  { id: 'yield',      label: 'Yield',      icon: Activity  },
];

// ── Custom tooltip ────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
      <div className="text-gray-400 mb-0.5">{label}</div>
      <div className="font-semibold">{payload[0].value} {unit}</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-3 h-3 rounded-full bg-gray-200" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>
      <div className="h-10 w-32 bg-gray-100 rounded mb-1" />
      <div className="h-3 w-20 bg-gray-100 rounded mb-6" />
      <div className="h-48 bg-gray-50 rounded-xl" />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ title, current, unit, percentChange, trend, dotColor, chartType }) {
  const isUp  = percentChange >= 0;
  const arrow = isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />;

  // For downtime, up = bad (orange); for rate, up = good (green)
  const changeColor = chartType === 'bar'
    ? (isUp ? 'text-amber-500' : 'text-emerald-600')  // downtime
    : (isUp ? 'text-emerald-600' : 'text-red-500');    // rate

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className={`w-3 h-3 rounded-full ${dotColor} shrink-0`} />
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold text-gray-900 tabular-nums">{current}</span>
        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </div>

      {/* % change */}
      <div className={`flex items-center gap-1 text-sm font-semibold mb-6 ${changeColor}`}>
        {arrow}
        <span>{Math.abs(percentChange)}%</span>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={22}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={32}
              />
              <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {trend.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === trend.length - 1 ? '#f59e0b' : '#fcd34d'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={32}
              />
              <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Yield placeholder ─────────────────────────────────────────
function YieldContent() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Activity size={40} className="text-gray-200 mb-4" />
      <p className="text-gray-400 text-sm font-medium">Yield analytics coming soon</p>
      <p className="text-gray-300 text-xs mt-1">This tab will show first-pass yield, scrap rate and OEE.</p>
    </div>
  );
}

// ── Production content ────────────────────────────────────────
function ProductionContent() {
  const { data: raw, loading, error } = useApi('/api/production-metrics?range=7');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (raw) setMetrics(raw);
  }, [raw]);

  // WebSocket live merge
  const handleWs = useCallback((msg) => {
    if (msg.type !== 'production-metrics') return;
    setMetrics(prev => prev ? { ...prev, ...msg.data } : msg.data);
  }, []);
  useWebSocket(handleWs);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
        Failed to load production metrics.
      </div>
    );
  }

  return (
    <>
      <h3 className="text-base font-semibold text-gray-800 mb-5">Production Line Parameters</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading || !metrics ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title="Downtime"
              current={metrics.downtime.current}
              unit={metrics.downtime.unit}
              percentChange={metrics.downtime.percentChange}
              trend={metrics.downtime.trend}
              dotColor="bg-amber-400"
              chartType="bar"
            />
            <KpiCard
              title="Production Rate"
              current={metrics.productionRate.current}
              unit={metrics.productionRate.unit}
              percentChange={metrics.productionRate.percentChange}
              trend={metrics.productionRate.trend}
              dotColor="bg-emerald-500"
              chartType="line"
            />
          </>
        )}
      </div>

      {/* Live indicator */}
      {!loading && (
        <div className="flex items-center gap-1.5 mt-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-gray-400">Live updates active</span>
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────
function ProductionMetrics() {
  const [activeTab, setActiveTab] = useState('production');

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Production Metrics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Weekly KPIs across all production lines</p>
      </div>

      {/* Tab toggle — matches screenshot style */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'production' && <ProductionContent />}
      {activeTab === 'yield'      && <YieldContent />}
    </div>
  );
}

export default ProductionMetrics;

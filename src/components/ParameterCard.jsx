import { Maximize2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip, Area, AreaChart,
} from 'recharts';

const STATUS = {
  normal:   { dot: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'In Control' },
  warning:  { dot: 'bg-amber-400',   ring: 'ring-amber-100',   label: 'Warning'    },
  critical: { dot: 'bg-red-500',     ring: 'ring-red-100',     label: 'Critical'   },
};

const CHANGE_COLOR = {
  normal:   { up: 'text-emerald-600', down: 'text-blue-500'  },
  warning:  { up: 'text-amber-600',   down: 'text-amber-600' },
  critical: { up: 'text-red-500',     down: 'text-red-500'   },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
      <div className="text-gray-400 mb-0.5">{label}</div>
      <div className="font-semibold">{payload[0].value}</div>
    </div>
  );
}

function ParameterCard({ title, value, unit, change, changeType, data, upperLimit, lowerLimit, status = 'normal', onExpand }) {
  const s          = STATUS[status] ?? STATUS.normal;
  const isUp       = changeType === 'up';
  const changeColor = (CHANGE_COLOR[status] ?? CHANGE_COLOR.normal)[isUp ? 'up' : 'down'];
  const absChange   = Math.abs(parseFloat(change) || 0);

  // Format trend data for recharts
  const chartData = (data || []).map((d) => ({
    time:  d.time  ?? new Date(d.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    value: d.value,
  }));

  const yMin = lowerLimit != null ? lowerLimit - 5 : 'auto';
  const yMax = upperLimit != null ? upperLimit + 5 : 'auto';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className={`relative flex h-2.5 w-2.5`}>
            {status !== 'normal' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-50`} />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`} />
          </span>
          <span className="text-gray-800 font-semibold text-sm">{title}</span>
        </div>
        <button
          onClick={onExpand}
          className="text-gray-300 hover:text-gray-500 transition-colors p-1 hover:bg-gray-50 rounded-lg"
          aria-label="Expand"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-4xl font-bold text-gray-900 tabular-nums">{value}</span>
        <span className="text-gray-400 text-sm font-medium">{unit}</span>
        <div className={`flex items-center gap-0.5 ml-2 text-sm font-semibold ${changeColor}`}>
          {isUp
            ? <TrendingUp size={14} />
            : <TrendingDown size={14} />
          }
          {absChange}%
        </div>
      </div>

      {/* Chart */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
            {upperLimit != null && (
              <ReferenceLine
                y={upperLimit}
                stroke="#ef4444"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: 'USL', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }}
              />
            )}
            {lowerLimit != null && (
              <ReferenceLine
                y={lowerLimit}
                stroke="#9ca3af"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: 'LSL', position: 'insideBottomRight', fontSize: 9, fill: '#9ca3af' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill={`url(#grad-${title})`}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer limits */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 font-medium">
        <span>LSL <span className="text-gray-600">{lowerLimit ?? '—'}</span></span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          status === 'critical' ? 'bg-red-50 text-red-600' :
          status === 'warning'  ? 'bg-amber-50 text-amber-600' :
                                  'bg-emerald-50 text-emerald-600'
        }`}>{s.label}</span>
        <span>USL <span className="text-gray-600">{upperLimit ?? '—'}</span></span>
      </div>
    </div>
  );
}

export default ParameterCard;

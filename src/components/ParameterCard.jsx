import { Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';

function ParameterCard({ title, value, unit, change, changeType, data, upperLimit, lowerLimit, status = 'normal' }) {
  const isPositive = changeType === 'up';
  const statusColor = status === 'warning' ? 'bg-red-500' : 'bg-gray-300';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
          <span className="text-gray-700 font-medium">{title}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-gray-800">{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
        <span className={`text-sm font-medium ml-2 ${isPositive ? 'text-red-500' : 'text-red-500'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </span>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="time"
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              domain={['dataMin - 10', 'dataMax + 10']}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <ReferenceLine
              y={upperLimit}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={lowerLimit}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ParameterCard;

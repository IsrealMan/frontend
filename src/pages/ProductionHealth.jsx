import { useState, useEffect, useCallback } from 'react';
import { Activity, MessageSquare, Lightbulb, RefreshCw } from 'lucide-react';
import ParameterCard from '../components/ParameterCard';
import AIRecommendationCard from '../components/AIRecommendationCard';
import RecommendationItem from '../components/RecommendationItem';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';

const TABS = [
  { id: 'machine-health',  label: 'Machine Health',  icon: Activity       },
  { id: 'recommendations', label: 'Recommendations', icon: MessageSquare  },
  { id: 'improvements',    label: 'Improvements',    icon: Lightbulb      },
];

const RANGE_OPTIONS = ['6h', '12h', '24h'];

const AI_RECOMMENDATIONS = [
  { id: 1, title: 'Critical Temperature Alert',   description: 'Machine A1 temperature has exceeded the safety threshold of 80°C', tags: ['Machine A1', 'Temperature'], recommendation: 'Reduce operational load and check cooling system immediately.', variant: 'critical' },
  { id: 2, title: 'Thickness Variation Detected', description: 'Product thickness is showing a downward trend below acceptable range.', tags: ['Thickness'], recommendation: 'Calibrate thickness control mechanism and inspect feed rollers.', variant: 'warning' },
  { id: 3, title: 'Predictive Maintenance Due',   description: 'Machine B3 is approaching its scheduled maintenance window based on operational hours.', tags: ['Machine B3'], recommendation: 'Schedule maintenance within the next 48 hours to avoid unplanned downtime.', variant: 'info' },
];

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
          <div className="h-3.5 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-3.5 w-3.5 bg-gray-100 rounded" />
      </div>
      <div className="h-10 w-28 bg-gray-100 rounded mb-4" />
      <div className="h-36 bg-gray-50 rounded-xl" />
      <div className="flex justify-between mt-3">
        <div className="h-3 w-14 bg-gray-100 rounded" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-3 w-14 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function MachineHealth({ range, onRangeChange }) {
  const { data: raw, loading, error } = useApi(`/api/machine-health?range=${range}`);
  const [params, setParams] = useState([]);

  // Populate from REST response
  useEffect(() => {
    if (raw) setParams(raw);
  }, [raw]);

  // Merge WebSocket push updates
  const handleWsMessage = useCallback((msg) => {
    if (msg.type !== 'machine-health') return;
    setParams(prev =>
      prev.map(p => p.id === msg.data.id ? { ...p, ...msg.data } : p)
    );
  }, []);

  useWebSocket(handleWsMessage);

  return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-800">Machine Health Parameters</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {RANGE_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                range === r ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl mb-4">
          Failed to load machine health data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : params.map(p => (
            <ParameterCard
              key={p.id}
              title={p.parameter}
              value={p.currentValue}
              unit={p.unit}
              change={Math.abs(p.percentChange)}
              changeType={p.percentChange >= 0 ? 'up' : 'down'}
              status={p.status}
              data={p.trend}
              upperLimit={p.usl}
              lowerLimit={p.lsl}
            />
          ))
        }
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mt-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-gray-400">Live updates active</span>
      </div>
    </div>
  );
}

function ProductionHealth() {
  const [activeTab, setActiveTab] = useState('machine-health');
  const [range, setRange]         = useState('6h');

  const { data: improvements, loading: impLoading } = useApi('/api/recommendations');

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Production Health</h2>
        <p className="text-sm text-gray-500 mt-0.5">Real-time monitoring across all production lines</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-xl p-1 inline-flex gap-0.5 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

      {/* ── Machine Health ── */}
      {activeTab === 'machine-health' && (
        <MachineHealth range={range} onRangeChange={setRange} />
      )}

      {/* ── Recommendations ── */}
      {activeTab === 'recommendations' && (
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">AI Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_RECOMMENDATIONS.map(rec => (
              <AIRecommendationCard
                key={rec.id}
                title={rec.title}
                description={rec.description}
                tags={rec.tags}
                recommendation={rec.recommendation}
                variant={rec.variant}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Improvements ── */}
      {activeTab === 'improvements' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-1">Improvement Recommendations</h3>
          <p className="text-sm text-gray-500 mb-5">
            Click each parameter to see specific action recommendations.
          </p>
          <div className="space-y-3">
            {impLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))
              : (improvements || []).map(rec => (
                  <RecommendationItem
                    key={rec.id}
                    title={rec.title}
                    impact={rec.impact}
                  />
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductionHealth;

import { useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';

function KPICard({ title, count, subtitle, parameters, variant = 'critical', onAnalysisClick, onRCClick }) {
  const isCritical = variant === 'critical';
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheckboxChange = (paramId) => {
    setCheckedItems(prev => ({
      ...prev,
      [paramId]: !prev[paramId]
    }));
  };

  const selectedParams = parameters?.filter(p => checkedItems[p.id]) || [];
  const hasSelection = selectedParams.length > 0;

  const handleAnalysisClick = () => {
    if (hasSelection && onAnalysisClick) {
      onAnalysisClick(selectedParams[0].name, variant);
    }
  };

  const handleRCClick = () => {
    if (hasSelection && onRCClick) {
      onRCClick(selectedParams[0].name, variant);
    }
  };

  return (
    <div
      className={`rounded-xl p-5 ${
        isCritical
          ? 'bg-gradient-to-br from-red-400 to-red-500'
          : 'bg-gradient-to-br from-gray-400 to-gray-500'
      }`}
    >
      {/* Header */}
      <h3 className="text-white/90 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-4xl font-bold mb-1">{count}</p>
      <p className="text-white/80 text-sm mb-4">{subtitle}</p>

      {/* Affected Parameters */}
      <div className="mb-4">
        <p className="text-white/90 text-xs font-medium mb-2">Affected parameters:</p>
        <div className="space-y-1.5">
          {parameters?.map((param) => (
            <label key={param.id} className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={checkedItems[param.id] || false}
                  onChange={() => handleCheckboxChange(param.id)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 border-white/60 bg-transparent peer-checked:bg-white peer-checked:border-white transition-all flex items-center justify-center">
                  {checkedItems[param.id] && (
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-white text-sm group-hover:text-white/90">{param.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          disabled={!hasSelection}
          onClick={handleAnalysisClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            hasSelection
              ? 'bg-white/90 text-gray-700 hover:bg-white cursor-pointer shadow-sm'
              : 'bg-white/20 text-white/60 cursor-not-allowed'
          }`}
        >
          <BarChart3 size={16} />
          Analysis
        </button>
        <button
          disabled={!hasSelection}
          onClick={handleRCClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            hasSelection
              ? 'bg-white/90 text-gray-700 hover:bg-white cursor-pointer shadow-sm'
              : 'bg-white/20 text-white/60 cursor-not-allowed'
          }`}
        >
          <Calendar size={16} />
          RC
        </button>
      </div>
    </div>
  );
}

export default KPICard;

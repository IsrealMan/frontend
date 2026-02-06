import { Lightbulb, ChevronRight } from 'lucide-react';

function RecommendationItem({ title, impact }) {
  const getImpactColor = (impact) => {
    if (impact.includes('High')) return 'text-red-600';
    if (impact.includes('Medium')) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">
          <Lightbulb size={20} />
        </div>
        <div>
          <h4 className="text-gray-800 font-medium text-sm">{title}</h4>
          <p className={`text-xs ${getImpactColor(impact)}`}>{impact}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
    </div>
  );
}

export default RecommendationItem;

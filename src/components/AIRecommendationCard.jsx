import { AlertTriangle, CheckCircle2 } from 'lucide-react';

function AIRecommendationCard({ title, description, tags, recommendation, variant = 'warning' }) {
  const variants = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: <AlertTriangle className="text-red-500" size={20} />,
      iconBg: 'bg-red-100'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      icon: <AlertTriangle className="text-yellow-600" size={20} />,
      iconBg: 'bg-yellow-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />,
      iconBg: 'bg-blue-100'
    }
  };

  const style = variants[variant] || variants.warning;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
          {style.icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-2">
        <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
        <span className="text-sm text-gray-700">{recommendation}</span>
      </div>
    </div>
  );
}

export default AIRecommendationCard;

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

const actionsData = {
  'Temperature Control Frequency': [
    {
      action: 'Increase Temperature Sensor Sampling Rate',
      description: 'Modify control system to increase sensor sampling frequency from current 1/min to 4/min.',
      benefit: '15% reduction in temperature fluctuations',
      timeframe: '1-2 days',
      difficulty: 'Low'
    },
    {
      action: 'Install Additional Temperature Sensors',
      description: 'Add 2 more temperature sensors at critical points in the process to improve monitoring coverage.',
      benefit: 'More accurate temperature profile across processing area',
      timeframe: '3-5 days',
      difficulty: 'Medium'
    }
  ],
  'Calibration Procedure': [
    {
      action: 'Implement Automated Calibration Checks',
      description: 'Deploy software-based calibration verification that runs daily before production starts.',
      benefit: 'Early detection of calibration drift',
      timeframe: '1-2 weeks',
      difficulty: 'Medium'
    },
    {
      action: 'Update Calibration Documentation',
      description: 'Create detailed step-by-step calibration guides with visual aids for all critical instruments.',
      benefit: 'Reduced calibration errors by operators',
      timeframe: '3-5 days',
      difficulty: 'Low'
    }
  ],
  'Material Feed Rate': [
    {
      action: 'Install Variable Speed Drive',
      description: 'Replace fixed-speed motor with VSD for precise feed rate control.',
      benefit: '20% improvement in feed consistency',
      timeframe: '1-2 weeks',
      difficulty: 'High'
    },
    {
      action: 'Add Feed Rate Monitoring',
      description: 'Install inline flow meters to provide real-time feed rate feedback.',
      benefit: 'Immediate detection of feed anomalies',
      timeframe: '3-5 days',
      difficulty: 'Medium'
    }
  ],
  'Operator Training': [
    {
      action: 'Develop Standard Operating Procedures',
      description: 'Create comprehensive SOPs for all critical process operations.',
      benefit: 'Consistent operation across all shifts',
      timeframe: '2-3 weeks',
      difficulty: 'Low'
    },
    {
      action: 'Implement Competency Assessment',
      description: 'Establish formal training program with periodic competency testing.',
      benefit: 'Verified operator skills and knowledge',
      timeframe: '1-2 months',
      difficulty: 'Medium'
    }
  ],
  'Humidity Control': [
    {
      action: 'Upgrade HVAC Control System',
      description: 'Replace manual humidity controls with automated PID-based system.',
      benefit: 'Tighter humidity control within ±2%',
      timeframe: '2-3 weeks',
      difficulty: 'High'
    },
    {
      action: 'Add Humidity Sensors',
      description: 'Install additional humidity sensors in process-critical areas.',
      benefit: 'Better spatial monitoring of humidity levels',
      timeframe: '2-3 days',
      difficulty: 'Low'
    }
  ]
};

function RecommendationItem({ title, impact }) {
  const [expanded, setExpanded] = useState(false);

  const getImpactColor = (impact) => {
    if (impact.includes('High')) return 'text-red-600';
    if (impact.includes('Medium')) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'High') return 'text-red-600';
    if (difficulty === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const actions = actionsData[title] || [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            <Lightbulb size={20} />
          </div>
          <div>
            <h4 className="text-gray-800 font-medium text-sm">{title}</h4>
            <p className={`text-xs ${getImpactColor(impact)}`}>{impact}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <h5 className="font-semibold text-gray-800 mt-4 mb-3">Recommended Actions</h5>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Expected Benefit</th>
                  <th className="pb-2 font-medium">Timeframe</th>
                  <th className="pb-2 font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-800 align-top">{action.action}</td>
                    <td className="py-3 pr-4 text-gray-600 align-top max-w-md">{action.description}</td>
                    <td className="py-3 pr-4 text-gray-600 align-top">{action.benefit}</td>
                    <td className="py-3 pr-4 text-gray-600 align-top whitespace-nowrap">{action.timeframe}</td>
                    <td className={`py-3 align-top whitespace-nowrap ${getDifficultyColor(action.difficulty)}`}>
                      {action.difficulty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Select and implement the most appropriate action based on your current priorities and resources.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecommendationItem;

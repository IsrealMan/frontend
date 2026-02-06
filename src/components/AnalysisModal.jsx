import { X, ThumbsUp, ThumbsDown, BarChart3 } from 'lucide-react';

const analysisData = {
  'Temperature Control': {
    title: 'Temperature Control',
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Temperature readings showed consistent deviation from setpoint values. Upper control limits were exceeded 12 times in the past 24 hours, indicating systematic drift.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Correlation analysis between ambient temperature and process temperature showed a moderate positive correlation (r=0.72), suggesting environmental factors are contributing.'
      },
      {
        title: 'Process Mapping',
        content: 'Heat exchanger efficiency has decreased by 15% since last maintenance cycle. Fouling indicators suggest cleaning is required.'
      },
      {
        title: 'Regression Analysis',
        content: 'Multivariate analysis indicates that cooling water flow rate is the most significant factor (p<0.01) affecting temperature stability.'
      }
    ]
  },
  'Pressure System': {
    title: 'Pressure System',
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Pressure fluctuations detected with amplitude exceeding normal operating range. Pattern suggests valve cycling issues.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Strong negative correlation (r=-0.91) found between pressure drops and flow rate increases, indicating potential restriction in the system.'
      },
      {
        title: 'Process Mapping',
        content: 'Pressure relief valve PRV-101 showed abnormal activation frequency. Last calibration was 45 days overdue.'
      },
      {
        title: 'Regression Analysis',
        content: 'Analysis shows pump discharge pressure variance accounts for 78% of downstream pressure instability.'
      }
    ]
  },
  "CD's": {
    title: "CD's",
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Process parameters showed significant deviations. Values exceeded upper control limits, indicating a statistically significant abnormal pattern.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Correlation analysis between temperature increases and pressure values showed a strong positive correlation (r=0.87), suggesting that pressure variations may be contributing to temperature instability.'
      },
      {
        title: 'Process Mapping',
        content: 'Value stream mapping of the affected process area identified that the issue occurred after preventive maintenance was performed on Valve Unit B-3 yesterday. The timing corresponds with the start of observed deviations.'
      },
      {
        title: 'Regression Analysis',
        content: 'Multivariate analysis considering environmental factors, maintenance timing, and operational parameters indicated that valve positioning accuracy after maintenance is the most statistically significant factor (p<0.001).'
      }
    ]
  },
  'Coolant Flow': {
    title: 'Coolant Flow',
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Flow rate measurements show gradual decline over the past 48 hours, with current readings 8% below target.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Inverse correlation (r=-0.68) between coolant temperature and flow rate suggests viscosity changes affecting pump performance.'
      },
      {
        title: 'Process Mapping',
        content: 'Filter differential pressure has increased by 40%, indicating partial blockage requiring attention.'
      },
      {
        title: 'Regression Analysis',
        content: 'Pump speed variation explains 65% of flow inconsistencies. VFD settings may require recalibration.'
      }
    ]
  },
  'Humidity Level': {
    title: 'Humidity Level',
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Humidity readings exceeded upper specification limit during night shift operations for 3 consecutive days.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Strong correlation (r=0.89) between external weather conditions and internal humidity levels detected.'
      },
      {
        title: 'Process Mapping',
        content: 'HVAC damper actuator showing intermittent response. Maintenance inspection recommended.'
      },
      {
        title: 'Regression Analysis',
        content: 'Dehumidifier capacity utilization at 95% during peak periods indicates need for additional capacity.'
      }
    ]
  },
  'Material Feed': {
    title: 'Material Feed',
    sections: [
      {
        title: 'Control Chart Review',
        content: 'Feed rate variability increased by 23% compared to baseline, with multiple out-of-spec events.'
      },
      {
        title: 'Scatter Diagram',
        content: 'Correlation analysis shows material moisture content (r=0.76) significantly affects feed consistency.'
      },
      {
        title: 'Process Mapping',
        content: 'Hopper level sensor calibration drift detected. Last calibration was 60 days ago.'
      },
      {
        title: 'Regression Analysis',
        content: 'Screw feeder wear pattern analysis suggests replacement within next 30 days to maintain accuracy.'
      }
    ]
  }
};

function AnalysisModal({ isOpen, onClose, parameterName, alertType }) {
  if (!isOpen) return null;

  const analysis = analysisData[parameterName] || {
    title: parameterName,
    sections: []
  };

  const alertLabel = alertType === 'critical' ? 'Critical Alert' : 'Warning';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {alertLabel} Analysis: {analysis.title}
            </h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <ThumbsUp size={18} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <ThumbsDown size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
          <p className="text-gray-500 text-sm mb-6">
            Detailed analysis that was performed to identify the root cause.
          </p>

          <div className="space-y-6">
            {analysis.sections.map((section, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                  <BarChart3 size={18} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisModal;

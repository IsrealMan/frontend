import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

const rcData = {
  'Temperature Control': {
    title: 'Temperature Control',
    rootCause: 'Improper calibration of temperature sensors resulting in incorrect temperature readings and control actions.',
    recommendations: [
      'Recalibrate temperature sensors using standard procedure',
      'Verify sensor readings through manual measurement',
      'Update calibration schedule to include monthly verification',
      'Train operators on proper temperature monitoring procedures'
    ]
  },
  'Pressure System': {
    title: 'Pressure System',
    rootCause: 'Worn pressure relief valve seals causing intermittent pressure fluctuations and system instability.',
    recommendations: [
      'Replace pressure relief valve seals immediately',
      'Inspect all pressure vessels for signs of wear',
      'Implement preventive maintenance schedule for valves',
      'Install redundant pressure monitoring sensors'
    ]
  },
  "CD's": {
    title: "CD's",
    rootCause: 'Valve positioning accuracy degraded after recent maintenance, causing flow control deviations.',
    recommendations: [
      'Re-calibrate valve actuators to factory specifications',
      'Verify valve positioning feedback sensors',
      'Review maintenance procedures for valve servicing',
      'Implement post-maintenance verification checklist'
    ]
  },
  'Coolant Flow': {
    title: 'Coolant Flow',
    rootCause: 'Partial blockage in coolant filter reducing flow rate below optimal operating parameters.',
    recommendations: [
      'Replace coolant filters immediately',
      'Flush coolant system to remove debris',
      'Reduce filter replacement interval to 30 days',
      'Install flow rate monitoring alarm system'
    ]
  },
  'Humidity Level': {
    title: 'Humidity Level',
    rootCause: 'HVAC damper actuator malfunction causing inadequate humidity control during high-load periods.',
    recommendations: [
      'Replace faulty damper actuator',
      'Inspect all HVAC control components',
      'Add supplementary dehumidification capacity',
      'Implement real-time humidity monitoring alerts'
    ]
  },
  'Material Feed': {
    title: 'Material Feed',
    rootCause: 'Hopper level sensor calibration drift causing inconsistent material feed rates.',
    recommendations: [
      'Recalibrate hopper level sensors',
      'Inspect screw feeder for wear patterns',
      'Implement weekly calibration verification',
      'Consider upgrading to more accurate sensor technology'
    ]
  }
};

function RCModal({ isOpen, onClose, parameterName, alertType }) {
  if (!isOpen) return null;

  const data = rcData[parameterName] || {
    title: parameterName,
    rootCause: 'Root cause analysis pending.',
    recommendations: ['Analysis in progress']
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Root Cause and Recommendations: {data.title}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Summary of identified root cause and recommended actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <ThumbsUp size={18} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <ThumbsDown size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-100px)]">
          {/* Root Cause Summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Root Cause Summary</h3>
            <p className="text-gray-600 leading-relaxed">{data.rootCause}</p>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-600">
                  <span className="text-gray-400 mt-1.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RCModal;

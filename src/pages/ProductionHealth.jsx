import { useState } from 'react';
import { RefreshCw, MessageSquare, Lightbulb } from 'lucide-react';
import ParameterCard from '../components/ParameterCard';
import AIRecommendationCard from '../components/AIRecommendationCard';
import RecommendationItem from '../components/RecommendationItem';

const tabs = [
  { id: 'machine-health', label: 'Machine Health', icon: RefreshCw },
  { id: 'recommendations', label: 'Recommendations', icon: MessageSquare },
  { id: 'improvements', label: 'Improvements', icon: Lightbulb },
];

// Mock data for charts
const temperatureData = [
  { time: '14:00', value: 65 },
  { time: '14:30', value: 58 },
  { time: '15:00', value: 72 },
  { time: '15:30', value: 68 },
  { time: '16:00', value: 75 },
  { time: '16:30', value: 82 },
  { time: '17:00', value: 78 },
  { time: '17:30', value: 85 },
  { time: '18:00', value: 82 },
];

const pressureData = [
  { time: '14:00', value: 88 },
  { time: '14:30', value: 92 },
  { time: '15:00', value: 85 },
  { time: '15:30', value: 90 },
  { time: '16:00', value: 95 },
  { time: '16:30', value: 88 },
  { time: '17:00', value: 92 },
  { time: '17:30', value: 90 },
  { time: '18:00', value: 94 },
];

const humidityData = [
  { time: '14:00', value: 52 },
  { time: '14:30', value: 48 },
  { time: '15:00', value: 50 },
  { time: '15:30', value: 46 },
  { time: '16:00', value: 49 },
  { time: '16:30', value: 45 },
  { time: '17:00', value: 48 },
  { time: '17:30', value: 46 },
  { time: '18:00', value: 47 },
];

// AI Recommendations data
const aiRecommendations = [
  {
    id: 1,
    title: 'Critical Temperature Alert',
    description: 'Machine A1 temperature has exceeded the safety threshold of 80°C',
    tags: ['Machine A1', 'Temperature'],
    recommendation: 'Reduce operational load and check cooling system',
    variant: 'critical'
  },
  {
    id: 2,
    title: 'Thickness Variation Detected',
    description: 'Product thickness is showing downward trend below acceptable range',
    tags: ['Thickness'],
    recommendation: 'Calibrate thickness control mechanism',
    variant: 'warning'
  },
  {
    id: 3,
    title: 'Predictive Maintenance Due',
    description: 'Machine B3 approaching scheduled maintenance window based on operational hours',
    tags: ['Machine B3'],
    recommendation: 'Schedule maintenance within next 48 hours',
    variant: 'info'
  }
];

// Improvement recommendations (same as Dashboard)
const improvementRecommendations = [
  { id: 1, title: 'Temperature Control Frequency', impact: 'High Impact' },
  { id: 2, title: 'Calibration Procedure', impact: 'High Impact' },
  { id: 3, title: 'Material Feed Rate', impact: 'Medium Impact' },
  { id: 4, title: 'Operator Training', impact: 'Medium Impact' },
  { id: 5, title: 'Humidity Control', impact: 'Low Impact' }
];

function ProductionHealth() {
  const [activeTab, setActiveTab] = useState('machine-health');

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Production Health</h2>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-xl p-1.5 inline-flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'machine-health' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Machine Health Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ParameterCard
              title="Temperature"
              value={82}
              unit="°C"
              change="4.5%"
              changeType="up"
              status="warning"
              data={temperatureData}
              upperLimit={90}
              lowerLimit={50}
            />
            <ParameterCard
              title="Pressure"
              value={94}
              unit="PSI"
              change="2.1%"
              changeType="down"
              status="normal"
              data={pressureData}
              upperLimit={100}
              lowerLimit={75}
            />
            <ParameterCard
              title="Humidity"
              value={47}
              unit="%"
              change="1.8%"
              changeType="down"
              status="normal"
              data={humidityData}
              upperLimit={55}
              lowerLimit={35}
            />
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.map((rec) => (
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

      {activeTab === 'improvements' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Improvement Recommendations</h3>
          <p className="text-gray-500 text-sm mb-5">
            The following parameters could be optimized to improve overall system performance.
            Click on each parameter to view specific action recommendations.
          </p>
          <div className="space-y-3">
            {improvementRecommendations.map((rec) => (
              <RecommendationItem
                key={rec.id}
                title={rec.title}
                impact={rec.impact}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductionHealth;

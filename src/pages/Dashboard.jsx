import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import KPICard from '../components/KPICard';
import RecommendationItem from '../components/RecommendationItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AnalysisModal from '../components/AnalysisModal';

function Dashboard() {
  const { data: overview, loading: overviewLoading, error: overviewError } = useApi('/api/overview');
  const { data: recommendations, loading: recsLoading, error: recsError } = useApi('/api/recommendations');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [selectedAlertType, setSelectedAlertType] = useState(null);

  const handleAnalysisClick = (parameterName, alertType) => {
    setSelectedParameter(parameterName);
    setSelectedAlertType(alertType);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedParameter(null);
    setSelectedAlertType(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Production Overview</h2>
        <p className="text-gray-500">Real-time analytics and insights for your manufacturing processes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {overviewLoading ? (
          <>
            <div className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
            <div className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
          </>
        ) : overviewError ? (
          <div className="col-span-2">
            <ErrorMessage message={overviewError} />
          </div>
        ) : (
          <>
            <KPICard
              title="Critical Alerts"
              count={overview?.criticalAlerts?.count}
              subtitle={overview?.criticalAlerts?.subtitle}
              parameters={overview?.criticalAlerts?.affectedParameters}
              variant="critical"
              onAnalysisClick={handleAnalysisClick}
            />
            <KPICard
              title="Warnings"
              count={overview?.warnings?.count}
              subtitle={overview?.warnings?.subtitle}
              parameters={overview?.warnings?.affectedParameters}
              variant="warning"
              onAnalysisClick={handleAnalysisClick}
            />
          </>
        )}
      </div>

      {/* Improvement Recommendations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Improvement Recommendations</h3>
        <p className="text-gray-500 text-sm mb-5">
          The following parameters could be optimized to improve overall system performance.
          Click on each parameter to view specific action recommendations.
        </p>

        {recsLoading ? (
          <LoadingSpinner />
        ) : recsError ? (
          <ErrorMessage message={recsError} />
        ) : (
          <div className="space-y-3">
            {recommendations?.map((rec) => (
              <RecommendationItem
                key={rec.id}
                title={rec.title}
                impact={rec.impact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        parameterName={selectedParameter}
        alertType={selectedAlertType}
      />
    </div>
  );
}

export default Dashboard;

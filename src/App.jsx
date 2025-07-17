import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertCircle, Activity } from 'lucide-react';
import OverviewCards from './components/OverviewCards';
import PerformanceTable from './components/PerformanceTable';
import TrendChart from './components/TrendChart';
import { 
  loadPerformanceData, 
  processOperationData, 
  calculateSummaryStats, 
  compareDailyData 
} from './utils/dataLoader';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const performanceData = await loadPerformanceData();
      
      if (!performanceData) {
        throw new Error('Failed to load performance data');
      }
      
      setData(performanceData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summaryStats = data ? calculateSummaryStats(data) : null;
  const processedOperations = data ? processOperationData(data) : [];
  const dailyComparison = data ? compareDailyData(data.daily) : null;

  const LoadingState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Performance Data</h3>
        <p className="text-gray-500">Please wait while we fetch the latest results...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={loadData}
          className="btn-primary inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'trends', name: 'Trends', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">TTNN Performance Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time operation performance monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <button 
                onClick={loadData}
                className="btn-secondary inline-flex items-center"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <OverviewCards 
              summaryStats={summaryStats} 
              dailyComparison={dailyComparison} 
            />
            <PerformanceTable operations={processedOperations} />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="animate-fade-in">
            <TrendChart dailyData={data?.daily || []} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              <p>TTNN Performance Dashboard • {summaryStats?.totalOperations || 0} operations monitored</p>
            </div>
            <div className="mt-2 sm:mt-0 text-sm text-gray-500">
              {summaryStats && (
                <p>
                  Last measurement: {new Date(summaryStats.lastUpdated).toLocaleString()} 
                  {summaryStats.gitCommit && ` • Commit: ${summaryStats.gitCommit}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 
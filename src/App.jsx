import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertCircle, Zap, Activity, TrendingUp } from 'lucide-react';
import OverviewCards from './components/OverviewCards';
import PerformanceTable from './components/PerformanceTable';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-indigo-400 animate-ping mx-auto"></div>
        </div>
        <div className="glass-card max-w-md">
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center">
            <Activity className="h-6 w-6 mr-2 text-blue-600" />
            Loading Performance Data
          </h3>
          <p className="text-gray-600">Fetching the latest TTNN operation results...</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="glass-card">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">Connection Issue</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadData}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="header-gradient shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tenstorrent TT-Metal
                </h1>
                <p className="text-lg font-semibold text-gray-700">Eltwise Performance Tracker</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Real-time operation performance monitoring
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {lastRefresh && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Last Updated</div>
                  <div className="text-xs text-gray-500">{lastRefresh.toLocaleTimeString()}</div>
                </div>
              )}
              <button 
                onClick={loadData}
                className="btn-secondary inline-flex items-center pulse-glow"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Section */}
        <section className="fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Overview</h2>
            <p className="text-gray-600">Key metrics and trends for TTNN eltwise operations</p>
          </div>
          <OverviewCards summaryStats={summaryStats} dailyComparison={dailyComparison} />
        </section>

        {/* Performance Table Section */}
        <section className="slide-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Performance Analysis</h2>
            <p className="text-gray-600">Day-by-day performance comparison across all operations</p>
          </div>
                     <div className="glass-card">
             <PerformanceTable 
               operations={processedOperations}
               dailyData={data?.daily || []}
             />
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2025 Aswin. Thanks to the TT-Metal community for their amazing work.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Powered by TT-Metal</span>
              <span>•</span>
              <span>{summaryStats?.totalOperations || 0} Operations Tracked</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 
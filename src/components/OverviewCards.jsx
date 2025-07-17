import React from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, GitBranch } from 'lucide-react';

const OverviewCards = ({ summaryStats, dailyComparison }) => {
  if (!summaryStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Test Success Rate',
      value: `${summaryStats.successRate}%`,
      subtitle: `${summaryStats.successfulTests}/${summaryStats.totalTests} tests passed`,
      icon: summaryStats.failedTests === 0 ? CheckCircle : XCircle,
      color: summaryStats.failedTests === 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summaryStats.failedTests === 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Operations',
      value: summaryStats.totalOperations,
      subtitle: 'Performance measured',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Average Duration',
      value: `${summaryStats.avgDuration}ms`,
      subtitle: dailyComparison ? 
        `${dailyComparison.improvement > 0 ? '↓' : '↑'} ${Math.abs(dailyComparison.improvement)}% vs yesterday` : 
        'Across all operations',
      icon: dailyComparison?.improvement > 0 ? TrendingUp : TrendingDown,
      color: dailyComparison?.improvement > 0 ? 'text-green-600' : 'text-orange-600',
      bgColor: dailyComparison?.improvement > 0 ? 'bg-green-50' : 'bg-orange-50'
    },
    {
      title: 'Git Commit',
      value: summaryStats.gitCommit,
      subtitle: `Updated ${new Date(summaryStats.lastUpdated).toLocaleDateString()}`,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="metric-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards; 
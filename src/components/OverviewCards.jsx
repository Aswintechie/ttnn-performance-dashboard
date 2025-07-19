import React from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, GitBranch, Target, Zap, Activity, Cpu } from 'lucide-react';

const OverviewCards = ({ summaryStats, dailyComparison }) => {
  if (!summaryStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
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
      color: summaryStats.failedTests === 0 ? 'text-emerald-600' : 'text-red-500',
      bgColor: summaryStats.failedTests === 0 ? 'bg-emerald-50' : 'bg-red-50',
      accentColor: summaryStats.failedTests === 0 ? 'from-emerald-400 to-green-500' : 'from-red-400 to-rose-500',
      metric: summaryStats.successRate
    },
    {
      title: 'Total Operations',
      value: summaryStats.totalOperations.toLocaleString(),
      subtitle: 'Performance measured',
      icon: Cpu,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      accentColor: 'from-blue-400 to-indigo-500',
      metric: summaryStats.totalOperations
    },
    {
      title: 'Average Duration',
      value: `${summaryStats.avgDuration}ms`,
      subtitle: dailyComparison ? 
        `${dailyComparison.improvement > 0 ? '↓' : '↑'} ${Math.abs(dailyComparison.improvement)}% vs yesterday` : 
        'Across all operations',
      icon: dailyComparison?.improvement > 0 ? TrendingDown : TrendingUp,
      color: dailyComparison?.improvement > 0 ? 'text-emerald-600' : 'text-amber-600',
      bgColor: dailyComparison?.improvement > 0 ? 'bg-emerald-50' : 'bg-amber-50',
      accentColor: dailyComparison?.improvement > 0 ? 'from-emerald-400 to-green-500' : 'from-amber-400 to-orange-500',
      trend: dailyComparison?.improvement,
      metric: parseFloat(summaryStats.avgDuration)
    },
    {
      title: 'Git Commit',
      value: summaryStats.gitCommit,
      subtitle: `Updated ${new Date(summaryStats.lastUpdated).toLocaleDateString()}`,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      accentColor: 'from-purple-400 to-indigo-500',
      metric: 1
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.title} 
            className="metric-card group hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {card.title}
              </h3>
              <div className={`relative ${card.bgColor} p-3 rounded-xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <Icon className={`h-6 w-6 ${card.color} relative z-10`} />
              </div>
            </div>

            {/* Value */}
            <div className="mb-3">
              <div className="text-3xl font-bold text-gray-900 mb-1 font-mono">
                {card.value}
              </div>
              
              {/* Progress bar for visual representation */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${card.accentColor} h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min(100, (card.metric / (card.title === 'Total Operations' ? 300 : 100)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Subtitle with trend indicator */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 flex-1">
                {card.subtitle}
              </p>
              
              {card.trend !== undefined && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  card.trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {card.trend > 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(card.trend).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards; 
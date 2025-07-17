import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, BarChart3 } from 'lucide-react';

const PerformanceTable = ({ operations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'average_duration_ns', direction: 'desc' });
  const [filterRating, setFilterRating] = useState('all');

  const sortedAndFilteredOperations = useMemo(() => {
    let filtered = operations.filter(op => 
      op.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterRating !== 'all') {
      filtered = filtered.filter(op => op.performance_rating === filterRating);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [operations, searchTerm, sortConfig, filterRating]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getPerformanceRatingBadge = (rating) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      'needs-improvement': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      'needs-improvement': 'Needs Work'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[rating]}`}>
        {labels[rating]}
      </span>
    );
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <th 
      className={`table-header cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  if (!operations || operations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-500">Performance data will appear here once measurements are available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Operation Performance</h2>
          <p className="text-sm text-gray-500">{sortedAndFilteredOperations.length} operations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search operations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Ratings</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs-improvement">Needs Work</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <SortableHeader sortKey="operation_name">Operation</SortableHeader>
              <SortableHeader sortKey="average_duration_ns">Avg Duration</SortableHeader>
              <SortableHeader sortKey="min_duration_ns">Min</SortableHeader>
              <SortableHeader sortKey="max_duration_ns">Max</SortableHeader>
              <SortableHeader sortKey="std_deviation_ns">Std Dev</SortableHeader>
              <SortableHeader sortKey="successful_runs">Runs</SortableHeader>
              <th className="table-header">Performance</th>
              <th className="table-header">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredOperations.map((operation, index) => (
              <tr key={`${operation.test_name}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{operation.operation_name}</div>
                    <div className="text-xs text-gray-500">{operation.test_name}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="font-mono text-sm">
                    <div className="font-medium">{operation.average_duration_ms}ms</div>
                    <div className="text-xs text-gray-500">{(operation.average_duration_ns / 1000).toFixed(1)}μs</div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="font-mono text-sm text-green-600">{operation.min_duration_ms}ms</span>
                </td>
                <td className="table-cell">
                  <span className="font-mono text-sm text-red-600">{operation.max_duration_ms}ms</span>
                </td>
                <td className="table-cell">
                  <span className="font-mono text-sm text-gray-600">±{operation.std_deviation_ms}ms</span>
                </td>
                <td className="table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {operation.successful_runs}
                  </span>
                </td>
                <td className="table-cell">
                  {getPerformanceRatingBadge(operation.performance_rating)}
                </td>
                <td className="table-cell">
                  <span className="text-xs text-gray-500">
                    {new Date(operation.timestamp).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredOperations.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No operations match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceTable; 
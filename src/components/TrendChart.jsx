import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const TrendChart = ({ dailyData }) => {
  const [selectedMetric, setSelectedMetric] = useState('average');
  const [selectedOperations, setSelectedOperations] = useState([]);

  const chartData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];

    // Sort by date
    const sortedData = [...dailyData].sort((a, b) => 
      new Date(a.metadata.measurement_date) - new Date(b.metadata.measurement_date)
    );

    return sortedData.map(day => {
      const date = new Date(day.metadata.measurement_date);
      const dateStr = date.toLocaleDateString();
      
      const dayStats = {
        date: dateStr,
        fullDate: day.metadata.measurement_date,
        successRate: (day.metadata.successful_tests / day.metadata.total_tests * 100).toFixed(1),
        totalTests: day.metadata.total_tests,
        failedTests: day.metadata.failed_tests
      };

      if (selectedMetric === 'average') {
        const avgDuration = day.results.reduce((sum, r) => sum + r.average_duration_ns, 0) / day.results.length / 1000000;
        dayStats.value = parseFloat(avgDuration.toFixed(3));
        dayStats.label = 'Average Duration (ms)';
      } else if (selectedMetric === 'fastest') {
        const fastest = day.results.reduce((min, r) => r.average_duration_ns < min ? r.average_duration_ns : min, day.results[0]?.average_duration_ns || 0);
        dayStats.value = parseFloat((fastest / 1000000).toFixed(3));
        dayStats.label = 'Fastest Operation (ms)';
      } else if (selectedMetric === 'slowest') {
        const slowest = day.results.reduce((max, r) => r.average_duration_ns > max ? r.average_duration_ns : max, 0);
        dayStats.value = parseFloat((slowest / 1000000).toFixed(3));
        dayStats.label = 'Slowest Operation (ms)';
      }

      return dayStats;
    });
  }, [dailyData, selectedMetric]);

  const operationTrendData = useMemo(() => {
    if (!dailyData || dailyData.length === 0 || selectedOperations.length === 0) return [];

    const sortedData = [...dailyData].sort((a, b) => 
      new Date(a.metadata.measurement_date) - new Date(b.metadata.measurement_date)
    );

    return sortedData.map(day => {
      const date = new Date(day.metadata.measurement_date);
      const dateStr = date.toLocaleDateString();
      
      const dayData = { date: dateStr };
      
      selectedOperations.forEach(opName => {
        const operation = day.results.find(r => r.operation_name === opName);
        if (operation) {
          dayData[opName] = parseFloat((operation.average_duration_ns / 1000000).toFixed(3));
        }
      });

      return dayData;
    });
  }, [dailyData, selectedOperations]);

  const availableOperations = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];
    
    const allOps = new Set();
    dailyData.forEach(day => {
      day.results.forEach(result => {
        allOps.add(result.operation_name);
      });
    });
    
    return Array.from(allOps).sort();
  }, [dailyData]);

  const handleOperationToggle = (operation) => {
    setSelectedOperations(prev => 
      prev.includes(operation) 
        ? prev.filter(op => op !== operation)
        : [...prev, operation].slice(0, 5) // Limit to 5 operations for clarity
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}ms
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h3>
          <p className="text-gray-500">Trend analysis will appear here once multiple days of data are available.</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Overall Trends */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Performance Trends
            </h2>
            <p className="text-sm text-gray-500">Overall performance metrics over time</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="average">Average Duration</option>
              <option value="fastest">Fastest Operation</option>
              <option value="slowest">Slowest Operation</option>
            </select>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Operation Trends */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Individual Operation Trends</h3>
          <p className="text-sm text-gray-500 mb-4">Compare specific operations over time (select up to 5)</p>
          
          <div className="flex flex-wrap gap-2">
            {availableOperations.slice(0, 10).map(operation => (
              <button
                key={operation}
                onClick={() => handleOperationToggle(operation)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  selectedOperations.includes(operation)
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {operation}
              </button>
            ))}
          </div>
        </div>

        {selectedOperations.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedOperations.map((operation, index) => (
                  <Line
                    key={operation}
                    type="monotone"
                    dataKey={operation}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Select operations above to see their trends over time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendChart; 
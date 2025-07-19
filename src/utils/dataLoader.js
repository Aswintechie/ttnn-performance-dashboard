// Utility functions to load and process performance data

export async function loadPerformanceData() {
  try {
    // Load the index file to get available data files
    const indexResponse = await fetch('/data/index.json');
    const indexData = await indexResponse.json();
    
    // Load the latest results
    const latestResponse = await fetch('/data/latest/latest_results.json');
    const latestData = await latestResponse.json();
    
    // Load all daily data files
    const dailyData = await Promise.all(
      indexData.files.map(async (file) => {
        const response = await fetch(`/${file.path}`);
        const data = await response.json();
        return {
          ...data,
          filename: file.filename,
          date: file.measurement_date
        };
      })
    );
    
    return {
      index: indexData,
      latest: latestData,
      daily: dailyData
    };
  } catch (error) {
    console.error('Error loading performance data:', error);
    return null;
  }
}

export function processOperationData(data) {
  if (!data?.latest?.results) return [];
  
  return data.latest.results.map(result => ({
    ...result,
    average_duration_ms: (result.average_duration_ns / 1000000).toFixed(3),
    min_duration_ms: (result.min_duration_ns / 1000000).toFixed(3),
    max_duration_ms: (result.max_duration_ns / 1000000).toFixed(3),
    std_deviation_ms: (result.std_deviation_ns / 1000000).toFixed(3),
    performance_rating: getPerformanceRating(result.average_duration_ns)
  }));
}

export function calculateSummaryStats(data) {
  if (!data?.latest?.metadata) return null;
  
  const metadata = data.latest.metadata;
  const results = (data.latest.results || []).filter(r => r.operation_name !== 'argmax');
  
  const totalOperations = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.average_duration_ns, 0) / totalOperations / 1000000;
  const fastestOperation = results.reduce((min, r) => 
    r.average_duration_ns < min.average_duration_ns ? r : min, results[0]);
  const slowestOperation = results.reduce((max, r) => 
    r.average_duration_ns > max.average_duration_ns ? r : max, results[0]);
  
  return {
    totalTests: metadata.total_tests,
    successfulTests: metadata.successful_tests,
    failedTests: metadata.failed_tests,
    successRate: ((metadata.successful_tests / metadata.total_tests) * 100).toFixed(1),
    totalOperations,
    avgDuration: avgDuration.toFixed(3),
    fastestOperation: fastestOperation?.operation_name || 'N/A',
    slowestOperation: slowestOperation?.operation_name || 'N/A',
    lastUpdated: metadata.measurement_date,
    gitCommit: metadata.git_commit_id?.substring(0, 8) || 'N/A'
  };
}

export function compareDailyData(dailyData) {
  if (!dailyData || dailyData.length < 2) return null;
  
  const sortedData = [...dailyData].sort((a, b) => 
    new Date(a.metadata.measurement_date) - new Date(b.metadata.measurement_date));
  
  const latest = sortedData[sortedData.length - 1];
  const previous = sortedData[sortedData.length - 2];
  
  const latestAvg = calculateAveragePerformance(latest.results);
  const previousAvg = calculateAveragePerformance(previous.results);
  
  const improvement = ((previousAvg - latestAvg) / previousAvg * 100).toFixed(1);
  
  return {
    improvement: parseFloat(improvement),
    latestAvg: latestAvg.toFixed(3),
    previousAvg: previousAvg.toFixed(3),
    trend: improvement > 0 ? 'improving' : improvement < 0 ? 'degrading' : 'stable'
  };
}

function calculateAveragePerformance(results) {
  if (!results || results.length === 0) return 0;
  const filteredResults = results.filter(r => r.operation_name !== 'argmax');
  if (filteredResults.length === 0) return 0;
  return filteredResults.reduce((sum, r) => sum + r.average_duration_ns, 0) / filteredResults.length / 1000000;
}

function getPerformanceRating(durationNs) {
  const durationMs = durationNs / 1000000;
  if (durationMs < 10) return 'excellent';
  if (durationMs < 25) return 'good';
  if (durationMs < 50) return 'fair';
  return 'needs-improvement';
}

export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

export function formatDuration(nanoseconds) {
  const ms = nanoseconds / 1000000;
  if (ms < 1) return `${(nanoseconds / 1000).toFixed(1)}μs`;
  if (ms < 1000) return `${ms.toFixed(3)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
} 
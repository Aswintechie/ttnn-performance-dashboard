import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, BarChart3, TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react';
import { operationsCatalog } from '../utils/operationsCatalog.js';

const PerformanceTable = ({ operations, dailyData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'operation_name', direction: 'asc' });
  const [selectedUnit, setSelectedUnit] = useState('ms');
  const [performanceSort, setPerformanceSort] = useState('none');
  const [selectedCategories, setSelectedCategories] = useState([
    'Unary', 'Binary Arithmetic', 'Binary Comparison', 'Binary Logical', 
    'Ternary', 'Reduction', 'Complex'
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(true); // New state for showing all columns
  const filterRef = useRef(null);
  const tableScrollRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const convertFromNanoseconds = (nanoseconds, unit) => {
    switch (unit) {
      case 'ns':
        return { value: nanoseconds, decimals: 0 };
      case 'μs':
        return { value: nanoseconds / 1000, decimals: 1 };
      case 'ms':
        return { value: nanoseconds / 1000000, decimals: 3 };
      case 's':
        return { value: nanoseconds / 1000000000, decimals: 6 };
      default:
        return { value: nanoseconds / 1000000, decimals: 3 };
    }
  };

  const formatValue = (nanoseconds, unit) => {
    const converted = convertFromNanoseconds(nanoseconds, unit);
    return converted.value.toFixed(converted.decimals);
  };

  const getPerformanceColor = (currentValue, previousValue, isFirstColumn) => {
    // First column (baseline) has no color
    if (isFirstColumn) return 'bg-white';
    
    if (!previousValue || !currentValue) return 'bg-white';
    
    // Calculate percentage change from previous day
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    
    // More granular color gradients based on change from previous day
    // Performance improved (faster = negative change)
    if (changePercent <= -25) return 'bg-green-300 text-green-900';      // >25% improvement
    if (changePercent <= -20) return 'bg-green-200 text-green-900';      // 20-25% improvement
    if (changePercent <= -15) return 'bg-green-150 text-green-800';      // 15-20% improvement  
    if (changePercent <= -10) return 'bg-green-100 text-green-800';      // 10-15% improvement
    if (changePercent <= -5) return 'bg-green-50 text-green-700';        // 5-10% improvement
    if (changePercent <= -2) return 'bg-green-25 text-green-600';        // 2-5% improvement
    
    // Performance stable (within ±2%)
    if (changePercent >= -2 && changePercent <= 2) return 'bg-white';
    
    // Performance degraded (slower = positive change)
    if (changePercent <= 5) return 'bg-red-25 text-red-600';             // 2-5% degradation
    if (changePercent <= 10) return 'bg-red-50 text-red-700';            // 5-10% degradation
    if (changePercent <= 15) return 'bg-red-100 text-red-800';           // 10-15% degradation
    if (changePercent <= 20) return 'bg-red-150 text-red-800';           // 15-20% degradation
    if (changePercent <= 25) return 'bg-red-200 text-red-900';           // 20-25% degradation
    return 'bg-red-300 text-red-900';                                    // >25% degradation
   };

  const getOperationCategory = (operationName) => {
    const name = operationName.toLowerCase();
    const categories = operationsCatalog.categories;
    
    // Check Backward operations first (most specific)
    if (categories.backward.subcategories.unary_backward.operations.includes(name)) return 'Unary Backward';
    if (categories.backward.subcategories.binary_backward.operations.includes(name)) return 'Binary Backward';
    if (categories.backward.subcategories.ternary_backward.operations.includes(name)) return 'Ternary Backward';
    if (categories.backward.subcategories.reduction_backward.operations.includes(name)) return 'Reduction Backward';
    
    // Check Complex operations
    for (const subcat of Object.values(categories.complex.subcategories)) {
      if (subcat.operations.includes(name)) return 'Complex';
    }
    
    // Check Reduction operations
    if (categories.reduction.operations.includes(name)) return 'Reduction';
    
    // Check Ternary operations
    if (categories.ternary.operations.includes(name)) return 'Ternary';
    
    // Check Binary operations with more granular categories
    if (categories.binary.subcategories.arithmetic.operations.includes(name)) return 'Binary Arithmetic';
    if (categories.binary.subcategories.arithmetic_inplace.operations.includes(name)) return 'Binary Inplace';
    if (categories.binary.subcategories.comparison.operations.includes(name)) return 'Binary Comparison';
    if (categories.binary.subcategories.comparison_inplace.operations.includes(name)) return 'Binary Inplace';
    if (categories.binary.subcategories.logical.operations.includes(name)) return 'Binary Logical';
    if (categories.binary.subcategories.logical_inplace.operations.includes(name)) return 'Binary Inplace';
    if (categories.binary.subcategories.bitwise.operations.includes(name)) return 'Binary Logical';
    if (categories.binary.subcategories.mathematical.operations.includes(name)) return 'Binary Arithmetic';
    if (categories.binary.subcategories.mathematical_inplace.operations.includes(name)) return 'Binary Inplace';
    if (categories.binary.subcategories.advanced.operations.includes(name)) return 'Binary Arithmetic';
    
    // Check Unary operations
    if (categories.unary.subcategories.unary_inplace.operations.includes(name)) return 'Unary Inplace';
    
    // Check other unary subcategories
    for (const subcat of Object.values(categories.unary.subcategories)) {
      if (subcat.operations.includes(name)) return 'Unary';
    }
    
    // Default to Unary if not found
    return 'Unary';
  };

    const getCategoryColor = (category) => {
    const colors = {
      'Unary': 'bg-blue-100 text-blue-800',
      'Unary Inplace': 'bg-blue-200 text-blue-900',
      'Binary Arithmetic': 'bg-green-100 text-green-800',
      'Binary Comparison': 'bg-green-200 text-green-900',
      'Binary Logical': 'bg-green-300 text-green-900',
      'Binary Inplace': 'bg-green-400 text-green-900',
      'Ternary': 'bg-purple-100 text-purple-800',
      'Reduction': 'bg-orange-100 text-orange-800',
      'Unary Backward': 'bg-gray-100 text-gray-800',
      'Binary Backward': 'bg-gray-200 text-gray-800',
      'Ternary Backward': 'bg-gray-300 text-gray-800',
      'Reduction Backward': 'bg-gray-400 text-gray-800',
      'Complex': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };



  const getOperationSubcategory = (operationName) => {
    const name = operationName.toLowerCase();
    const categories = operationsCatalog.categories;
    
    // Check each main category's subcategories
    for (const [mainCat, catData] of Object.entries(categories)) {
      if (catData.subcategories) {
        for (const [subCatKey, subCatData] of Object.entries(catData.subcategories)) {
          if (subCatData.operations && subCatData.operations.includes(name)) {
            return {
              main: mainCat,
              sub: subCatKey,
              description: subCatData.description
            };
          }
        }
      } else if (catData.operations && catData.operations.includes(name)) {
        return {
          main: mainCat,
          sub: null,
          description: catData.description
        };
      }
    }
    return null;
  };

  const calculatePerformanceChange = (operation, dateColumns) => {
    if (!dateColumns || dateColumns.length < 2) return 0;
    
    // Compare the last two days (yesterday vs today)
    const previousValue = operation.dailyPerformance[dateColumns[dateColumns.length - 2].date]?.duration_ns;
    const currentValue = operation.dailyPerformance[dateColumns[dateColumns.length - 1].date]?.duration_ns;
    
    if (!previousValue || !currentValue) return 0;
    
    // Negative means improvement (faster), positive means degradation (slower)
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const processedData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];

    // Sort daily data by date
    const sortedDailyData = [...dailyData].sort((a, b) => 
      new Date(a.metadata.measurement_date) - new Date(b.metadata.measurement_date)
    );

    // Get all unique operations (exclude argmax as it's been removed)
    const allOperations = new Set();
    sortedDailyData.forEach(day => {
      day.results.forEach(result => {
        if (result.operation_name !== 'argmax') {
          allOperations.add(result.operation_name);
        }
      });
    });

    // Create data structure for table
    return Array.from(allOperations).map(operationName => {
      const operationData = {
        operation_name: operationName,
        dailyPerformance: {}
      };

      sortedDailyData.forEach(day => {
        const dateKey = new Date(day.metadata.measurement_date).toLocaleDateString();
        const operation = day.results.find(r => r.operation_name === operationName);
        
        if (operation) {
          operationData.dailyPerformance[dateKey] = {
            duration_ns: operation.average_duration_ns,
            successful_runs: operation.successful_runs,
            test_name: operation.test_name
          };
        } else {
          operationData.dailyPerformance[dateKey] = null;
        }
      });

      return operationData;
    });
  }, [dailyData]);

  const dateColumns = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];
    
    return [...dailyData]
      .sort((a, b) => new Date(a.metadata.measurement_date) - new Date(b.metadata.measurement_date))
      .map(day => ({
        date: new Date(day.metadata.measurement_date).toLocaleDateString(),
        commitId: day.metadata.git_commit_id?.substring(0, 8) || 'N/A'
      }));
  }, [dailyData]);

  // Determine which columns have significant performance changes
  const significantColumns = useMemo(() => {
    if (!processedData || dateColumns.length < 2) return dateColumns;
    
    const significantDates = new Set();
    
    // Always include the first column (baseline)
    if (dateColumns.length > 0) {
      significantDates.add(dateColumns[0].date);
    }
    
    // Check each subsequent column for significant changes
    for (let i = 1; i < dateColumns.length; i++) {
      const currentDate = dateColumns[i].date;
      const previousDate = dateColumns[i - 1].date;
      
      let significantOperations = 0;
      let totalOperations = 0;
      
      processedData.forEach(operation => {
        const currentPerf = operation.dailyPerformance[currentDate];
        const previousPerf = operation.dailyPerformance[previousDate];
        
        if (currentPerf && previousPerf) {
          const changePercent = ((currentPerf.duration_ns - previousPerf.duration_ns) / previousPerf.duration_ns) * 100;
          totalOperations++;
          
          // Consider significant if >5% improvement or >10% degradation
          if (changePercent <= -5 || changePercent >= 10) {
            significantOperations++;
          }
        }
      });
      
      // Include column if at least 10% of operations have significant changes
      const significanceThreshold = Math.max(1, Math.floor(totalOperations * 0.1));
      if (significantOperations >= significanceThreshold) {
        significantDates.add(currentDate);
      }
    }
    
    // Always include the last column (latest results)
    if (dateColumns.length > 0) {
      significantDates.add(dateColumns[dateColumns.length - 1].date);
    }
    
    return dateColumns.filter(col => significantDates.has(col.date));
  }, [processedData, dateColumns]);

  // Use filtered or all columns based on toggle
  const displayedDateColumns = useMemo(() => {
    return showAllColumns ? dateColumns : significantColumns;
  }, [showAllColumns, dateColumns, significantColumns]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.filter(op => {
      const matchesSearch = op.operation_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(getOperationCategory(op.operation_name));
      return matchesSearch && matchesCategory;
    });

    // Handle performance-based sorting
    if (performanceSort !== 'none') {
      filtered = filtered.sort((a, b) => {
        const aChange = calculatePerformanceChange(a, dateColumns);
        const bChange = calculatePerformanceChange(b, dateColumns);
        
        if (performanceSort === 'most-improved') {
          return aChange - bChange; // Most negative (improved) first
        } else if (performanceSort === 'most-degraded') {
          return bChange - aChange; // Most positive (degraded) first
        }
        return 0;
      });
    } else {
      // Handle regular column sorting
      filtered = filtered.sort((a, b) => {
        if (sortConfig.key === 'operation_name') {
          const aValue = a.operation_name;
          const bValue = b.operation_name;
          if (sortConfig.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        } else {
          // Sorting by a date column
          const aValue = a.dailyPerformance[sortConfig.key]?.duration_ns || Infinity;
          const bValue = b.dailyPerformance[sortConfig.key]?.duration_ns || Infinity;
          
          if (sortConfig.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        }
      });
    }

    return filtered;
  }, [processedData, searchTerm, sortConfig, performanceSort, dateColumns, selectedCategories]);

  // Auto-scroll to rightmost column (latest results) on data load
  useEffect(() => {
    if (tableScrollRef.current && displayedDateColumns.length > 0) {
      // Small delay to ensure table is rendered
      setTimeout(() => {
        tableScrollRef.current.scrollLeft = tableScrollRef.current.scrollWidth;
      }, 100);
    }
  }, [displayedDateColumns.length, filteredAndSortedData.length]);

  const handleSort = (key) => {
    setPerformanceSort('none'); // Reset performance sort when clicking column headers
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handlePerformanceSort = (sortType) => {
    setPerformanceSort(sortType);
    setSortConfig({ key: 'operation_name', direction: 'asc' }); // Reset column sort
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getPerformanceChange = (current, previous) => {
    if (!current || !previous) return null;
    
    const currentVal = current.duration_ns;
    const previousVal = previous.duration_ns;
    const change = ((currentVal - previousVal) / previousVal * 100);
    
    return {
      percentage: change.toFixed(1),
      trend: change > 5 ? 'worse' : change < -5 ? 'better' : 'stable'
    };
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <th 
      className={`table-header cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-center relative">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          <div className="absolute right-0">
            {sortConfig.direction === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        )}
      </div>
    </th>
  );

  if (!dailyData || dailyData.length === 0) {
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Daily Eltwise Performance Comparison</h2>
          <p className="text-sm text-gray-500">
            {filteredAndSortedData.length} operations 
            {selectedCategories.length > 0 && ` (${selectedCategories.join(', ')} categories)`} • {displayedDateColumns.length}{!showAllColumns && displayedDateColumns.length < dateColumns.length ? ` of ${dateColumns.length}` : ''} days of data
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-3 mt-4 sm:mt-0">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search operations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64 h-10"
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Unit Selector */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {['ns', 'μs', 'ms', 's'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setSelectedUnit(unit)}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 h-10 ${
                    selectedUnit === unit
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
            
            {/* Show All Columns Toggle */}
            <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 h-10">
              <input
                type="checkbox"
                id="showAllColumns"
                checked={showAllColumns}
                onChange={(e) => setShowAllColumns(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="showAllColumns" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
                {showAllColumns ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                Show All Days
              </label>
              {!showAllColumns && significantColumns.length < dateColumns.length && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({dateColumns.length - significantColumns.length} hidden)
                </span>
              )}
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter Categories
                {selectedCategories.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs">
                    {selectedCategories.length}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilters && (
                <div className="absolute top-full mt-2 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-96">
                  <div className="text-sm font-medium text-gray-700 mb-3">Select Operation Categories:</div>
                  
                  <div className="space-y-4">
                    {/* Forward Operations */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Forward Operations</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Unary', 'Unary Inplace', 'Binary Arithmetic', 'Binary Comparison', 'Binary Logical', 'Binary Inplace', 'Ternary', 'Reduction', 'Complex'].map((category) => (
                          <label key={category} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryToggle(category)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Backward Operations */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Backward Operations</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Unary Backward', 'Binary Backward', 'Ternary Backward', 'Reduction Backward'].map((category) => (
                          <label key={category} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryToggle(category)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedCategories.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{selectedCategories.length} categories selected</span>
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Performance Sort Section */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <span className="text-sm font-medium text-gray-700">Performance Sort:</span>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => handlePerformanceSort('none')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap rounded-l-lg ${
                  performanceSort === 'none'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                None
              </button>
              <button
                onClick={() => handlePerformanceSort('most-improved')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap border-l border-gray-300 ${
                  performanceSort === 'most-improved'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Improved
              </button>
              <button
                onClick={() => handlePerformanceSort('most-degraded')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap border-l border-gray-300 rounded-r-lg ${
                  performanceSort === 'most-degraded'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Degraded
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative" ref={tableScrollRef}>
        <table className="min-w-full relative border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <SortableHeader sortKey="operation_name" className="table-sticky-left-0 bg-gray-50 text-center border-r border-gray-200 px-4 z-40">
                Operation
              </SortableHeader>
              <th className="table-header text-center table-sticky-left-160 bg-gray-50 border-r border-gray-200 px-4 z-30">Category</th>
              {displayedDateColumns.map((dateObj, index) => (
                <SortableHeader key={dateObj.date} sortKey={dateObj.date} className="min-w-32 text-center">
                  <div className="flex flex-col items-center">
                    <span>{dateObj.date}</span>
                    {index === displayedDateColumns.length - 1 ? (
                      <span className="text-xs text-primary-600 font-normal">Latest</span>
                    ) : (
                      <span className="text-xs text-primary-600 font-mono">{dateObj.commitId}</span>
                    )}
                  </div>
                </SortableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((operation, index) => (
              <tr key={operation.operation_name} className="hover:bg-gray-50 transition-colors duration-150 group">
                <td className="table-cell-sticky table-sticky-left-0 bg-white group-hover:bg-gray-50 font-medium text-gray-900 border-r border-gray-200 text-center transition-colors duration-150">
                  {operation.operation_name}
                </td>
                <td className="table-cell-sticky text-center table-sticky-left-160 bg-white group-hover:bg-gray-50 border-r border-gray-200 transition-colors duration-150">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(getOperationCategory(operation.operation_name))}`}>
                    {getOperationCategory(operation.operation_name)}
                  </span>
                </td>
                {displayedDateColumns.map((dateObj, dateIndex) => {
                   const dayData = operation.dailyPerformance[dateObj.date];
                   const previousDateObj = dateIndex > 0 ? displayedDateColumns[dateIndex - 1] : null;
                   const previousData = previousDateObj ? operation.dailyPerformance[previousDateObj.date] : null;
                   const change = getPerformanceChange(dayData, previousData);
                   
                   // Get previous day value for comparison
                   const previousValue = previousData?.duration_ns;
                   
                   const isFirstColumn = dateIndex === 0;
                   const colorClass = dayData ? getPerformanceColor(dayData.duration_ns, previousValue, isFirstColumn) : '';
                   
                   // Calculate change from previous day for display
                   const previousChangePercent = !isFirstColumn && previousValue && dayData ? 
                     ((dayData.duration_ns - previousValue) / previousValue * 100) : 0;
                   
                   return (
                     <td key={dateObj.date} className="table-cell text-center relative">
                       {dayData ? (
                         <div className="flex flex-col items-center">
                           <span className={`performance-cell ${colorClass}`}>
                             {formatValue(dayData.duration_ns, selectedUnit)}{selectedUnit}
                           </span>
                           
                           {/* Show day-to-day trend arrow */}
                           {change && change.trend !== 'stable' && (
                             <div className={`flex items-center text-xs ${
                               change.trend === 'better' ? 'text-green-600' : 'text-red-600'
                             }`}>
                               {change.trend === 'better' ? (
                                 <TrendingUp className="h-3 w-3 mr-1" />
                               ) : (
                                 <TrendingDown className="h-3 w-3 mr-1" />
                               )}
                               {Math.abs(parseFloat(change.percentage))}%
                             </div>
                           )}
                           {change && change.trend === 'stable' && (
                             <div className="flex items-center text-xs text-gray-400">
                               <Minus className="h-3 w-3" />
                             </div>
                           )}
                         </div>
                       ) : (
                         <span className="text-gray-400 text-sm">—</span>
                       )}
                     </td>
                   );
                 })}
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       {filteredAndSortedData.length === 0 && (
         <div className="text-center py-8">
           <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
           <p className="text-gray-500">No operations match your search criteria.</p>
         </div>
       )}

       <div className="mt-4 border-t pt-4 space-y-3">
         <div className="flex items-center justify-between text-xs text-gray-500">
           <div className="flex items-center space-x-4">
             <div className="flex items-center">
               <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
               <span>Performance improved ({'>'}5% faster)</span>
             </div>
             <div className="flex items-center">
               <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
               <span>Performance degraded ({'>'}5% slower)</span>
             </div>
             <div className="flex items-center">
               <Minus className="h-3 w-3 text-gray-400 mr-1" />
               <span>Stable (±5%)</span>
             </div>
           </div>
           <div>
             All times shown in {selectedUnit === 'μs' ? 'microseconds' : selectedUnit === 'ns' ? 'nanoseconds' : selectedUnit === 'ms' ? 'milliseconds' : 'seconds'} • Click column headers to sort by values • Use Performance Sort for trend analysis • Filter by category
           </div>
         </div>
         
         <div className="flex items-center text-xs text-gray-500">
           <span className="mr-3">Performance colors (relative to first column baseline):</span>
           <div className="flex items-center space-x-2">
             <div className="flex items-center">
               <div className="w-4 h-3 bg-green-200 rounded mr-1"></div>
               <span>{'>'}15% faster</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-green-100 rounded mr-1"></div>
               <span>8-15% faster</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-green-50 rounded mr-1"></div>
               <span>3-8% faster</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-white border border-gray-200 rounded mr-1"></div>
               <span>±3% (stable)</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-red-50 rounded mr-1"></div>
               <span>3-8% slower</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-red-100 rounded mr-1"></div>
               <span>8-15% slower</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-3 bg-red-200 rounded mr-1"></div>
               <span>{'>'}15% slower</span>
             </div>
           </div>
         </div>
         
         <div className="space-y-2 text-xs text-gray-500">
           <div className="flex items-center">
             <span className="mr-3 font-medium">Forward Operations:</span>
             <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                 <span>Unary</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                 <span>Binary Arith</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
                 <span>Binary Comp</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-green-300 rounded mr-1"></div>
                 <span>Binary Logic</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div>
                 <span>Ternary</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-orange-100 rounded mr-1"></div>
                 <span>Reduction</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-pink-100 rounded mr-1"></div>
                 <span>Complex</span>
               </div>
             </div>
           </div>
           <div className="flex items-center">
             <span className="mr-3 font-medium">Backward Operations:</span>
             <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                 <span>Unary BW</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
                 <span>Binary BW</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-gray-300 rounded mr-1"></div>
                 <span>Ternary BW</span>
               </div>
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-gray-400 rounded mr-1"></div>
                 <span>Reduction BW</span>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default PerformanceTable;
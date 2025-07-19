import React, { useState } from 'react';
import { X, Search, Book, Zap, Code, Filter } from 'lucide-react';

const CatalogModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const catalogData = {
    summary: {
      totalCategories: 6,
      totalOperations: 288,
      testCoverage: 91.7
    },
    categories: {
      unary: {
        name: 'Unary Operations',
        count: 98,
        description: 'Single-input mathematical and logical operations',
        color: 'from-blue-500 to-indigo-600',
        operations: [
          'abs', 'acos', 'asin', 'asinh', 'atan', 'atanh', 'cos', 'acosh', 'erfinv', 'exp2', 'expm1',
          'gez', 'gtz', 'i0', 'i1', 'isfinite', 'isinf', 'isnan', 'isneginf', 'isposinf', 'lez',
          'log', 'log10', 'log2', 'log1p', 'logical_not', 'ltz', 'neg', 'nez', 'reciprocal', 'relu',
          'relu6', 'sign', 'signbit', 'silu', 'sin', 'sqrt', 'square', 'tan', 'bitwise_not',
          'floor', 'ceil', 'trunc', 'eqz', 'mish', 'tanhshrink', 'deg2rad', 'rad2deg', 'identity',
          'exp', 'erf', 'erfc', 'gelu', 'rsqrt', 'sigmoid', 'sigmoid_accurate',
          'elu', 'heaviside', 'leaky_relu', 'relu_max', 'relu_min', 'fill', 'glu', 'reglu',
          'geglu', 'swiglu', 'clip', 'clamp', 'threshold',
          'softplus', 'tanh', 'log_sigmoid', 'unary_chain', 'cbrt', 'cosh', 'digamma', 'lgamma',
          'multigammaln', 'polygamma', 'sinh', 'softsign', 'swish', 'frac', 'hardswish',
          'hardsigmoid', 'hardtanh', 'selu', 'tril', 'triu', 'round', 'logit', 'prelu',
          'softshrink', 'hardshrink', 'var_hw', 'std_hw', 'logical_not_', 'celu'
        ]
      },
      binary: {
        name: 'Binary Operations',
        count: 64,
        description: 'Two-input arithmetic, comparison, and logical operations',
        color: 'from-green-500 to-emerald-600',
        operations: [
          'add', 'subtract', 'multiply', 'divide', 'mul', 'sub', 'rpow', 'rdiv', 'assign',
          'add_', 'subtract_', 'multiply_', 'divide_', 'mul_', 'sub_', 'div_', 'rsub_',
          'gt', 'lt', 'eq', 'ne', 'ge', 'le',
          'gt_', 'lt_', 'eq_', 'ne_', 'ge_', 'le_',
          'logical_and', 'logical_or', 'logical_xor', 'ldexp', 'xlogy',
          'logical_and_', 'logical_or_', 'logical_xor_', 'ldexp_', 'logaddexp_',
          'bitwise_and', 'bitwise_or', 'bitwise_xor',
          'atan2', 'hypot', 'logaddexp', 'logaddexp2', 'maximum', 'minimum', 'pow', 'fmod',
          'remainder', 'nextafter', 'bias_gelu', 'polyval',
          'bias_gelu_', 'logaddexp2_', 'squared_difference_',
          'addalpha', 'subalpha', 'squared_difference', 'absolute_difference', 'isclose',
          'round_binary', 'clip_binary'
        ]
      },
      ternary: {
        name: 'Ternary Operations',
        count: 5,
        description: 'Three-input conditional and mathematical operations',
        color: 'from-purple-500 to-violet-600',
        operations: ['addcdiv', 'addcmul', 'where', 'mac', 'lerp']
      },
      reduction: {
        name: 'Reduction Operations',
        count: 9,
        description: 'Operations that reduce tensor dimensions',
        color: 'from-orange-500 to-red-600',
        operations: ['max', 'min', 'mean', 'sum', 'prod', 'var', 'std', 'cumsum', 'cumprod']
      },
      backward: {
        name: 'Backward Operations',
        count: 80,
        description: 'Gradient computation operations for training',
        color: 'from-gray-500 to-slate-600',
        operations: [
          'abs_bw', 'acos_bw', 'acosh_bw', 'asin_bw', 'asinh_bw', 'atan_bw', 'atanh_bw',
          'ceil_bw', 'cos_bw', 'cosh_bw', 'deg2rad_bw', 'digamma_bw', 'erf_bw', 'erfc_bw',
          'erfinv_bw', 'exp_bw', 'exp2_bw', 'expm1_bw', 'floor_bw', 'frac_bw', 'gelu_bw',
          'hardsigmoid_bw', 'hardswish_bw', 'i0_bw', 'lgamma_bw', 'log_bw', 'log_sigmoid_bw',
          'log1p_bw', 'log10_bw', 'log2_bw', 'logit_bw', 'multigammaln_bw', 'neg_bw',
          'rad2deg_bw', 'reciprocal_bw', 'relu_bw', 'relu6_bw', 'round_bw', 'rsqrt_bw',
          'selu_bw', 'sigmoid_bw', 'sign_bw', 'silu_bw', 'sin_bw', 'sinh_bw', 'softsign_bw',
          'sqrt_bw', 'square_bw', 'tan_bw', 'tanh_bw', 'tanhshrink_bw', 'trunc_bw',
          'fill_bw', 'fill_zero_bw', 'hardshrink_bw', 'softshrink_bw',
          'add_bw', 'atan2_bw', 'bias_gelu_bw', 'div_bw', 'fmod_bw', 'hypot_bw', 'ldexp_bw',
          'logaddexp_bw', 'logaddexp2_bw', 'max_bw', 'min_bw', 'mul_bw', 'remainder_bw',
          'rsub_bw', 'squared_difference_bw', 'sub_bw', 'xlogy_bw', 'pow_bw', 'addalpha_bw',
          'subalpha_bw', 'addcdiv_bw', 'addcmul_bw', 'lerp_bw', 'where_bw',
          'sum_bw', 'mean_bw', 'var_bw', 'std_bw', 'prod_bw'
        ]
      },
      complex: {
        name: 'Complex Operations',
        count: 8,
        description: 'Complex number mathematical operations',
        color: 'from-pink-500 to-rose-600',
        operations: ['complex_abs', 'complex_recip', 'complex_tensor', 'real', 'imag', 'angle', 'conj', 'polar']
      }
    },
    highPriority: [
      'add', 'subtract', 'multiply', 'divide', 'sqrt', 'exp', 'log', 'reciprocal',
      'relu', 'gelu', 'sigmoid', 'tanh', 'silu', 'celu', 'gt', 'lt', 'eq', 'ne', 'ge', 'le',
      'logical_and', 'logical_or', 'logical_not'
    ]
  };

  const filteredCategories = Object.entries(catalogData.categories).filter(([key, category]) => {
    if (selectedCategory !== 'all' && key !== selectedCategory) return false;
    if (!searchTerm) return true;
    
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.operations.some(op => op.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const filteredOperations = (operations) => {
    if (!searchTerm) return operations;
    return operations.filter(op => op.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Book className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TTNN Operations Catalog
              </h2>
              <p className="text-gray-600">
                {catalogData.summary.totalOperations} operations • {catalogData.summary.testCoverage}% test coverage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search operations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {Object.entries(catalogData.categories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCategories.map(([key, category]) => {
              const filtered = filteredOperations(category.operations);
              if (filtered.length === 0 && searchTerm) return null;
              
              return (
                <div key={key} className="card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color} mr-3`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count} operations</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Operations:</span>
                      <span className="text-xs text-gray-500">{filtered.length} shown</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {filtered.map((operation) => (
                          <span
                            key={operation}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono transition-colors duration-200 ${
                              catalogData.highPriority.includes(operation)
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {catalogData.highPriority.includes(operation) && (
                              <Zap className="h-3 w-3 mr-1" />
                            )}
                            {operation}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-blue-500" />
              <span>High Priority Operations</span>
            </div>
            <div className="flex items-center">
              <Code className="h-4 w-4 mr-1 text-gray-400" />
              <span>{catalogData.summary.testCoverage}% Test Coverage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal; 
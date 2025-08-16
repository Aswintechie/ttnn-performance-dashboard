# 🚀 Tenstorrent TT-Metal Eltwise Performance Tracker

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://ttnn-eltwise-performance.aswincloud.com)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.14-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.13-teal)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A sophisticated performance monitoring dashboard for Tenstorrent's TT-Metal TTNN eltwise operations, providing day-by-day performance analysis, trend tracking, and comprehensive operation categorization.**

## 🌟 **Live Demo**

🔗 **[ttnn-eltwise-performance.aswincloud.com](https://ttnn-eltwise-performance.aswincloud.com)**

---

## 📖 **Overview**

The **Tenstorrent TT-Metal Eltwise Performance Tracker** is an advanced React-based dashboard designed to monitor and analyze the performance of TTNN (Tenstorrent Neural Network) eltwise operations. Built specifically for Tenstorrent's TT-Metal framework, this tool provides insights into operation performance trends, comparative analysis, and comprehensive filtering capabilities.

### 🎯 **Key Features**

- **📊 Day-by-Day Performance Comparison** - Track performance metrics across multiple dates with baseline comparisons
- **🔍 Advanced Filtering System** - 13 granular operation categories with collapsible checkbox filtering
- **📈 Trend Analysis** - Visual indicators for performance improvements and degradations
- **⚡ Unit Conversion** - Dynamic switching between ns, μs, ms, and seconds with appropriate precision
- **📝 Git Commit Correlation** - Link performance changes to specific code commits
- **🎨 Color-Coded Performance** - Green for improvements, red for degradations with percentage changes
- **📱 Responsive Design** - Modern UI with sticky columns and horizontal scrolling support
- **🔄 Real-time Data Loading** - Automatic data fetching and processing

---

## 🛠️ **Tech Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Frontend framework |
| **Vite** | 4.5.14 | Build tool and dev server |
| **Tailwind CSS** | 3.4.13 | Utility-first CSS framework |
| **Recharts** | 2.13.3 | Data visualization library |
| **Cloudflare Workers** | Latest | Deployment platform |

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Git

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/Aswintechie/ttnn-performance-dashboard.git
cd ttnn-performance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🖥️ **Development**

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📊 **Operations Catalog**

The dashboard tracks **288 TTNN eltwise operations** across 6 main categories:

### 🔥 **High Priority Operations** (23 operations)
- **Arithmetic**: `add`, `subtract`, `multiply`, `divide`
- **Activations**: `relu`, `gelu`, `sigmoid`, `tanh`, `silu`, `celu`
- **Mathematical**: `sqrt`, `exp`, `log`, `reciprocal`
- **Comparisons**: `gt`, `lt`, `eq`, `ne`, `ge`, `le`
- **Logical**: `logical_and`, `logical_or`, `logical_not`

### 📋 **Complete Categories**
- **Unary Operations**: 98 operations
- **Binary Operations**: 64 operations  
- **Ternary Operations**: 5 operations
- **Reduction Operations**: 9 operations
- **Backward Operations**: 80 operations
- **Complex Operations**: 8 operations

**Test Coverage**: 264/288 operations (**91.7%**)

---

## 📂 **Project Structure**

```
ttnn-performance-dashboard/
├── 📁 src/
│   ├── 📄 App.jsx                    # Main application component
│   ├── 📄 main.jsx                   # Application entry point
│   ├── 📄 index.css                  # Global styles
│   ├── 📁 components/
│   │   ├── 📄 OverviewCards.jsx      # Performance summary cards
│   │   ├── 📄 PerformanceTable.jsx   # Main data table with filtering
│   │   └── 📄 TrendChart.jsx         # Performance visualization
│   └── 📁 utils/
│       ├── 📄 dataLoader.js          # Data fetching utilities
│       └── 📄 operationsCatalog.js   # Operations categorization
├── 📁 data/                          # Performance data files
│   ├── 📄 index.json                 # Data index
│   ├── 📁 daily/                     # Daily performance results
│   └── 📁 latest/                    # Latest performance data
├── 📁 public/                        # Static assets
├── 📄 package.json                   # Dependencies and scripts
├── 📄 vite.config.js                 # Vite configuration
├── 📄 tailwind.config.js             # Tailwind CSS configuration
├── 📄 wrangler.toml                  # Cloudflare Workers config
└── 📄 eltwise_operations_catalog.md  # Detailed operations documentation
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Optional: Custom API endpoints
VITE_API_BASE_URL=https://your-api.com
```

### **Data Format**
The dashboard expects JSON files in the following structure:
```json
{
  "timestamp": "2025-07-17T04:21:52.123Z",
  "commit_id": "abc123def456",
  "results": {
    "operation_name": {
      "performance_ns": 1234.56,
      "category": "unary"
    }
  }
}
```

---

## 🚢 **Deployment**

### **Cloudflare Workers** (Current)
```bash
# Build and deploy
npm run build
npx wrangler deploy
```

### **Alternative Platforms**
- **Vercel**: `npm run build && vercel --prod`
- **Netlify**: `npm run build && netlify deploy --prod --dir=dist`
- **GitHub Pages**: Configure GitHub Actions with build workflow

---

## 🎨 **Features Deep Dive**

### 📊 **Performance Table**
- **Sticky Operation Column**: Operations remain visible during horizontal scrolling
- **Dynamic Unit Conversion**: Switch between nanoseconds, microseconds, milliseconds, and seconds
- **Baseline Comparison**: First column serves as performance baseline with color-coded improvements/degradations
- **Trend Indicators**: Arrows showing day-over-day performance changes
- **Commit Correlation**: Git commit IDs displayed below each date column

### 🔍 **Advanced Filtering**
- **Collapsible Categories**: Organized into Forward and Backward operations
- **Multiple Selection**: Checkbox-based filtering with select all/none functionality
- **Performance Sorting**: "Most Improved" and "Most Degraded" based on latest changes
- **Category-based Organization**: 13 granular categories for precise filtering

### 📈 **Trend Analysis**
- **Color-coded Performance**: Green = improvement, Red = degradation
- **Percentage Changes**: Quantified performance differences
- **Direction Indicators**: Up/down arrows for quick trend identification
- **Historical Context**: Multi-day performance tracking

---

## 🤝 **Contributing**

We welcome contributions! Please follow these guidelines:

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Code Standards**
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Maintain component modularity
- Add JSDoc comments for complex functions
- Ensure responsive design compatibility

### **Performance Data**
- JSON files should follow the established schema
- Include commit IDs for change correlation
- Use consistent timestamp formatting
- Validate data structure before committing

---

## 📋 **Roadmap**

- [ ] **Real-time Data Updates** - WebSocket integration for live performance monitoring
- [ ] **Historical Analysis** - Extended trend analysis with configurable date ranges
- [ ] **Performance Alerting** - Notifications for significant performance regressions
- [ ] **Export Functionality** - CSV/PDF export for performance reports
- [ ] **Comparison Tools** - Side-by-side operation performance comparisons
- [ ] **API Integration** - Direct integration with TT-Metal performance testing infrastructure
- [ ] **Custom Dashboards** - User-configurable dashboard layouts and metrics

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Tenstorrent Team** - For the amazing TT-Metal framework and TTNN operations
- **React Community** - For the robust ecosystem and best practices
- **Tailwind CSS** - For the utility-first CSS framework
- **Recharts** - For beautiful and responsive data visualizations

---

## 📞 **Support**

- 📧 **Issues**: [GitHub Issues](https://github.com/Aswintechie/ttnn-performance-dashboard/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Aswintechie/ttnn-performance-dashboard/discussions)
- 🌐 **Live Demo**: [ttnn-eltwise-performance.aswincloud.com](https://ttnn-eltwise-performance.aswincloud.com)

---

<div align="center">

**Built with ❤️ for the Tenstorrent Community**

[![GitHub stars](https://img.shields.io/github/stars/Aswintechie/ttnn-performance-dashboard?style=social)](https://github.com/Aswintechie/ttnn-performance-dashboard)
[![GitHub forks](https://img.shields.io/github/forks/Aswintechie/ttnn-performance-dashboard?style=social)](https://github.com/Aswintechie/ttnn-performance-dashboard)

</div> 
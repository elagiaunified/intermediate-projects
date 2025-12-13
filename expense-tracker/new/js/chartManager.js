// js/chartManager.js - Handles data visualization with Chart.js

class ChartManager {
    constructor() {
        this.categoryChart = null;
        this.trendChart = null;
        this.currentView = 'monthly';
    }
    
    init() {
        this.initCategoryChart();
        this.initTrendChart();
    }
    
    initCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;
        
        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${window.app.formatCurrency(value, window.app.currentBaseCurrency)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    initTrendChart() {
        // This would be for a separate trend chart if we add one
        // Currently using category chart as main visualization
    }
    
    updateCharts(chartData) {
        if (!chartData) return;
        
        this.updateCategoryChart(chartData.categories);
        
        if (this.currentView === 'monthly') {
            this.updateMonthlyTrend(chartData.monthly);
        }
    }
    
    updateCategoryChart(categoryData) {
        if (!this.categoryChart || !categoryData) return;
        
        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);
        
        // Get category labels
        const labels = categories.map(category => {
            const labelsMap = {
                'food': 'Food & Dining',
                'transport': 'Transportation',
                'shopping': 'Shopping',
                'entertainment': 'Entertainment',
                'bills': 'Bills & Utilities',
                'health': 'Health & Medical',
                'education': 'Education',
                'other': 'Other'
            };
            return labelsMap[category] || category;
        });
        
        // Update chart data
        this.categoryChart.data.labels = labels;
        this.categoryChart.data.datasets[0].data = amounts;
        this.categoryChart.update();
    }
    
    updateMonthlyTrend(monthlyData) {
        // This would update a line chart showing monthly trends
        // For now, we're just using the category chart
        console.log('Monthly data available for trends:', monthlyData);
    }
    
    setView(view) {
        this.currentView = view;
        
        // Update UI to show appropriate data
        if (view === 'monthly') {
            // Show monthly trend
            if (window.app) {
                const chartData = window.app.prepareChartData(
                    window.app.expenseManager.getExpenses(),
                    window.app.currentBaseCurrency
                );
                this.updateMonthlyTrend(chartData.monthly);
            }
        } else {
            // Show yearly summary
            // Implementation would be similar
        }
    }
    
    exportChart() {
        if (!this.categoryChart) return;
        
        const link = document.createElement('a');
        link.download = `expense-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.categoryChart.toBase64Image();
        link.click();
        
        if (window.app) {
            window.app.showAlert('Chart exported successfully!', 'success');
        }
    }
    
    destroy() {
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }
        if (this.trendChart) {
            this.trendChart.destroy();
        }
    }
}

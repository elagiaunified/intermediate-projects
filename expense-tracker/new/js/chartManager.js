// js/chartManager.js - Handles data visualization with Chart.js

window.ChartManager = class ChartManager {
    constructor() {
        this.categoryChart = null;
        this.currentView = 'monthly';
    }
    
    init() {
        this.initCategoryChart();
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
                        '#9966FF', '#FF9F40', '#C9CBCF'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    updateCharts(chartData) {
        if (!chartData || !this.categoryChart) return;
        this.updateCategoryChart(chartData.categories);
    }
    
    updateCategoryChart(categoryData) {
        if (!categoryData) return;
        
        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);
        
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
        
        this.categoryChart.data.labels = labels;
        this.categoryChart.data.datasets[0].data = amounts;
        this.categoryChart.update();
    }
    
    exportChart() {
        if (!this.categoryChart) return;
        
        const link = document.createElement('a');
        link.download = `expense-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.categoryChart.toBase64Image();
        link.click();
        
        if (window.app) {
            window.app.showAlert('Chart exported!', 'success');
        }
    }
}

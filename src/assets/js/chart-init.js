// Chart.js Initialization - Professional Charts
let chartInitRetries = 0;
const MAX_RETRIES = 50;

function initCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        chartInitRetries++;
        if (chartInitRetries < MAX_RETRIES) {
            console.warn('Chart.js not loaded, retrying...', chartInitRetries);
            setTimeout(initCharts, 200);
            return;
        } else {
            console.error('Chart.js failed to load after', MAX_RETRIES, 'retries');
            return;
        }
    }
    
    // Helper function to create gradient (no plugin needed)
    function createGradient(ctx, chartArea, color, opacityStart = 0.4, opacityEnd = 0.0) {
        if (!chartArea || !ctx) {
            return color;
        }
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        const baseColor = color.replace(/rgba?\(([^)]+)\)/, '$1').split(',');
        if (baseColor.length >= 3) {
            const r = baseColor[0].trim();
            const g = baseColor[1].trim();
            const b = baseColor[2].trim();
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacityStart})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacityEnd})`);
            return gradient;
        }
        return color;
    }
    
    // ========================================================================
    // HERO MINI CHART - Professional Area Chart with Gradient
    // ========================================================================
    const heroChartCanvas = document.getElementById('heroMiniChart');
    const heroChartLoading = document.getElementById('heroChartLoading');
    
    if (heroChartCanvas) {
        try {
            // Show loading state
            if (heroChartLoading) {
                heroChartLoading.classList.remove('hidden');
            }
            
            // Check if canvas is visible and has dimensions
            const canvasParent = heroChartCanvas.parentElement;
            if (!canvasParent) {
                console.warn('Hero chart canvas parent not found');
                if (heroChartLoading) {
                    heroChartLoading.classList.add('hidden');
                }
                return;
            }
            
            // Wait a bit for layout to settle
            const initHeroChart = () => {
                const parentWidth = canvasParent.offsetWidth || canvasParent.clientWidth || 400;
                const parentHeight = canvasParent.offsetHeight || canvasParent.clientHeight || 120;
                
                if (parentWidth === 0 || parentHeight === 0) {
                    console.warn('Hero chart canvas parent has no dimensions, retrying...');
                    setTimeout(initHeroChart, 200);
                    return;
                }
                
                // Set canvas dimensions
                heroChartCanvas.width = parentWidth;
                heroChartCanvas.height = parentHeight;
                heroChartCanvas.style.width = parentWidth + 'px';
                heroChartCanvas.style.height = parentHeight + 'px';
                
                const ctx = heroChartCanvas.getContext('2d');
                if (!ctx) {
                    console.error('Failed to get 2d context for hero chart');
                    if (heroChartLoading) {
                        heroChartLoading.classList.add('hidden');
                    }
                    return;
                }
                
                // Generate more realistic price data with smooth variations
                const basePrice = 25450;
                const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
                const priceData = [];
                let currentPrice = basePrice;
                
                for (let i = 0; i < hours.length; i++) {
                    // Create smooth price movement with realistic volatility
                    const trend = Math.sin(i * 0.8) * 25;
                    const volatility = (Math.random() - 0.5) * 15;
                    const momentum = i > 0 ? (priceData[i - 1] - basePrice) * 0.3 : 0;
                    currentPrice = basePrice + trend + volatility + momentum;
                    priceData.push(Math.round(currentPrice));
                }
                
                // Destroy existing chart if any
                if (heroChartCanvas.chart) {
                    heroChartCanvas.chart.destroy();
                }
                
                const chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: hours,
                        datasets: [{
                            label: 'Giá USDT (VND)',
                            data: priceData,
                            borderColor: 'rgba(255, 107, 53, 1)',
                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.6,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#ff6b35',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 3,
                            pointBackgroundColor: '#ff6b35',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1500,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: true,
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                titleColor: '#ff6b35',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 107, 53, 0.5)',
                                borderWidth: 1,
                                padding: 12,
                                titleFont: { 
                                    size: 13,
                                    weight: 'bold'
                                },
                                bodyFont: { 
                                    size: 12,
                                    weight: '600'
                                },
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y.toLocaleString('vi-VN') + ' VND';
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: false,
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                display: false,
                                grid: {
                                    display: false
                                },
                                beginAtZero: false,
                                min: Math.min(...priceData) - 50,
                                max: Math.max(...priceData) + 50
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        elements: {
                            line: {
                                borderCapStyle: 'round',
                                borderJoinStyle: 'round'
                            }
                        }
                    }
                });
                
                // Store chart instance for potential cleanup
                heroChartCanvas.chart = chartInstance;
                
                // Apply gradient after chart is rendered
                chartInstance.options.animation.onComplete = function() {
                    try {
                        const chartArea = chartInstance.chartArea;
                        if (chartArea && ctx) {
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(255, 107, 53, 0.4)');
                            gradient.addColorStop(1, 'rgba(255, 107, 53, 0.0)');
                            chartInstance.data.datasets[0].backgroundColor = gradient;
                            chartInstance.update('none');
                        }
                    } catch (e) {
                        console.warn('Could not apply gradient:', e);
                    }
                };
                
                // Hide loading state
                if (heroChartLoading) {
                    heroChartLoading.classList.add('hidden');
                }
                
                console.log('Hero mini chart initialized successfully');
            };
            
            // Start initialization
            setTimeout(initHeroChart, 100);
        } catch (error) {
            console.error('Error initializing hero chart:', error);
            if (heroChartLoading) {
                heroChartLoading.classList.remove('hidden');
                heroChartLoading.innerHTML = '<span class="text-red-400">Lỗi tải biểu đồ</span>';
            }
        }
    } else {
        console.warn('Hero chart canvas not found');
    }
    
    // ========================================================================
    // MARKET OVERVIEW CHART - Professional Price Chart
    // ========================================================================
    const marketChartCanvas = document.getElementById('marketOverviewChart');
    const marketChartLoading = document.getElementById('marketChartLoading');
    
    if (marketChartCanvas) {
        try {
            // Show loading state
            if (marketChartLoading) {
                marketChartLoading.classList.remove('hidden');
            }
            
            // Check if canvas is visible and has dimensions
            const canvasParent = marketChartCanvas.parentElement;
            if (!canvasParent || canvasParent.offsetHeight === 0) {
                console.warn('Market chart canvas parent not visible, retrying...');
                setTimeout(() => {
                    if (marketChartLoading) marketChartLoading.classList.add('hidden');
                }, 300);
                return;
            }
            
            // Ensure canvas has proper dimensions
            const parentWidth = canvasParent.offsetWidth;
            const parentHeight = canvasParent.offsetHeight || 400;
            
            if (parentWidth > 0 && parentHeight > 0) {
                marketChartCanvas.width = parentWidth;
                marketChartCanvas.height = parentHeight;
            }
            
            const ctx = marketChartCanvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2d context for market chart');
                if (marketChartLoading) {
                    marketChartLoading.classList.add('hidden');
                }
                return;
            }
            
            // Generate realistic price data for 30 days with trend
            const marketBasePrice = 25450;
            const days = [];
            const priceData = [];
            let currentPrice = marketBasePrice;
            
            for (let i = 0; i < 30; i++) {
                const dayLabel = i === 0 ? 'Today' : i < 7 ? `${i}d ago` : `${i}d`;
                days.push(dayLabel);
                
                // Create realistic price movement with trend and volatility
                const longTermTrend = Math.sin(i * 0.15) * 60;
                const shortTermVolatility = Math.cos(i * 0.4) * 25;
                const randomNoise = (Math.random() - 0.5) * 20;
                const momentum = i > 0 ? (priceData[i - 1] - marketBasePrice) * 0.15 : 0;
                
                currentPrice = marketBasePrice + longTermTrend + shortTermVolatility + randomNoise + momentum;
                priceData.push(Math.round(currentPrice));
            }
            
            // Destroy existing chart if any
            if (marketChartCanvas.chart) {
                marketChartCanvas.chart.destroy();
            }
            
            const chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'USDT/VND Price',
                        data: priceData,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#3b82f6',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#3b82f6',
                            bodyColor: '#fff',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            titleFont: { 
                                size: 13,
                                weight: 'bold'
                            },
                            bodyFont: { 
                                size: 12,
                                weight: '600'
                            },
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y.toLocaleString('vi-VN') + ' VND';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                font: {
                                    size: 10,
                                    weight: '500'
                                },
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                callback: function(value) {
                                    return value.toLocaleString('vi-VN');
                                }
                            },
                            beginAtZero: false,
                            min: Math.min(...priceData) - 100,
                            max: Math.max(...priceData) + 100
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        line: {
                            borderCapStyle: 'round',
                            borderJoinStyle: 'round'
                        }
                    }
                }
            });
            
            // Store chart instance
            marketChartCanvas.chart = chartInstance;
            
            // Handle period buttons
            const periodButtons = document.querySelectorAll('[data-period]');
            periodButtons.forEach(button => {
                button.addEventListener('click', function() {
                    periodButtons.forEach(btn => {
                        btn.classList.remove('active-chart-period', 'bg-gradient-to-r', 'from-purple-500', 'to-blue-500', 'neon-glow-purple');
                        btn.classList.add('glass', 'hover:bg-blue-500/20');
                    });
                    this.classList.add('active-chart-period', 'bg-gradient-to-r', 'from-purple-500', 'to-blue-500', 'neon-glow-purple');
                    this.classList.remove('glass', 'hover:bg-blue-500/20');
                    
                    // Update chart data based on period with demo data
                    const period = this.dataset.period;
                    const chart = marketChartCanvas.chart;
                    const updateBasePrice = 25450;
                    
                    if (chart) {
                        let newDays = [];
                        let newPriceData = [];
                        
                        // Generate different data based on period
                        if (period === '1d') {
                            for (let i = 0; i < 24; i++) {
                                const hour = i.toString().padStart(2, '0');
                                newDays.push(`${hour}:00`);
                                const hourVariation = Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 10;
                                newPriceData.push(Math.round(updateBasePrice + hourVariation));
                            }
                        } else if (period === '7d') {
                            for (let i = 0; i < 7; i++) {
                                newDays.push(i === 0 ? 'Today' : `${i}d ago`);
                                const dayVariation = Math.sin(i * 0.5) * 30 + (Math.random() - 0.5) * 15;
                                newPriceData.push(Math.round(updateBasePrice + dayVariation));
                            }
                        } else if (period === '30d') {
                            for (let i = 0; i < 30; i++) {
                                newDays.push(i === 0 ? 'Today' : i < 7 ? `${i}d ago` : `${i}d`);
                                const dayVariation = Math.sin(i * 0.15) * 60 + Math.cos(i * 0.2) * 30 + (Math.random() - 0.5) * 20;
                                newPriceData.push(Math.round(updateBasePrice + dayVariation));
                            }
                        } else if (period === '90d') {
                            for (let i = 0; i < 12; i++) {
                                newDays.push(i === 0 ? 'This month' : `${i}M ago`);
                                const monthVariation = Math.sin(i * 0.2) * 80 + (Math.random() - 0.5) * 30;
                                newPriceData.push(Math.round(updateBasePrice + monthVariation));
                            }
                        }
                        
                        // Update chart with new data
                        chart.data.labels = newDays;
                        chart.data.datasets[0].data = newPriceData;
                        chart.options.scales.y.min = Math.min(...newPriceData) - 100;
                        chart.options.scales.y.max = Math.max(...newPriceData) + 100;
                        chart.update('active');
                    }
                });
            });
            
            // Hide loading state
            if (marketChartLoading) {
                marketChartLoading.classList.add('hidden');
            }
            
            console.log('Market overview chart initialized successfully');
        } catch (error) {
            console.error('Error initializing market overview chart:', error);
            if (marketChartLoading) {
                marketChartLoading.classList.remove('hidden');
                marketChartLoading.innerHTML = '<div class="text-center"><div class="w-12 h-12 border-4 border-red-400/20 border-t-red-400 rounded-full animate-spin mx-auto mb-4"></div><span class="text-red-400 text-sm">Error loading chart</span></div>';
            }
        }
    }
    
    // ========================================================================
    // TRADING VOLUME CHART - Professional Multi-line Chart
    // ========================================================================
    const tradingChartCanvas = document.getElementById('tradingVolumeChart');
    if (tradingChartCanvas) {
        try {
            const ctx = tradingChartCanvas.getContext('2d');
            
            // Generate realistic volume data with trends
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const buyData = [];
            const sellData = [];
            
            // Base volumes with weekly pattern (higher on weekends)
            for (let i = 0; i < 7; i++) {
                const baseBuy = 45 + (i >= 5 ? 20 : 0); // Higher on weekends
                const baseSell = 42 + (i >= 5 ? 18 : 0);
                const variation = (Math.random() - 0.5) * 10;
                
                buyData.push(Math.round(baseBuy + variation + i * 2));
                sellData.push(Math.round(baseSell + variation + i * 1.8));
            }
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        {
                            label: 'Khối lượng mua (M USD)',
                            data: buyData,
                            borderColor: 'rgba(251, 191, 36, 1)',
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.5,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#fbbf24',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: '#fbbf24',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 3
                        },
                        {
                            label: 'Khối lượng bán (M USD)',
                            data: sellData,
                            borderColor: 'rgba(255, 107, 53, 1)',
                            backgroundColor: 'rgba(255, 107, 53, 0.15)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.5,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#ff6b35',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: '#ff6b35',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#fff',
                                font: {
                                    size: 12,
                                    weight: '600'
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            titleColor: '#ff6b35',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 107, 53, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            titleFont: { 
                                size: 13,
                                weight: 'bold'
                            },
                            bodyFont: { 
                                size: 12,
                                weight: '600'
                            },
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y + 'M USD';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false,
                                lineWidth: 1
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                padding: 8
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false,
                                lineWidth: 1
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                padding: 8,
                                callback: function(value) {
                                    return value + 'M';
                                }
                            },
                            beginAtZero: true
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        line: {
                            borderCapStyle: 'round',
                            borderJoinStyle: 'round'
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Error initializing trading volume chart:', error);
        }
    }
    
    // ========================================================================
    // PROFILE VOLUME CHART - Professional Area Chart
    // ========================================================================
    const profileChartCanvas = document.getElementById('profileVolumeChart');
    if (profileChartCanvas) {
        try {
            const ctx = profileChartCanvas.getContext('2d');
            
            // Generate realistic monthly volume data with growth trend
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const volumeData = [];
            let baseVolume = 120;
            
            for (let i = 0; i < 6; i++) {
                const growth = i * 25; // Steady growth
                const variation = (Math.random() - 0.5) * 15; // Random variation
                volumeData.push(Math.round(baseVolume + growth + variation));
            }
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Volume giao dịch (K USD)',
                        data: volumeData,
                        borderColor: 'rgba(255, 107, 53, 1)',
                        backgroundColor: 'rgba(255, 107, 53, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.5,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#ff6b35',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: '#ff6b35',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            titleColor: '#ff6b35',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 107, 53, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            titleFont: { 
                                size: 13,
                                weight: 'bold'
                            },
                            bodyFont: { 
                                size: 12,
                                weight: '600'
                            },
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + 'K USD';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    size: 11,
                                    weight: '500'
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                callback: function(value) {
                                    return value + 'K';
                                }
                            },
                            beginAtZero: true
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        line: {
                            borderCapStyle: 'round',
                            borderJoinStyle: 'round'
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Error initializing profile volume chart:', error);
        }
    }
}

// Wait for both DOM and Chart.js to be ready
function waitForChartJS(callback, maxAttempts = 100, attempt = 0) {
    if (typeof Chart !== 'undefined' && typeof Chart.register !== 'undefined') {
        // Chart.js is loaded and ready
        callback();
    } else if (attempt < maxAttempts) {
        // Chart.js not ready yet, wait and retry
        setTimeout(() => {
            waitForChartJS(callback, maxAttempts, attempt + 1);
        }, 100);
    } else {
        console.error('Chart.js failed to load after', maxAttempts, 'attempts');
    }
}

function startChartInit() {
    const init = () => {
        waitForChartJS(() => {
            // Chart.js is ready, now wait a bit more for DOM to be fully ready
            setTimeout(() => {
                initCharts();
            }, 200);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already ready
        init();
    }
}

// Start initialization
startChartInit();

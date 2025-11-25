// TradingView Widget Initialization - Optimized for Performance
let tradingViewWidgetInstance = null;
let isTradingViewLoaded = false;

// Optimized widget configuration for faster loading
const getOptimizedWidgetConfig = (containerId, options = {}) => {
    const defaultConfig = {
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: options.interval || "D",
        timezone: "Asia/Ho_Chi_Minh",
        theme: "dark",
        style: options.style || "9", // Volume style
        locale: "en",
        toolbar_bg: "#1a1a1a",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: containerId,
        // Optimized: Only essential studies for faster load
        studies: options.studies || [
            "Volume@tv-basicstudies"
        ],
        hide_volume: false,
        // Optimized: Disable heavy features
        volume_profile_visible: false, // Disable for faster load
        allow_symbol_change: false, // Disable symbol change widget
        details: false, // Disable details panel/widget
        hide_ideas: true, // Disable ideas for faster load
        // Disable additional widgets
        calendar: false, // Disable calendar widget
        hotlist: false, // Disable hotlist widget
        show_popup_button: false, // Disable popup button
        popup_width: "1000",
        popup_height: "650",
        // Performance optimizations
        loading_screen: { backgroundColor: "transparent" },
        overrides: {
            "paneProperties.background": "#0a0a0a",
            "paneProperties.backgroundType": "solid"
        },
        support_host: "https://www.tradingview.com"
    };
    
    return { ...defaultConfig, ...options };
};

// Initialize TradingView Charts with lazy loading
function initTradingViewCharts() {
    // Wait for TradingView library to load
    if (typeof TradingView === 'undefined') {
        setTimeout(initTradingViewCharts, 100);
        return;
    }
    
    isTradingViewLoaded = true;
    
    // ========================================================================
    // MARKET OVERVIEW CHART - Optimized Full TradingView Widget
    // ========================================================================
    const marketChartContainer = document.getElementById('tradingview_market_chart');
    const loadingSkeleton = document.getElementById('chart-loading-skeleton');
    
    if (marketChartContainer) {
        // Check if container is visible (lazy load)
        const container = marketChartContainer.closest('[data-lazy-load]');
        if (container) {
            // Use Intersection Observer for lazy loading
            observeElementForLazyLoad(container, () => {
                loadMarketChart(marketChartContainer, loadingSkeleton);
            });
            
            // Also check if already visible and load immediately
            if (isElementInViewport(container)) {
                loadMarketChart(marketChartContainer, loadingSkeleton);
            }
        } else {
            // Load immediately if no lazy load attribute
            loadMarketChart(marketChartContainer, loadingSkeleton);
        }
    }

    // ========================================================================
    // HERO MINI CHART - Optimized Mini TradingView Widget
    // ========================================================================
    const heroChartContainer = document.getElementById('tradingview_hero_chart');
    
    if (heroChartContainer) {
        try {
            const heroConfig = getOptimizedWidgetConfig('tradingview_hero_chart', {
                width: "100%",
                height: 120,
                interval: "60",
                style: "1",
                toolbar_bg: "transparent",
                hide_top_toolbar: true,
                hide_legend: true,
                hide_volume: true,
                studies: [] // No studies for hero chart for faster load
            });
            
            new TradingView.widget(heroConfig);
            console.log('TradingView hero chart initialized successfully');
        } catch (error) {
            console.error('Error initializing TradingView hero chart:', error);
        }
    }
}

// Load market chart with optimized config
function loadMarketChart(container, loadingSkeleton) {
    try {
        // Hide loading skeleton
        if (loadingSkeleton) {
            loadingSkeleton.style.display = 'none';
        }
        
        // Destroy existing widget if any
        if (tradingViewWidgetInstance) {
            try {
                tradingViewWidgetInstance.remove();
            } catch(e) {
                // Ignore if already removed
            }
        }
        
        const config = getOptimizedWidgetConfig('tradingview_market_chart', {
            studies: [
                "Volume@tv-basicstudies",
                "VWAP@tv-basicstudies"
            ],
            details: false, // Disable details widget
            calendar: false, // Disable calendar widget
            hotlist: false, // Disable hotlist widget
            show_popup_button: false // Disable popup button
        });
        
        tradingViewWidgetInstance = new TradingView.widget(config);
        
        // Hide TradingView copyright after load
        setTimeout(() => {
            hideTradingViewBranding();
        }, 1500);
        
        // Initialize market stats after chart loads
        setTimeout(() => {
            if (typeof initMarketStats === 'function') {
                initMarketStats();
            }
        }, 2000);
        
        console.log('TradingView market chart initialized successfully');
    } catch (error) {
        console.error('Error initializing TradingView market chart:', error);
        if (loadingSkeleton) {
            loadingSkeleton.innerHTML = '<div class="text-center text-red-400">Error loading chart</div>';
        }
    }
}

// Hide TradingView branding
function hideTradingViewBranding() {
    try {
        const container = document.getElementById('tradingview_market_chart');
        if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                try {
                    iframe.onload = function() {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            const copyright = iframeDoc.querySelector('[class*="copyright"], [id*="copyright"]');
                            if (copyright) copyright.style.display = 'none';
                        } catch(e) {
                            // CORS may block access
                        }
                    };
                } catch(e) {
                    // Ignore CORS errors
                }
            }
        }
        
        // Hide any copyright elements outside iframe
        const copyrightElements = document.querySelectorAll('[class*="copyright"], [id*="copyright"]');
        copyrightElements.forEach(el => {
            if (el.textContent && el.textContent.includes('TradingView')) {
                el.style.display = 'none';
            }
        });
    } catch(e) {
        // Ignore errors
    }
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Intersection Observer for lazy loading
function observeElementForLazyLoad(element, callback) {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback();
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '200px' // Start loading 200px before element is visible
        });
        
        observer.observe(element);
        
        // Fallback: Load after 2 seconds if still not visible (for slow scroll)
        setTimeout(() => {
            if (isElementInViewport(element) || element.querySelector('#tradingview_market_chart').children.length === 0) {
                callback();
                observer.unobserve(element);
            }
        }, 2000);
    } else {
        // Fallback: Load immediately if IntersectionObserver not supported
        callback();
    }
}

// Wait for DOM and TradingView to be ready
function startTradingViewInit() {
    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Try to initialize immediately
                initTradingViewCharts();
                // Also retry after a short delay in case TradingView script loads later
                setTimeout(initTradingViewCharts, 500);
                setTimeout(initTradingViewCharts, 1000);
            });
        } else {
            // DOM already ready
            initTradingViewCharts();
            // Retry in case TradingView script loads later
            setTimeout(initTradingViewCharts, 500);
            setTimeout(initTradingViewCharts, 1000);
        }
    };

    init();
}

// Start initialization
startTradingViewInit();

// Handle period buttons for market chart (removed as buttons were removed from HTML)
// If you add period buttons back, uncomment this section
/*
document.addEventListener('DOMContentLoaded', function() {
    const periodButtons = document.querySelectorAll('[data-period]');
    const marketChartContainer = document.getElementById('tradingview_market_chart');
    
    if (periodButtons.length > 0 && marketChartContainer) {
        periodButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                periodButtons.forEach(btn => {
                    btn.classList.remove('active-chart-period', 'bg-gradient-to-r', 'from-purple-500', 'to-blue-500', 'neon-glow-purple');
                    btn.classList.add('glass', 'hover:bg-blue-500/20');
                });
                this.classList.add('active-chart-period', 'bg-gradient-to-r', 'from-purple-500', 'to-blue-500', 'neon-glow-purple');
                this.classList.remove('glass', 'hover:bg-blue-500/20');
                
                // Map period to TradingView interval
                const period = this.dataset.period;
                let interval = 'D';
                
                if (period === '1d') {
                    interval = '60';
                } else if (period === '7d') {
                    interval = '240';
                } else if (period === '30d') {
                    interval = 'D';
                } else if (period === '90d') {
                    interval = 'W';
                }
                
                // Reinitialize chart with new interval
                if (isTradingViewLoaded && typeof TradingView !== 'undefined') {
                    marketChartContainer.innerHTML = '';
                    const config = getOptimizedWidgetConfig('tradingview_market_chart', {
                        interval: interval,
                        studies: [
                            "Volume@tv-basicstudies",
                            "VWAP@tv-basicstudies"
                        ]
                    });
                    tradingViewWidgetInstance = new TradingView.widget(config);
                }
            });
        });
    }
});
*/

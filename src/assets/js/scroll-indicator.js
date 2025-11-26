/**
 * Scroll Progress Indicator
 * Shows scroll progress as a progress bar at the top of the page
 */
(function () {
    'use strict';

    const scrollIndicator = document.getElementById('scroll-indicator');
    const scrollProgress = document.getElementById('scroll-progress');

    if (!scrollIndicator || !scrollProgress) {
        console.warn('Scroll indicator elements not found.');
        return;
    }

    function updateScrollProgress() {
        // Calculate scroll progress
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate scrollable distance
        const scrollableDistance = documentHeight - windowHeight;
        
        // Calculate progress percentage (0 to 100)
        const progress = scrollableDistance > 0 
            ? (scrollTop / scrollableDistance) * 100 
            : 0;
        
        // Clamp progress between 0 and 100
        const clampedProgress = Math.min(100, Math.max(0, progress));
        
        // Update progress bar width
        scrollProgress.style.width = clampedProgress + '%';
    }

    // Throttle function for performance
    let ticking = false;
    function throttledUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Initial update
    updateScrollProgress();

    // Listen to scroll events
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    
    // Listen to resize events (content height might change)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateScrollProgress, 100);
    }, { passive: true });

    // Update when page loads completely (images might change document height)
    window.addEventListener('load', updateScrollProgress);
})();


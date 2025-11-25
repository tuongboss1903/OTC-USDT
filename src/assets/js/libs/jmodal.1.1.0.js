/**
 * jModal - Simple Modal Manager (Compatible with Alpine.js structure)
 * Version: 1.1.0
 * Optimized for INP (Interaction to Next Paint) with element caching
 */

class jModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModals = new Set();
        
        // Cache frequently accessed elements
        this.cachedElements = {
            body: document.body,
            documentElement: document.documentElement,
            header: null // Will be cached on first use
        };
        
        // Calculate scrollbar width once at initialization
        this.scrollbarWidth = this.getScrollbarWidth();
        
        // Setup listeners using requestIdleCallback for better INP
        this.scheduleSetup(() => this.setupGlobalListeners());
    }
    
    /**
     * Schedule non-critical tasks during idle time (INP optimization)
     */
    scheduleSetup(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 2000 });
        } else {
            setTimeout(callback, 1);
        }
    }
    
    /**
     * Get cached header element
     */
    getCachedHeader() {
        if (!this.cachedElements.header) {
            this.cachedElements.header = document.querySelector('header.sticky, header.fixed');
        }
        return this.cachedElements.header;
    }
    
    /**
     * Calculate scrollbar width (only once at init)
     */
    getScrollbarWidth() {
        // Create temporary div to measure scrollbar
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar'; // IE
        this.cachedElements.body.appendChild(outer);
        
        const inner = document.createElement('div');
        outer.appendChild(inner);
        
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        
        outer.parentNode.removeChild(outer);
        
        return scrollbarWidth;
    }

    /**
     * Initialize a modal
     * @param {string} selector - Modal selector (e.g., '#cartModal')
     * @param {object} options - Options
     */
    init(selector, options = {}) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`jModal: Modal "${selector}" not found`);
            return this;
        }

        const modalId = element.id || selector.replace('#', '');
        
        if (!this.modals.has(modalId)) {
            // Cache slide content element for performance
            const slideContent = element.querySelector(
                '.jmodal-slide-right, .jmodal-slide-left, .jmodal-slide-top, .jmodal-slide-bottom'
            );
            
            // Cache close buttons
            const closeButtons = Array.from(element.querySelectorAll('[data-jmodal-close]'));
            
            this.modals.set(modalId, {
                id: modalId,
                element,
                slideContent, // Cached
                closeButtons, // Cached
                options: {
                    closeOnBackdrop: true,
                    closeOnEscape: true,
                    preventScroll: true,
                    onOpen: null,
                    onClose: null,
                    ...options
                },
                isOpen: false
            });

            this.setupModal(modalId);
        }

        return this;
    }

    /**
     * Setup modal listeners (with event delegation for better performance)
     */
    setupModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        const { element, closeButtons, options } = modal;

        // Setup backdrop click (click on overlay but not on content)
        if (options.closeOnBackdrop) {
            element.addEventListener('click', (e) => {
                // Close if clicked directly on jmodal (not on children)
                if (e.target === element) {
                    this.close(modalId);
                }
            }, { passive: false });
        }

        // Setup close buttons using cached array
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close(modalId), { passive: true });
        });

        // Setup trigger buttons outside modal (data-jmodal-target)
        const triggers = document.querySelectorAll(`[data-jmodal-target="${modalId}"]`);
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => this.open(modalId), { passive: true });
        });
    }

    /**
     * Open modal (INP optimized - use RAF for visual updates)
     */
    open(modalId, focusSelector = null) {
        const modal = this.modals.get(modalId);
        if (!modal || modal.isOpen) return;

        const { element, slideContent, options } = modal;

        // Call onOpen callback (non-blocking)
        if (options.onOpen) {
            this.scheduleSetup(() => options.onOpen(element));
        }

        // Update state immediately
        modal.isOpen = true;
        this.activeModals.add(modalId);

        // Prevent body scroll (critical - do immediately)
        if (options.preventScroll) {
            this.updateBodyScroll();
        }

        // Use double RAF for visual updates (better INP, no forced reflow)
        requestAnimationFrame(() => {
            // Remove hidden class first
            element.classList.remove('hidden');

            // Wait for next frame to add active class (browser will handle reflow naturally)
            requestAnimationFrame(() => {
                // Add active class using cached slideContent
                if (slideContent) {
                    slideContent.classList.add('jmodal-active');
                }

                // Focus on element if specified (after animation starts)
                if (focusSelector) {
                    setTimeout(() => {
                        const focusElement = element.querySelector(focusSelector);
                        if (focusElement) {
                            focusElement.focus();
                        }
                    }, 300);
                }
            });
        });

        return this;
    }

    /**
     * Close modal (INP optimized - use RAF for visual updates)
     */
    close(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal || !modal.isOpen) return;

        const { element, slideContent, options } = modal;

        // Call onClose callback (non-blocking)
        if (options.onClose) {
            this.scheduleSetup(() => options.onClose(element));
        }

        // Update state immediately
        modal.isOpen = false;
        this.activeModals.delete(modalId);

        // Use RAF for visual updates (better INP)
        requestAnimationFrame(() => {
            // Remove active class using cached slideContent
            if (slideContent) {
                slideContent.classList.remove('jmodal-active');
            }

            element.classList.add('hidden');
            
            // Restore body scroll after modal is completely hidden
            // This ensures overflow-x:hidden is removed AFTER slide animation completes
            if (options.preventScroll) {
                this.updateBodyScroll();
            }
        });

        return this;
    }

    /**
     * Toggle modal
     */
    toggle(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        if (modal.isOpen) {
            this.close(modalId);
        } else {
            this.open(modalId);
        }

        return this;
    }

    /**
     * Close all modals
     */
    closeAll() {
        this.activeModals.forEach(modalId => {
            this.close(modalId);
        });
        return this;
    }

    /**
     * Check if modal is open
     */
    isOpen(modalId) {
        const modal = this.modals.get(modalId);
        return modal ? modal.isOpen : false;
    }

    /**
     * Update body scroll based on active modals
     * Prevent CLS by adding padding to compensate for scrollbar
     * Uses cached elements for better performance
     */
    updateBodyScroll() {
        const { body, documentElement } = this.cachedElements;
        
        if (this.activeModals.size > 0) {
            // Prevent vertical scroll
            body.style.overflow = 'hidden';
            
            // Add padding to prevent content shift (CLS fix)
            // Use pre-calculated scrollbarWidth from constructor
            if (this.scrollbarWidth > 0) {
                body.style.paddingRight = `${this.scrollbarWidth}px`;
            }
            
            // Prevent horizontal scroll during modal slide animation
            body.style.overflowX = 'hidden';
        } else {
            // Restore body scroll
            body.style.overflow = '';
            body.style.paddingRight = '';
            body.style.overflowX = '';
        }
    }

    /**
     * Handle ESC key
     */
    handleEscape(e) {
        if (e.key === 'Escape' && this.activeModals.size > 0) {
            // Close the last opened modal
            const lastModalId = Array.from(this.activeModals).pop();
            const modal = this.modals.get(lastModalId);
            
            if (modal && modal.options.closeOnEscape) {
                this.close(lastModalId);
            }
        }
    }

    /**
     * Setup global event listeners (INP optimized with passive listeners)
     */
    setupGlobalListeners() {
        // ESC key listener (passive for better performance)
        document.addEventListener('keydown', (e) => this.handleEscape(e), { passive: true });
    }

    /**
     * Destroy modal instance
     */
    destroy(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        if (modal.isOpen) {
            this.close(modalId);
        }

        this.modals.delete(modalId);
        return this;
    }

    /**
     * Destroy all modals
     */
    destroyAll() {
        this.closeAll();
        this.modals.clear();
        
        // Clear cached elements
        this.cachedElements.header = null;
        
        return this;
    }
}

// Create global instance
window.jModal = new jModalManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = jModalManager;
}

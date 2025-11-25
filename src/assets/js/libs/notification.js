/**
 * FastNotice - Thư viện thông báo nhanh và đẹp
 * Lightweight notification library with beautiful design
 */

(function(global) {
    'use strict';

    // CSS Styles
    const styles = `
        .fast-notice-container {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
        }
        
        .fast-notice-container.fast-notice-top-left {
            top: 20px;
            left: 20px;
        }
        
        .fast-notice-container.fast-notice-top-center {
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .fast-notice-container.fast-notice-top-center .fast-notice {
            transform: translateY(-100%);
        }
        
        .fast-notice-container.fast-notice-top-center .fast-notice.show {
            transform: translateY(0);
        }
        
        .fast-notice-container.fast-notice-bottom-center .fast-notice.show {
            transform: translateY(0);
        }
        
        .fast-notice-container.fast-notice-top-right {
            top: 20px;
            right: 20px;
        }
        
        .fast-notice-container.fast-notice-bottom-left {
            bottom: 20px;
            left: 20px;
        }
        
        .fast-notice-container.fast-notice-bottom-center {
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .fast-notice-container.fast-notice-bottom-center .fast-notice {
            transform: translateY(100%);
        }
        
        .fast-notice-container.fast-notice-bottom-center .fast-notice.show {
            transform: translateY(0);
        }
        
        .fast-notice-container.fast-notice-bottom-right {
            bottom: 20px;
            right: 20px;
        }
        
        .fast-notice-container.fast-notice-center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .fast-notice {
            display: flex;
            align-items: flex-start;
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            min-width: 320px;
            pointer-events: auto;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        /* Animation for different positions */
        .fast-notice-container.fast-notice-top-left .fast-notice {
            transform: translateX(-100%);
        }
        
        .fast-notice-container.fast-notice-top-right .fast-notice {
            transform: translateX(100%);
        }
        
        .fast-notice-container.fast-notice-bottom-left .fast-notice {
            transform: translateX(-100%);
        }
        
        .fast-notice-container.fast-notice-bottom-right .fast-notice {
            transform: translateX(100%);
        }
        
        .fast-notice.show {
            opacity: 1;
        }
        
        .fast-notice-container.fast-notice-top-left .fast-notice.show,
        .fast-notice-container.fast-notice-top-right .fast-notice.show,
        .fast-notice-container.fast-notice-bottom-left .fast-notice.show,
        .fast-notice-container.fast-notice-bottom-right .fast-notice.show {
            transform: translate(0, 0);
        }
        
        .fast-notice.hide {
            opacity: 0;
        }
        
        .fast-notice-container.fast-notice-top-left .fast-notice.hide {
            transform: translateX(-100%);
        }
        
        .fast-notice-container.fast-notice-top-center .fast-notice.hide {
            transform: translateY(-100%);
        }
        
        .fast-notice-container.fast-notice-top-right .fast-notice.hide {
            transform: translateX(100%);
        }
        
        .fast-notice-container.fast-notice-bottom-left .fast-notice.hide {
            transform: translateX(-100%);
        }
        
        .fast-notice-container.fast-notice-bottom-center .fast-notice.hide {
            transform: translateY(100%);
        }
        
        .fast-notice-container.fast-notice-bottom-right .fast-notice.hide {
            transform: translateX(100%);
        }
        
        .fast-notice-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-weight: bold;
            font-size: 12px;
            color: white;
        }
        
        .fast-notice-content {
            flex: 1;
            min-width: 0;
        }
        
        .fast-notice-title {
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 4px 0;
            line-height: 1.4;
        }
        
        .fast-notice-message {
            font-size: 13px;
            margin: 0;
            line-height: 1.4;
            opacity: 0.9;
        }
        
        .fast-notice-close {
            flex-shrink: 0;
            background: none;
            border: none;
            padding: 4px;
            margin-left: 8px;
            cursor: pointer;
            border-radius: 4px;
            opacity: 0.7;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
        }
        
        .fast-notice-close:hover {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .fast-notice-close::before {
            content: '×';
            font-size: 16px;
            font-weight: bold;
        }
        
        /* Type Styles */
        .fast-notice-info {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 4px solid #2196f3;
        }
        
        .fast-notice-info .fast-notice-icon {
            background-color: #2196f3;
        }
        
        .fast-notice-info .fast-notice-title {
            color: #1976d2;
        }
        
        .fast-notice-info .fast-notice-message {
            color: #1565c0;
        }
        
        .fast-notice-success {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            border-left: 4px solid #4caf50;
        }
        
        .fast-notice-success .fast-notice-icon {
            background-color: #4caf50;
        }
        
        .fast-notice-success .fast-notice-title {
            color: #388e3c;
        }
        
        .fast-notice-success .fast-notice-message {
            color: #2e7d32;
        }
        
        .fast-notice-warning {
            background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
            border-left: 4px solid #ff9800;
        }
        
        .fast-notice-warning .fast-notice-icon {
            background-color: #ff9800;
        }
        
        .fast-notice-warning .fast-notice-title {
            color: #f57c00;
        }
        
        .fast-notice-warning .fast-notice-message {
            color: #ef6c00;
        }
        
        .fast-notice-error {
            background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
            border-left: 4px solid #f44336;
        }
        
        .fast-notice-error .fast-notice-icon {
            background-color: #f44336;
        }
        
        .fast-notice-error .fast-notice-title {
            color: #d32f2f;
        }
        
        .fast-notice-error .fast-notice-message {
            color: #c62828;
        }
    `;

    // Inject CSS
    function injectStyles() {
        if (document.getElementById('fast-notice-styles')) return;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'fast-notice-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // FastNotice Class
    function FastNotice(options = {}) {
        this.config = {
            position: options.position || 'bottom-right',
            duration: options.duration || 3000,
            maxNotifications: options.maxNotifications || 3
        };
        
        this.notifications = [];
        this.container = null;
        this.init();
    }

    FastNotice.prototype.init = function() {
        injectStyles();
        this.createContainer();
    };

    FastNotice.prototype.createContainer = function() {
        this.container = document.createElement('div');
        this.container.className = `fast-notice-container fast-notice-${this.config.position}`;
        
        // Đợi DOM sẵn sàng
        if (document.body) {
            document.body.appendChild(this.container);
        } else {
            // Nếu body chưa sẵn sàng, đợi DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body && !this.container.parentNode) {
                    document.body.appendChild(this.container);
                }
            });
        }
    };

    FastNotice.prototype.show = function(message, type = 'info', options = {}) {
        // Check max notifications
        if (this.notifications.length >= this.config.maxNotifications) {
            this.removeOldest();
        }

        // Handle temporary position change
        let originalPosition = null;
        if (options.position && options.position !== this.config.position) {
            originalPosition = this.config.position;
            this.setPosition(options.position);
        }

        const notification = this.createNotification(message, type, options);
        this.notifications.push(notification);
        this.container.appendChild(notification);

        // Show animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        const duration = options.duration !== undefined ? options.duration : this.config.duration;
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
                // Restore original position if it was temporarily changed
                if (originalPosition) {
                    this.setPosition(originalPosition);
                }
            }, duration);
        }

        return notification;
    };

    // Hàm để thay đổi vị trí động
    FastNotice.prototype.setPosition = function(position) {
        if (this.container) {
            // Remove all position classes
            this.container.classList.remove('fast-notice-top-left', 'fast-notice-top-center', 'fast-notice-top-right', 
                                         'fast-notice-bottom-left', 'fast-notice-bottom-center', 'fast-notice-bottom-right');
            // Add new position class
            this.container.classList.add(`fast-notice-${position}`);
            // Update config
            this.config.position = position;
        }
    };

    // Hàm để thay đổi duration mặc định
    FastNotice.prototype.setDuration = function(duration) {
        this.config.duration = duration;
    };

    // Hàm để thay đổi max notifications
    FastNotice.prototype.setMaxNotifications = function(max) {
        this.config.maxNotifications = max;
    };

    FastNotice.prototype.createNotification = function(message, type, options) {
        const notification = document.createElement('div');
        notification.className = `fast-notice fast-notice-${type}`;
        
        const icon = this.getIcon(type);
        const title = options.title || this.getDefaultTitle(type);
        
        notification.innerHTML = `
            <div class="fast-notice-icon">${icon}</div>
            <div class="fast-notice-content">
                <div class="fast-notice-title">${title}</div>
                <div class="fast-notice-message">${message}</div>
            </div>
            <button class="fast-notice-close" onclick="fastNotice.remove(this.closest('.fast-notice'))"></button>
        `;

        return notification;
    };

    FastNotice.prototype.getIcon = function(type) {
        const icons = {
            'info': 'i',
            'success': '✓',
            'warning': '!',
            'error': '×'
        };
        return icons[type] || 'i';
    };

    FastNotice.prototype.getDefaultTitle = function(type) {
        const titles = {
            'info': 'Information',
            'success': 'Success!',
            'warning': 'Warning',
            'error': 'Error!'
        };
        return titles[type] || 'Information';
    };

    FastNotice.prototype.remove = function(notification) {
        if (!notification || !notification.parentNode) return;

        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };

    FastNotice.prototype.removeOldest = function() {
        if (this.notifications.length > 0) {
            this.remove(this.notifications[0]);
        }
    };

    FastNotice.prototype.clear = function() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    };

    // Static methods
    FastNotice.show = function(message, type, options) {
        if (!global.fastNotice) {
            global.fastNotice = new FastNotice();
        }
        return global.fastNotice.show(message, type, options);
    };

    FastNotice.success = function(message, options) {
        return FastNotice.show(message, 'success', options);
    };

    FastNotice.error = function(message, options) {
        return FastNotice.show(message, 'error', options);
    };

    FastNotice.warning = function(message, options) {
        return FastNotice.show(message, 'warning', options);
    };

    FastNotice.info = function(message, options) {
        return FastNotice.show(message, 'info', options);
    };

    FastNotice.clear = function() {
        if (global.fastNotice) {
            global.fastNotice.clear();
        }
    };

    // Auto initialize
    // Auto-initialize
    function initializeFastNotice() {
        if (!global.fastNotice) {
            global.fastNotice = new FastNotice();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFastNotice);
    } else {
        initializeFastNotice();
    }

    // Export
    global.FastNotice = FastNotice;

})(typeof window !== 'undefined' ? window : this);
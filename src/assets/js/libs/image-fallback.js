/**
 * Image Fallback Utility
 * Tự động thay thế ảnh lỗi bằng ảnh dự phòng
 */

// URL ảnh dự phòng mặc định
const DEFAULT_FALLBACK_IMAGE = 'https://panel.dongnai.net/themes/dongnai/Backend/assets/favicon/apple-icon-180x180.png';

/**
 * Khởi tạo image fallback system
 */
function initImageFallback() {
    // Global error handler cho tất cả ảnh
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            handleImageError(e.target);
        }
    }, true);

    // Xử lý các ảnh đã có sẵn trên trang
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Kiểm tra nếu ảnh đã lỗi
            if (!img.complete || img.naturalHeight === 0) {
                handleImageError(img);
            }
        });
    });
}

/**
 * Xử lý khi ảnh bị lỗi
 * @param {HTMLImageElement} img - Element ảnh bị lỗi
 * @param {string} fallbackUrl - URL ảnh thay thế (optional)
 */
function handleImageError(img, fallbackUrl = null) {
    // Tránh loop vô tận nếu ảnh fallback cũng lỗi
    if (img.dataset.fallbackAttempted === 'true') {
        // Nếu đã thử fallback mà vẫn lỗi, ẩn ảnh và hiển thị background
        img.style.opacity = '0';
        img.classList.add('error');
        return;
    }

    // Đánh dấu đã thử fallback
    img.dataset.fallbackAttempted = 'true';
    
    // URL ảnh thay thế
    const newSrc = fallbackUrl || img.dataset.fallback || DEFAULT_FALLBACK_IMAGE;
    
    // Thay đổi src
    img.src = newSrc;
    
    // Thêm class error để hiển thị background fallback
    img.classList.add('error');
    
    // Log lỗi để debug
    //console.log('Image failed to load, using fallback:', img.dataset.originalSrc || img.src, '→', newSrc);
}

/**
 * Đơn giản hóa - không cần placeholder phức tạp
 * Chỉ cần ẩn ảnh và để CSS xử lý background
 */

/**
 * Utility function để set ảnh với fallback
 * @param {HTMLImageElement} img - Element ảnh
 * @param {string} src - URL ảnh chính
 * @param {string} fallback - URL ảnh dự phòng (optional)
 */
function setImageWithFallback(img, src, fallback = null) {
    // Lưu URL gốc để debug
    img.dataset.originalSrc = src;
    
    // Set fallback URL
    if (fallback) {
        img.dataset.fallback = fallback;
    }
    
    // Reset fallback attempt và classes
    img.dataset.fallbackAttempted = 'false';
    img.classList.remove('error', 'loading');
    img.style.opacity = '';
    
    // Set src
    img.src = src;
}

/**
 * Utility function để tạo ảnh với fallback
 * @param {string} src - URL ảnh chính
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {string} fallback - URL ảnh dự phòng (optional)
 * @returns {HTMLImageElement}
 */
function createImageWithFallback(src, alt = '', className = '', fallback = null) {
    const img = document.createElement('img');
    img.alt = alt;
    img.className = className;
    
    setImageWithFallback(img, src, fallback);
    
    return img;
}

// Global functions
window.ImageFallback = {
    init: initImageFallback,
    setImage: setImageWithFallback,
    createImage: createImageWithFallback,
    handleError: handleImageError
};

// Auto init khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageFallback);
} else {
    initImageFallback();
}
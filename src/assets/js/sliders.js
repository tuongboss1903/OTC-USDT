document.addEventListener('DOMContentLoaded', function() {
    // Initialize BlazeSlider for hot products
    const hotProductsSlider = document.querySelector('.hot-products-slider');
    if (hotProductsSlider) {
        new BlazeSlider(hotProductsSlider, {
            all: {
                enableAutoplay: true,
                autoplayInterval: 50000,
                transitionDuration: 500,
                slidesToShow: 2,
            },
            '(max-width: 640px)': {
                slidesToShow: 1,
            }
        });
    }

    // Initialize Testimonials Slider
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (testimonialsSlider) {
        new BlazeSlider(testimonialsSlider, {
            all: {
                enableAutoplay: true,
                autoplayInterval: 3000,
                slidesToShow: 1,
            },
            '(min-width: 1000px)': {
                slidesToShow: 2,
            }
        });
    }

    // Initialize Flash-sale Slider (2 rows layout like Hero)
    const flashSliderEl = document.querySelector('.flash-sale-slider');
    if (flashSliderEl) {
        var flashSlider = new BlazeSlider(flashSliderEl, {
            all: {
                enableAutoplay: true,
                autoplayInterval: 1000,
                transitionDuration: 500,
                slidesToShow: 1.2,
                autoPlay: true,
            },
            '(min-width: 768px) and (max-width: 1024px)': {
                slidesToShow: 2,
            },
            '(min-width: 1024px)': {
                slidesToShow: 2.8,
            },
            '(min-width: 1240px)': {
                slidesToShow: 3.5,
            }
        });
        
        flashSliderEl.addEventListener('mouseenter', () => {
            flashSlider.stopAutoplay();
        });

        flashSliderEl.addEventListener('mouseleave', () => {
            flashSlider.refresh();
        });
    }

    // Countdown Flash-sale (đếm ngược tới 23:59 hôm nay)
    const hEl = document.getElementById('fs-h');
    const mEl = document.getElementById('fs-m');
    const sEl = document.getElementById('fs-s');
    if (hEl && mEl && sEl) {
        function nextMidnight() {
            const now = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            if (end <= now) end.setDate(end.getDate() + 1);
            return end;
        }
        let endTime = nextMidnight();
        function pad(n){return n.toString().padStart(2,'0');}
        function tick() {
            const now = new Date();
            let diff = Math.max(0, endTime - now);
            const hours = Math.floor(diff / 3600000);
            diff -= hours * 3600000;
            const minutes = Math.floor(diff / 60000);
            diff -= minutes * 60000;
            const seconds = Math.floor(diff / 1000);
            hEl.textContent = pad(hours);
            mEl.textContent = pad(minutes);
            sEl.textContent = pad(seconds);
            if (hours === 0 && minutes === 0 && seconds === 0) {
                endTime = nextMidnight();
            }
        }
        tick();
        setInterval(tick, 1000);
    }
});
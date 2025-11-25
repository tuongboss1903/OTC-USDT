// Order Create Component
function orderCreateComponent() {
    return {
        orderType: 'buy', // 'buy' or 'sell'
        partnerId: null,
        orderCreated: false,
        isSubmitting: false,
        
        orderForm: {
            amount: '',
            paymentMethod: '',
            message: ''
        },
        
        partnerInfo: {
            name: 'CryptoKing',
            avatar: 'https://i.pravatar.cc/150?img=12',
            verified: true,
            premium: true,
            online: true,
            rating: 5.0,
            reviews: 1234,
            price: '25,480',
            limit: '100K - 1.2M'
        },
        
        contactInfo: {
            name: '',
            email: '',
            phone: '',
            telegram: ''
        },
        
        init() {
            // Get order type and partner ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            this.orderType = urlParams.get('type') || 'buy';
            this.partnerId = urlParams.get('user');
            
            // Load partner info (in real app, fetch from API)
            this.loadPartnerInfo();
            
            // Check if user is logged in and email verified
            this.checkAuth();
        },
        
        checkAuth() {
            if (!window.headerComponent) {
                setTimeout(() => this.checkAuth(), 100);
                return;
            }
            
            const header = window.headerComponent();
            if (!header.user) {
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }));
                window.location.href = '/p2p-list.html';
                return;
            }
            
            // Check email verification (in real app, check from API)
            // if (!header.user.email_verified) {
            //     if (window.fastNotice) {
            //         window.fastNotice.show('Vui lòng xác thực email để tạo lệnh', 'warning');
            //     }
            //     window.location.href = '/profile.html';
            // }
        },
        
        loadPartnerInfo() {
            // In real app, fetch from API
            // For now, use sample data
            if (this.orderType === 'buy') {
                this.partnerInfo = {
                    name: 'CryptoKing',
                    avatar: 'https://i.pravatar.cc/150?img=12',
                    verified: true,
                    premium: true,
                    online: true,
                    rating: 5.0,
                    reviews: 1234,
                    price: '25,480',
                    limit: '100K - 1.2M'
                };
            } else {
                this.partnerInfo = {
                    name: 'ProBuyer001',
                    avatar: 'https://i.pravatar.cc/150?img=5',
                    verified: true,
                    premium: true,
                    online: true,
                    rating: 4.9,
                    reviews: 567,
                    price: '25,450',
                    limit: '100K - 3M'
                };
            }
        },
        
        calculateVND() {
            if (!this.orderForm.amount) return '0';
            const price = parseFloat(this.partnerInfo.price.replace(/,/g, ''));
            const amount = parseFloat(this.orderForm.amount);
            const total = price * amount;
            return total.toLocaleString('vi-VN');
        },
        
        async submitOrder() {
            this.isSubmitting = true;
            
            try {
                // In real app, call API to create order
                // const response = await window.xhr({
                //     method: 'POST',
                //     url: API_URL + 'orders/create/',
                //     data: {
                //         type: this.orderType,
                //         partner_id: this.partnerId,
                //         amount: this.orderForm.amount,
                //         payment_method: this.orderForm.paymentMethod,
                //         message: this.orderForm.message
                //     }
                // });
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate contact info response
                this.contactInfo = {
                    name: this.partnerInfo.name,
                    email: 'partner@example.com',
                    phone: '+84 123 456 789',
                    telegram: '@partner_telegram'
                };
                
                this.orderCreated = true;
                
                if (window.fastNotice) {
                    window.fastNotice.show('Lệnh đã được tạo thành công!', 'success');
                }
                
                // Scroll to contact info
                this.$nextTick(() => {
                    const contactSection = document.querySelector('[x-show="orderCreated"]');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
                
            } catch (error) {
                console.error('Error creating order:', error);
                if (window.fastNotice) {
                    window.fastNotice.show('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
                }
            } finally {
                this.isSubmitting = false;
            }
        },
        
        copyContactInfo() {
            const text = `Tên: ${this.contactInfo.name}\nEmail: ${this.contactInfo.email}\nSĐT: ${this.contactInfo.phone}${this.contactInfo.telegram ? '\nTelegram: ' + this.contactInfo.telegram : ''}`;
            
            navigator.clipboard.writeText(text).then(() => {
                if (window.fastNotice) {
                    window.fastNotice.show('Đã sao chép thông tin liên hệ', 'success');
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    };
}

// Export for use in HTML
window.orderCreateComponent = orderCreateComponent;


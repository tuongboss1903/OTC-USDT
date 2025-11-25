// P2P List Component
function p2pListComponent() {
    return {
        activeTab: 'seller',
        showAdvanced: false,
        currentPage: 1,
        itemsPerPage: 10,
        
        filters: {
            search: '',
            priceRange: '',
            rating: '',
            deposit: '',
            volume: '',
            verified: '',
            online: '',
            sort: 'rating'
        },
        
        sellers: [
            {
                id: 1,
                name: 'CryptoKing',
                avatar: 'https://i.pravatar.cc/150?img=12',
                verified: true,
                premium: true,
                online: true,
                deposit: '$50,000',
                transactions: '15,234',
                successRate: 99.9,
                rating: 5.0,
                reviews: 1234,
                price: '25,480',
                limit: '100K - 1.2M'
            },
            {
                id: 2,
                name: 'WhaleQueen',
                avatar: 'https://i.pravatar.cc/150?img=47',
                verified: true,
                premium: false,
                online: true,
                deposit: '$30,000',
                transactions: '12,856',
                successRate: 99.8,
                rating: 4.9,
                reviews: 856,
                price: '25,475',
                limit: '50K - 2M'
            },
            {
                id: 3,
                name: 'MegaTrader',
                avatar: 'https://i.pravatar.cc/150?img=33',
                verified: true,
                premium: true,
                online: false,
                deposit: '$25,000',
                transactions: '11,245',
                successRate: 99.7,
                rating: 4.8,
                reviews: 723,
                price: '25,470',
                limit: '200K - 5M'
            },
            {
                id: 4,
                name: 'ProTrader001',
                avatar: 'https://i.pravatar.cc/150?img=5',
                verified: true,
                premium: false,
                online: true,
                deposit: '$20,000',
                transactions: '10,234',
                successRate: 99.6,
                rating: 4.9,
                reviews: 567,
                price: '25,465',
                limit: '100K - 3M'
            },
            {
                id: 5,
                name: 'CryptoMaster',
                avatar: 'https://i.pravatar.cc/150?img=8',
                verified: true,
                premium: false,
                online: true,
                deposit: '$15,000',
                transactions: '9,856',
                successRate: 99.5,
                rating: 4.8,
                reviews: 432,
                price: '25,460',
                limit: '50K - 2M'
            }
        ],
        
        buyers: [
            {
                id: 1,
                name: 'ProBuyer001',
                avatar: 'https://i.pravatar.cc/150?img=5',
                verified: true,
                premium: true,
                online: true,
                totalVolume: '$2.5M',
                transactions: '8,234',
                completionRate: 98.5,
                rating: 4.9,
                reviews: 567,
                price: '25,450',
                limit: '100K - 3M'
            },
            {
                id: 2,
                name: 'CryptoBuyer',
                avatar: 'https://i.pravatar.cc/150?img=8',
                verified: true,
                premium: false,
                online: true,
                totalVolume: '$1.8M',
                transactions: '6,521',
                completionRate: 97.8,
                rating: 4.7,
                reviews: 432,
                price: '25,440',
                limit: '50K - 2M'
            },
            {
                id: 3,
                name: 'WhaleBuyer',
                avatar: 'https://i.pravatar.cc/150?img=15',
                verified: true,
                premium: true,
                online: false,
                totalVolume: '$5.2M',
                transactions: '12,456',
                completionRate: 99.2,
                rating: 5.0,
                reviews: 892,
                price: '25,460',
                limit: '500K - 10M'
            },
            {
                id: 4,
                name: 'FastBuyer',
                avatar: 'https://i.pravatar.cc/150?img=20',
                verified: true,
                premium: false,
                online: true,
                totalVolume: '$1.2M',
                transactions: '5,234',
                completionRate: 96.5,
                rating: 4.6,
                reviews: 321,
                price: '25,435',
                limit: '100K - 1.5M'
            },
            {
                id: 5,
                name: 'TrustBuyer',
                avatar: 'https://i.pravatar.cc/150?img=25',
                verified: true,
                premium: false,
                online: true,
                totalVolume: '$3.1M',
                transactions: '9,123',
                completionRate: 98.9,
                rating: 4.8,
                reviews: 654,
                price: '25,455',
                limit: '200K - 5M'
            }
        ],
        
        get filteredSellers() {
            let result = [...this.sellers];
            
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                result = result.filter(s => 
                    s.name.toLowerCase().includes(search) || 
                    s.price.includes(search)
                );
            }
            
            if (this.filters.rating) {
                const minRating = parseFloat(this.filters.rating);
                result = result.filter(s => s.rating >= minRating);
            }
            
            if (this.filters.verified === 'verified') {
                result = result.filter(s => s.verified);
            } else if (this.filters.verified === 'premium') {
                result = result.filter(s => s.premium);
            }
            
            if (this.filters.online === 'online') {
                result = result.filter(s => s.online);
            } else if (this.filters.online === 'offline') {
                result = result.filter(s => !s.online);
            }
            
            if (this.filters.sort === 'price_asc') {
                result.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
            } else if (this.filters.sort === 'price_desc') {
                result.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
            } else if (this.filters.sort === 'rating') {
                result.sort((a, b) => b.rating - a.rating);
            }
            
            return result;
        },
        
        get filteredBuyers() {
            let result = [...this.buyers];
            
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                result = result.filter(b => 
                    b.name.toLowerCase().includes(search) || 
                    b.price.includes(search)
                );
            }
            
            if (this.filters.rating) {
                const minRating = parseFloat(this.filters.rating);
                result = result.filter(b => b.rating >= minRating);
            }
            
            if (this.filters.verified === 'verified') {
                result = result.filter(b => b.verified);
            } else if (this.filters.verified === 'premium') {
                result = result.filter(b => b.premium);
            }
            
            if (this.filters.online === 'online') {
                result = result.filter(b => b.online);
            } else if (this.filters.online === 'offline') {
                result = result.filter(b => !b.online);
            }
            
            if (this.filters.sort === 'price_asc') {
                result.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
            } else if (this.filters.sort === 'price_desc') {
                result.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
            } else if (this.filters.sort === 'rating') {
                result.sort((a, b) => b.rating - a.rating);
            }
            
            return result;
        },
        
        get totalItems() {
            return this.activeTab === 'seller' ? this.filteredSellers.length : this.filteredBuyers.length;
        },
        
        get totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
        },
        
        get paginatedSellers() {
            if (this.activeTab !== 'seller') return [];
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredSellers.slice(start, end);
        },
        
        get paginatedBuyers() {
            if (this.activeTab !== 'buyer') return [];
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredBuyers.slice(start, end);
        },
        
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        
        goToPage(page) {
            if (page !== '...') {
                this.currentPage = page;
            }
        },
        
        getVisiblePages() {
            const total = this.totalPages;
            const current = this.currentPage;
            const pages = [];
            
            if (total <= 7) {
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                if (current <= 3) {
                    for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(total);
                } else if (current >= total - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = total - 4; i <= total; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = current - 1; i <= current + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(total);
                }
            }
            
            return pages;
        },
        
        resetFilters() {
            this.filters = {
                search: '',
                priceRange: '',
                rating: '',
                deposit: '',
                volume: '',
                verified: '',
                online: '',
                sort: 'rating'
            };
            this.currentPage = 1;
        },
        
        createOrder(type, userId) {
            // Check if user is logged in and email verified
            if (!window.headerComponent || !window.headerComponent().user) {
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }));
                if (window.fastNotice) {
                    window.fastNotice.show('Vui lòng đăng nhập để tạo lệnh', 'warning');
                }
                return;
            }
            
            // Redirect to order creation page
            window.location.href = `/order/create?type=${type}&user=${userId}`;
        },
        
        init() {
            // Watch for tab changes to reset page
            this.$watch('activeTab', () => {
                this.currentPage = 1;
            });
            
            // Watch for filter changes to reset page
            this.$watch('filters', () => {
                this.currentPage = 1;
            }, { deep: true });
            
            // Initialize Lucide icons after DOM update
            this.$nextTick(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }
    };
}

// Export for use in HTML
window.p2pListComponent = p2pListComponent;


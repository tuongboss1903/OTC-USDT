// Header Alpine.js Component with jModal integration

// ===========================================
// USER CACHE CONFIGURATION
// ===========================================
const USER_CACHE_DURATION = 10 * 60 * 1000; // 10 phút (milliseconds)
const USER_CACHE_KEY = 'user_cache';
const USER_CACHE_AT = 'user_cache_at';

// ===========================================
// GLOBAL NOTIFICATION FUNCTION
// ===========================================
function sendNotice(message, type = 'info', duration = null, position = null) {
    if (window.fastNotice) {
        const options = {};
        if (duration !== null) options.duration = duration;
        if (position !== null) options.position = position;
        window.fastNotice.show(message, type, options);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ===========================================
// GLOBAL USER CACHE FUNCTIONS
// ===========================================
function refreshUserData() {
    window.dispatchEvent(new CustomEvent('refresh-user-data'));
}

function clearUserCache() {
    try {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(USER_CACHE_AT);
        console.log('User cache cleared globally');
    } catch (error) {
        console.warn('Failed to clear user cache globally:', error);
    }
}

// ===========================================
// XHR UTILITY - Tương tự jQuery AJAX
// ===========================================
window.xhr = function(options) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const method = (options.method || 'GET').toUpperCase();
        const url = options.url;
        const data = options.data || null;
        const headers = options.headers || {};
        const timeout = options.timeout || 30000;

        xhr.open(method, url, true);
        xhr.timeout = timeout;

        const isCrossOrigin = !url.startsWith('/') && !url.startsWith(window.location.origin);
        xhr.withCredentials = options.withCredentials !== undefined ? options.withCredentials : !isCrossOrigin;

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json');
        
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        xhr.onload = function() {
            const response = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders(),
                data: null
            };

            try {
                response.data = JSON.parse(xhr.responseText);
            } catch (e) {
                response.data = xhr.responseText;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(response);
            } else {
                reject(response);
            }
        };

        xhr.onerror = function() {
            const isCorsError = xhr.status === 0 && xhr.statusText === '';
            reject({
                status: 0,
                statusText: isCorsError ? 'CORS Error' : 'Network Error',
                data: { 
                    message: isCorsError 
                        ? 'Lỗi CORS: Không thể kết nối tới server do lỗi CORS, hãy báo cho ADMIN' 
                        : 'Lỗi kết nối mạng, hãy thử lại',
                    isCorsError: isCorsError
                }
            });
        };

        xhr.ontimeout = function() {
            reject({
                status: 0,
                statusText: 'Timeout',
                data: { message: 'Yêu cầu quá thời gian chờ' }
            });
        };

        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                xhr.send(data);
            } else if (typeof data === 'string') {
                xhr.send(data);
            } else if (typeof data === 'object') {
                const contentType = headers['Content-Type'] || headers['content-type'] || '';
                
                if (contentType.includes('application/x-www-form-urlencoded')) {
                    const params = new URLSearchParams();
                    Object.keys(data).forEach(key => {
                        params.append(key, data[key]);
                    });
                    xhr.send(params.toString());
                } else {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify(data));
                }
            } else {
                xhr.send(data);
            }
        } else {
            xhr.send();
        }
    });
};

// ===========================================
// HEADER COMPONENT - Alpine.js with jModal
// ===========================================
function headerComponent() {
    return {
        user: null,
        authTab: 'login',
        loginForm: {
            email: '',
            password: '',
            remember: false
        },
        registerForm: {
            fullname: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            agree: false
        },
        isLoading: false,
        errors: {},
        // Search functionality
        searchQuery: '',
        searchResults: [],
        isSearching: false,
        currentLanguage: 'vi',

        init() {
            console.log('Header component initialized.');
            
            // Initialize jModal for all modals
            this.initializeModals();
            
            // Initialize auth
            this.initializeAuth();
            
            // Initialize language from localStorage
            const savedLang = localStorage.getItem('app_language') || 'vi';
            this.currentLanguage = savedLang;

            // Listen for events
            window.addEventListener('open-auth-modal', (event) => {
                this.authTab = event.detail.tab || 'login';
                this.errors = {};
                this.isLoading = false;
                this.openAuthModal();
            });

            window.addEventListener('get-user-data', () => {
                this.sendUserData();
            });

            window.addEventListener('refresh-user-data', () => {
                this.refreshUserData();
            });
        },

        // ===========================================
        // JMODAL INTEGRATION
        // ===========================================
        initializeModals() {
            if (!window.jModal) {
                console.error('jModal library not loaded');
                return;
            }

            // Initialize all modals
            window.jModal.init('#authModal', {
                onOpen: () => {
                    // Re-initialize Lucide icons
                    if (window.lucide) {
                        requestAnimationFrame(() => window.lucide.createIcons());
                    }
                }
            });
            
            window.jModal.init('#mobileMenuModal');
            
            window.jModal.init('#searchModal', {
                onOpen: () => {
                    // Focus search input when modal opens
                    requestAnimationFrame(() => {
                        const searchInput = document.getElementById('searchInput');
                        if (searchInput) {
                            searchInput.focus();
                        }
                        // Re-initialize Lucide icons
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                    });
                },
                onClose: () => {
                    // Clear search when modal closes
                    this.searchQuery = '';
                    this.searchResults = [];
                }
            });
        },

        // Modal control methods - Now using jModal instead of Alpine
        openAuthModal() {
            window.jModal.open('authModal');
        },

        closeAuthModal() {
            window.jModal.close('authModal');
            this.authTab = 'login';
            this.errors = {};
            this.loginForm = { email: '', password: '', remember: false };
            this.registerForm = { fullname: '', username: '', email: '', password: '', confirmPassword: '', phone: '', agree: false };
            this.isLoading = false;
        },

        openMobileMenu(focusSearch = false) {
            window.jModal.open('mobileMenuModal', focusSearch ? '#mobileSearchInput' : null);
        },

        closeMobileMenu() {
            window.jModal.close('mobileMenuModal');
        },

        // ===========================================
        // AUTHENTICATION METHODS (Alpine logic)
        // ===========================================

        async initializeAuth() {
            const token = this.getAccessToken();
            if (!token) {
                this.setUser(null);
                return;
            }

            const cachedUser = this.getCachedUserData();
            if (cachedUser) {
                this.setUser(cachedUser, true);
                return;
            }

            await this.fetchUserDataFromAPI();
        },

        setUser(user = null, initAuth = false) {
            this.user = user;
            this.updateAuthUI();
            
            if (user) {
                if (!initAuth) {
                    this.sendUserData();
                    this.cacheUserData(user);
                } else {
                    setTimeout(() => {
                        this.sendUserData();
                    }, 500);
                }
            } else {
                this.sendUserData();
                this.clearUserCache();
            }
        },

        cacheUserData(user) {
            const userCache = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                status: user.status,
                avatar: user.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAEElEQVR4nGLy8P0ACAAA//8CbgGIf795rQAAAABJRU5ErkJggg=='
            };
            
            try {
                localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userCache));
                localStorage.setItem(USER_CACHE_AT, Date.now().toString());
                console.log('User data cached successfully');
            } catch (error) {
                console.warn('Failed to cache user data:', error);
            }
        },

        getCachedUserData() {
            try {
                const cachedData = localStorage.getItem(USER_CACHE_KEY);
                const timestamp = localStorage.getItem(USER_CACHE_AT);
                
                if (!cachedData || !timestamp) return null;
                
                const cacheAge = Date.now() - parseInt(timestamp);
                if (cacheAge > USER_CACHE_DURATION) {
                    console.log('User cache expired');
                    this.clearUserCache();
                    return null;
                }
                
                console.log('User data loaded from cache');
                return JSON.parse(cachedData);
            } catch (error) {
                console.warn('Failed to load cached user data:', error);
                this.clearUserCache();
                return null;
            }
        },

        clearUserCache() {
            try {
                localStorage.removeItem(USER_CACHE_KEY);
                localStorage.removeItem(USER_CACHE_AT);
                console.log('User cache cleared');
            } catch (error) {
                console.warn('Failed to clear user cache:', error);
            }
        },

        async fetchUserDataFromAPI() {
            const token = this.getAccessToken();
            if (!token) {
                this.setUser(null);
                return;
            }

            try {
                const response = await window.xhr({
                    method: 'GET',
                    url: API_URL + 'users/info/',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: false,
                    timeout: 10000
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    this.setUser(response.data.data.me);
                    console.log('User data fetched from API');
                } else {
                    sendNotice('Tài khoản không tồn tại hoặc bị khóa do vi phạm điều khoản', 'error');
                    this.setUser(null);
                    this.clearAccessToken();
                }
            } catch (error) {
                if (error.data?.message) {
                    if (error.data.message == 'User_not_found') {
                        error.data.message = 'Tài khoản không tồn tại hoặc bị khóa do vi phạm điều khoản';
                    }
                    sendNotice(error.data.message, 'error');
                } else {
                    sendNotice('Không tải được thông tin tài khoản, hãy thử lại', 'error');
                }
                this.setUser(null);
            }
        },

        async refreshUserData() {
            console.log('Refreshing user data from API...');
            this.clearUserCache();
            await this.fetchUserDataFromAPI();
        },

        sendUserData() {
            window.dispatchEvent(new CustomEvent('user-data-ready', {
                detail: { user: this.user }
            }));
            window.dispatchEvent(new CustomEvent('auth-status-changed', {
                detail: { user: this.user }
            }));
        },
        
        async handleLogin() {
            this.errors = {};
            this.isLoading = true;
            
            if (!this.loginForm.email) {
                this.errors.email = 'Vui lòng nhập tên đăng nhập';
            }
            if (!this.loginForm.password) {
                this.errors.password = 'Vui lòng nhập mật khẩu';
            }
            
            if (Object.keys(this.errors).length > 0) {
                this.isLoading = false;
                return;
            }

            try {
                const response = await window.xhr({
                    method: 'POST',
                    url: API_URL + 'auth/login/',
                    data: {
                        username: this.loginForm.email,
                        password: this.loginForm.password
                    },
                    withCredentials: false,
                    timeout: 15000
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    const accessToken = response.data.data.access_token;
                    this.saveAccessToken(accessToken);
                    this.setUser(response.data.data.me);

                    this.loginForm.email = '';
                    this.loginForm.password = '';
                    this.loginForm.remember = false;
                    
                    this.closeAuthModal();
                    
                    sendNotice(`Xin chào ${response.data.data.me.fullname}! Đăng nhập thành công.`, 'info');
                } else {
                    this.handleLoginError(response.data);
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.handleLoginError(error.data || error);
            } finally {
                this.isLoading = false;
            }
        },

        handleLoginError(errorData) {
            if (errorData && errorData.message) {
                switch (errorData.message) {
                    case 'Username_invalid':
                    case 'User_not_found':
                        this.errors.general = 'Tài khoản hoặc Mật khẩu không đúng';
                        break;
                    case 'Account_disabled':
                        this.errors.general = 'Tài khoản đã bị cấm vì vi phạm điều khoản sử dụng';
                        break;
                    case 'Login_failed':
                        this.errors.general = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
                        break;
                    default:
                        this.errors.general = errorData.message || 'Đăng nhập thất bại, không xác định';
                }
            } else {
                this.errors.general = 'Đăng nhập thất bại. Vui lòng thử lại.';
            }
        },

        async handleRegister() {
            this.errors = {};
            this.isLoading = true;
            
            // Validation
            if (!this.registerForm.fullname) {
                this.errors.fullname = 'Vui lòng nhập họ tên';
            } else if (this.registerForm.fullname.length < 2) {
                this.errors.fullname = 'Họ tên phải có ít nhất 2 ký tự';
            }
            
            if (!this.registerForm.username) {
                this.errors.username = 'Vui lòng nhập tên đăng nhập';
            } else if (this.registerForm.username.length < 3) {
                this.errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
            } else if (!/^[a-zA-Z0-9_]+$/.test(this.registerForm.username)) {
                this.errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
            }
            
            if (!this.registerForm.email) {
                this.errors.email = 'Vui lòng nhập email';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
                this.errors.email = 'Email không hợp lệ';
            }
            
            if (!this.registerForm.phone) {
                this.errors.phone = 'Vui lòng nhập số điện thoại';
            } else if (!/^[0-9]{10,11}$/.test(this.registerForm.phone.replace(/\s/g, ''))) {
                this.errors.phone = 'Số điện thoại không hợp lệ';
            }
            
            if (!this.registerForm.password) {
                this.errors.password = 'Vui lòng nhập mật khẩu';
            } else if (this.registerForm.password.length < 6) {
                this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
            
            if (!this.registerForm.agree) {
                this.errors.agree = 'Vui lòng đồng ý với điều khoản sử dụng';
            }
            
            if (Object.keys(this.errors).length > 0) {
                this.isLoading = false;
                return;
            }

            try {
                const response = await window.xhr({
                    method: 'POST',
                    url: API_URL + 'auth/register/',
                    data: {
                        fullname: this.registerForm.fullname,
                        username: this.registerForm.username,
                        email: this.registerForm.email,
                        phone: this.registerForm.phone,
                        password: this.registerForm.password,
                        password_repeat: this.registerForm.confirmPassword,
                        agree_terms: this.registerForm.agree
                    },
                    withCredentials: false,
                    timeout: 15000
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    const accessToken = response.data.data.access_token;
                    this.saveAccessToken(accessToken);
                    this.setUser(response.data.data.me);

                    this.registerForm = { 
                        fullname: '', 
                        username: '',
                        email: '', 
                        password: '', 
                        confirmPassword: '', 
                        phone: '', 
                        agree: false 
                    };
                    
                    this.closeAuthModal();
                    
                    sendNotice(`Chào mừng ${response.data.data.me.fullname}! Đăng ký thành công.`, 'success');
                } else {
                    this.handleRegisterError(response.data);
                }
                
            } catch (error) {
                console.error('Register error:', error);
                if (error.data) {
                    this.handleRegisterError(error.data);
                } else if (error.response && error.response.data) {
                    this.handleRegisterError(error.response.data);
                } else {
                    this.handleRegisterError({ 
                        status: 'error', 
                        message: 'Network error', 
                        errors: {} 
                    });
                }
            } finally {
                this.isLoading = false;
            }
        },

        handleRegisterError(errorData) {
            this.errors = {};
            
            if (errorData && errorData.status === 'error') {
                if (errorData.errors && typeof errorData.errors === 'object') {
                    Object.keys(errorData.errors).forEach(field => {
                        const fieldErrors = errorData.errors[field];
                        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                            this.errors[field] = this.mapFieldErrors(field, fieldErrors);
                        } else {
                            this.errors[field] = fieldErrors ? fieldErrors.toString() : 'Giá trị không hợp lệ';
                        }
                    });
                }
                
                if (errorData.message) {
                    this.errors.general = this.mapGeneralError(errorData.message);
                }
            } else {
                this.errors.general = 'Đăng ký thất bại. Vui lòng thử lại.';
            }
        },

        mapFieldErrors(field, errors) {
            const errorMap = {
                'username': {
                    'Username_length': 'Tên đăng nhập phải có ít nhất 3 ký tự',
                    'Username_already_exists': 'Tên đăng nhập này đã được sử dụng',
                    'Username_invalid': 'Tên đăng nhập không hợp lệ'
                },
                'fullname': {
                    'Fullname_length': 'Họ tên phải có ít nhất 2 ký tự',
                    'Fullname_invalid': 'Họ tên không hợp lệ'
                },
                'email': {
                    'Email_invalid': 'Email không hợp lệ',
                    'Email_already_exists': 'Email này đã được sử dụng'
                },
                'phone': {
                    'Phone_invalid': 'Số điện thoại không hợp lệ',
                    'Phone_already_exists': 'Số điện thoại này đã được sử dụng'
                },
                'password': {
                    'Password_too_weak': 'Mật khẩu quá yếu, hãy chọn mật khẩu mạnh hơn',
                    'Password_invalid': 'Mật khẩu không hợp lệ'
                },
                'password_repeat': {
                    'Password_repeat_invalid': 'Mật khẩu xác nhận không khớp',
                    'Password_mismatch': 'Mật khẩu xác nhận không khớp'
                },
                'agree': {
                    'Terms_not_accepted': 'Vui lòng đồng ý với điều khoản sử dụng'
                }
            };

            const fieldErrorMap = errorMap[field] || {};
            const mappedErrors = errors.map(error => fieldErrorMap[error] || error);
            return mappedErrors.join(', ');
        },

        mapGeneralError(message) {
            const generalErrorMap = {
                'Register_failed': 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
                'Server_error': 'Lỗi server. Vui lòng thử lại sau.',
                'Validation_failed': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
                'Database_error': 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.'
            };

            if (message.includes('SQLSTATE') || message.includes('Field') || message.includes('doesn\'t have a default value')) {
                return 'Lỗi cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.';
            }

            return generalErrorMap[message] || message;
        },
        
        updateAuthUI() {
            const loginButtons = document.getElementById('loginButtons');
            const userDropdown = document.getElementById('userDropdown');
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            if (this.user) {
                if (loginButtons) loginButtons.classList.add('hidden');
                if (userDropdown) userDropdown.classList.remove('hidden');
                if (userAvatar) userAvatar.src = this.user.avatar;
                if (userName) userName.textContent = this.user.fullname;
                this.updateUserStatusBadge();
            } else {
                if (loginButtons) loginButtons.classList.remove('hidden');
                if (userDropdown) userDropdown.classList.add('hidden');
            }
        },

        updateUserStatusBadge() {
            this.updateDesktopStatusBadge();
            this.updateMobileStatusBadge();
        },

        updateDesktopStatusBadge() {
            const userDropdown = document.getElementById('userDropdown');
            if (!userDropdown) return;

            const existingBadge = userDropdown.querySelector('.user-status-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
        },

        updateMobileStatusBadge() {
            const mobileUserInfo = document.querySelector('[x-show="user"] .flex-1');
            if (!mobileUserInfo) return;

            const existingBadge = mobileUserInfo.querySelector('.mobile-status-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            if (this.user && this.user.status === 'inactive') {
                const statusBadge = document.createElement('div');
                statusBadge.className = 'mobile-status-badge badge badge-warning text-xs mt-1';
                statusBadge.textContent = 'Tài khoản chưa kích hoạt';
                
                const userName = mobileUserInfo.querySelector('p.font-medium');
                if (userName) {
                    userName.parentNode.insertBefore(statusBadge, userName.nextSibling);
                }
            }
        },
        
        logout() {
            this.setUser(null);
            this.clearAccessToken();
            this.clearUserCache();
        },
        
        handlePostClick() {
            if (this.user) {
                window.location.href = '/post';
            } else {
                this.authTab = 'login';
                this.errors = {};
                this.isLoading = false;
                this.openAuthModal();
            }
        },
        
        saveAccessToken(token) {
            localStorage.setItem('usstk', token);
        },

        getAccessToken() {
            const token = localStorage.getItem('usstk');
            if (token) {
                return token;
            }
            this.clearAccessToken();
            return null;
        },

        clearAccessToken() {
            localStorage.removeItem('usstk');
        },
        
        // ===========================================
        // SEARCH FUNCTIONALITY
        // ===========================================
        openSearchModal() {
            window.jModal.open('searchModal');
        },
        
        closeSearchModal() {
            window.jModal.close('searchModal');
            this.searchQuery = '';
            this.searchResults = [];
        },
        
        async performSearch() {
            if (!this.searchQuery || this.searchQuery.trim().length < 2) {
                this.searchResults = [];
                return;
            }
            
            this.isSearching = true;
            
            // Simulate search API call (replace with actual API)
            try {
                // TODO: Replace with actual API endpoint
                // const response = await window.xhr({
                //     method: 'GET',
                //     url: API_URL + 'search/',
                //     data: { q: this.searchQuery },
                //     timeout: 5000
                // });
                
                // Mock search results for now
                setTimeout(() => {
                    this.searchResults = this.mockSearchResults(this.searchQuery);
                    this.isSearching = false;
                    
                    // Re-initialize Lucide icons for results
                    if (window.lucide) {
                        requestAnimationFrame(() => window.lucide.createIcons());
                    }
                }, 300);
                
            } catch (error) {
                console.error('Search error:', error);
                this.isSearching = false;
                this.searchResults = [];
            }
        },
        
        mockSearchResults(query) {
            // Mock search results - replace with actual API response
            const lowerQuery = query.toLowerCase();
            const results = [];
            
            if (lowerQuery.includes('usdt') || lowerQuery.includes('mua') || lowerQuery.includes('bán')) {
                results.push({
                    id: 1,
                    title: 'Mua USDT',
                    description: 'Tìm kiếm người bán USDT',
                    url: '/buy',
                    icon: 'shopping-cart'
                });
                results.push({
                    id: 2,
                    title: 'Bán USDT',
                    description: 'Tìm kiếm người mua USDT',
                    url: '/sell',
                    icon: 'dollar-sign'
                });
            }
            
            if (lowerQuery.includes('thị trường') || lowerQuery.includes('market')) {
                results.push({
                    id: 3,
                    title: 'Thị trường',
                    description: 'Xem thống kê thị trường',
                    url: '/category',
                    icon: 'trending-up'
                });
            }
            
            if (lowerQuery.includes('tin tức') || lowerQuery.includes('news')) {
                results.push({
                    id: 4,
                    title: 'Tin tức',
                    description: 'Đọc tin tức mới nhất',
                    url: '/news',
                    icon: 'newspaper'
                });
            }
            
            return results;
        },
        
        handleSearch() {
            if (this.searchQuery && this.searchQuery.trim().length >= 2) {
                // Perform search and navigate to first result or search page
                if (this.searchResults.length > 0) {
                    window.location.href = this.searchResults[0].url;
                } else {
                    // Navigate to search results page
                    window.location.href = `/search?q=${encodeURIComponent(this.searchQuery)}`;
                }
                this.closeSearchModal();
            }
        },
        
        // ===========================================
        // LANGUAGE FUNCTIONALITY
        // ===========================================
        changeLanguage(lang) {
            this.currentLanguage = lang;
            localStorage.setItem('app_language', lang);
            
            // Update UI language
            this.updateLanguageUI(lang);
            
            // Reload page to apply language changes
            // window.location.reload();
            
            sendNotice(`Ngôn ngữ đã chuyển sang ${lang === 'vi' ? 'Tiếng Việt' : 'English'}`, 'info');
        },
        
        updateLanguageUI(lang) {
            // Update language selector text
            const langButtons = document.querySelectorAll('[x-data*="open"]');
            // This would typically update all text on the page
            // For now, just update the selector
        }
    };
}

// Export for use in HTML
window.headerComponent = headerComponent;

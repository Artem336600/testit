/* ══════════════════════════════════════════════════════════════
   app.js — Main application: initialization, routing, utilities
   ══════════════════════════════════════════════════════════════ */

const App = (() => {
    let _navHistory = [];
    let _tg = null;
    let _currentItem = null;
    let _modalCallback = null;

    // ── Init ──────────────────────────────────────────────────────
    async function init() {
        // Telegram WebApp SDK
        _tg = window.Telegram?.WebApp;
        if (_tg) {
            _tg.ready();
            _tg.expand();
            document.body.classList.add('tg-theme');
            // Apply Telegram color variables
            const tp = _tg.themeParams;
            if (tp) {
                const root = document.documentElement.style;
                if (tp.bg_color) root.setProperty('--tg-theme-bg-color', tp.bg_color);
                if (tp.secondary_bg_color) root.setProperty('--tg-theme-secondary-bg-color', tp.secondary_bg_color);
                if (tp.text_color) root.setProperty('--tg-theme-text-color', tp.text_color);
            }
        }

        showScreen('screen-loading');
        await authenticate();
        bindEvents();

        // Route
        if (Api.isAdmin()) {
            showScreen('screen-admin-mod');
            await AdminScreen.load();
        } else {
            showScreen('screen-categories');
            await CategoriesScreen.load();
        }
    }

    async function authenticate() {
        try {
            const initData = _tg?.initData || '';
            const userId = _tg?.initDataUnsafe?.user?.id;
            await Api.authenticate(initData || null, initData ? undefined : (userId || 999999));
        } catch (e) {
            console.error('Auth error:', e);
            // Dev fallback — continue as regular user with demo ID
            try {
                await Api.authenticate(null, 999999);
            } catch (e2) {
                showToast('Сервер недоступен. Убедись что backend запущен.', 'error');
            }
        }
    }

    // ── Navigation ────────────────────────────────────────────────
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
        window.scrollTo(0, 0);

        // Back button in Telegram
        if (_tg) {
            if (_navHistory.length > 0) {
                _tg.BackButton.show();
            } else {
                _tg.BackButton.hide();
            }
        }
    }

    function navigate(screenId) {
        const current = document.querySelector('.screen.active')?.id;
        if (current) _navHistory.push(current);
        showScreen(screenId);
    }

    function goBack() {
        const prev = _navHistory.pop();
        if (prev) showScreen(prev);
    }

    async function goToItems(category) {
        navigate('screen-items');
        await ItemsScreen.load(category);
    }

    async function goToClaim(item) {
        _currentItem = item;
        navigate('screen-claim');
        ClaimFormScreen.load(item);
    }

    // ── Events ────────────────────────────────────────────────────
    function bindEvents() {
        // Back buttons
        document.getElementById('btn-back-categories')?.addEventListener('click', goBack);
        document.getElementById('btn-back-items')?.addEventListener('click', goBack);
        document.getElementById('btn-back-from-claims')?.addEventListener('click', goBack);
        document.getElementById('btn-back-admin')?.addEventListener('click', goBack);
        _tg?.BackButton.onClick(goBack);

        // My claims button
        document.getElementById('btn-my-claims')?.addEventListener('click', async () => {
            navigate('screen-my-claims');
            await MyClaimsScreen.load();
        });

        document.getElementById('btn-go-search')?.addEventListener('click', () => {
            navigate('screen-categories');
        });

        // Claim form submit
        document.getElementById('claim-form')?.addEventListener('submit', ClaimFormScreen.submit);

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => AdminScreen.setTab(btn.dataset.tab));
        });

        // Modal
        document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
        document.getElementById('modal-confirm')?.addEventListener('click', () => {
            closeModal();
            _modalCallback?.();
        });
        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) closeModal();
        });
    }

    // ── Toast ─────────────────────────────────────────────────────
    let _toastTimeout = null;
    function showToast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show${type ? ' ' + type : ''}`;
        clearTimeout(_toastTimeout);
        _toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ── Modal ─────────────────────────────────────────────────────
    function showModal(message, onConfirm) {
        _modalCallback = onConfirm;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    function closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        _modalCallback = null;
    }

    return {
        init,
        showScreen,
        navigate,
        goBack,
        goToItems,
        goToClaim,
        showToast,
        showModal,
        closeModal,
    };
})();

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', App.init);

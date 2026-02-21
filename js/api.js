/* ══════════════════════════════════════════════════════════════
   api.js — API client, auth management, all fetch wrappers
   ══════════════════════════════════════════════════════════════ */

const API_BASE = 'http://localhost:8000';

const Api = (() => {
    let _token = null;
    let _role = null;

    // ── Auth ──────────────────────────────────────────────────────
    async function authenticate(initData, telegramId) {
        const body = initData
            ? { init_data: initData }
            : { telegram_id: telegramId, username: 'miniapp_user', first_name: 'User' };

        const res = await fetch(`${API_BASE}/auth/telegram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Auth failed');
        const data = await res.json();
        _token = data.access_token;
        _role = data.role;
        return data;
    }

    function getRole() { return _role; }
    function isAdmin() { return _role === 'admin'; }

    // ── HTTP helpers ──────────────────────────────────────────────
    async function get(path, auth = false) {
        const headers = {};
        if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;
        const res = await fetch(`${API_BASE}${path}`, { headers });
        if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
        return res.json();
    }

    async function post(path, body, auth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `POST ${path} → ${res.status}`);
        }
        return res.json();
    }

    async function patch(path, body, auth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
        return res.json();
    }

    async function del(path, auth = true) {
        const headers = {};
        if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;
        const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers });
        if (!res.ok && res.status !== 204) throw new Error(`DELETE ${path} → ${res.status}`);
        return true;
    }

    async function uploadImage(file) {
        const form = new FormData();
        form.append('file', file);
        const headers = {};
        if (_token) headers['Authorization'] = `Bearer ${_token}`;
        const res = await fetch(`${API_BASE}/uploads/image`, { method: 'POST', body: form, headers });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    }

    // ── Domain endpoints ─────────────────────────────────────────
    return {
        authenticate,
        getRole,
        isAdmin,
        categories: {
            list: () => get('/categories'),
        },
        items: {
            list: (categoryId, page = 1) =>
                get(`/items?category_id=${categoryId}&page=${page}`),
            create: (data) => post('/items', data),
        },
        claims: {
            create: (data) => post('/claims', data),
            my: () => get('/claims/my', true),
            appeal: (id, message) => post(`/claims/${id}/appeal`, { message }),
        },
        lostRequests: {
            create: (data) => post('/lost-requests', data),
            my: () => get('/lost-requests/my', true),
        },
        users: {
            me: () => get('/users/me', true),
        },
        uploads: {
            image: uploadImage,
        },
        admin: {
            items: (status) => get(`/admin/items?status=${status || ''}`, true),
            updateItem: (id, data) => patch(`/admin/items/${id}`, data),
            deleteItem: (id) => del(`/admin/items/${id}`),
            claims: (status) => get(`/admin/claims?status=${status || ''}`, true),
            updateClaim: (id, data) => patch(`/admin/claims/${id}`, data),
            lostRequests: () => get('/admin/lost-requests', true),
        },
    };
})();

/* ══════════════════════════════════════════════════════════════
   admin.js — Admin screens: moderation queue, claims, lost requests
   ══════════════════════════════════════════════════════════════ */

const AdminScreen = (() => {
    let _activeTab = 'mod';

    async function load() {
        setTab('mod');
        loadModItems();
        loadAdminClaims();
        loadLostRequests();
    }

    function setTab(tab) {
        _activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.getElementById('admin-mod-list').classList.toggle('hidden', tab !== 'mod');
        document.getElementById('admin-claims-list').classList.toggle('hidden', tab !== 'claims');
        document.getElementById('admin-lost-list').classList.toggle('hidden', tab !== 'lost');
    }

    async function loadModItems() {
        const list = document.getElementById('admin-mod-list');
        list.innerHTML = '<div class="loading-text">Загружаем…</div>';
        try {
            const items = await Api.admin.items('on_moderation');
            document.getElementById('mod-count').textContent = items.length;
            list.innerHTML = '';
            if (items.length === 0) {
                list.innerHTML = '<div class="empty-state"><div class="empty-blob">🎉</div><p>Очередь пуста</p></div>';
            } else {
                items.forEach(item =>
                    list.appendChild(Card.itemAdmin(item,
                        (id) => approveItem(id),
                        (id) => deleteItem(id),
                    ))
                );
            }
        } catch (e) {
            list.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        }
    }

    async function loadAdminClaims() {
        const list = document.getElementById('admin-claims-list');
        list.innerHTML = '<div class="loading-text">Загружаем…</div>';
        try {
            const claims = await Api.admin.claims('pending');
            const appeals = await Api.admin.claims('appeal_pending').catch(() => []);
            const all = [...claims, ...appeals];
            document.getElementById('claims-count').textContent = all.length;
            list.innerHTML = '';
            if (all.length === 0) {
                list.innerHTML = '<div class="empty-state"><div class="empty-blob">🎉</div><p>Нет заявок</p></div>';
            } else {
                all.forEach(claim =>
                    list.appendChild(Card.claimAdmin(claim,
                        (id) => approveClaim(id),
                        (id) => rejectClaim(id),
                    ))
                );
            }
        } catch (e) {
            list.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        }
    }

    async function loadLostRequests() {
        const list = document.getElementById('admin-lost-list');
        list.innerHTML = '<div class="loading-text">Загружаем…</div>';
        try {
            const reqs = await Api.admin.lostRequests();
            document.getElementById('lost-count').textContent = reqs.length;
            list.innerHTML = '';
            if (reqs.length === 0) {
                list.innerHTML = '<div class="empty-state"><div class="empty-blob">🔍</div><p>Нет потеряшек</p></div>';
            } else {
                reqs.forEach(r => list.appendChild(Card.lostRequestAdmin(r)));
            }
        } catch (e) {
            list.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        }
    }

    async function approveItem(itemId) {
        App.showModal('Одобрить находку и опубликовать?', async () => {
            try {
                await Api.admin.updateItem(itemId, { status: 'active' });
                App.showToast('✅ Опубликовано', 'success');
                loadModItems();
            } catch { App.showToast('Ошибка', 'error'); }
        });
    }

    async function deleteItem(itemId) {
        App.showModal('Удалить находку? Это нельзя отменить.', async () => {
            try {
                await Api.admin.deleteItem(itemId);
                App.showToast('🗑 Удалено', 'success');
                loadModItems();
            } catch { App.showToast('Ошибка', 'error'); }
        });
    }

    async function approveClaim(claimId) {
        App.showModal('Подтвердить заявку? Вещь будет помечена как возвращённая.', async () => {
            try {
                await Api.admin.updateClaim(claimId, { status: 'approved', admin_comment: 'Заявка подтверждена!' });
                App.showToast('✅ Заявка одобрена', 'success');
                loadAdminClaims();
            } catch { App.showToast('Ошибка', 'error'); }
        });
    }

    async function rejectClaim(claimId) {
        App.showModal('Отклонить заявку?', async () => {
            try {
                await Api.admin.updateClaim(claimId, { status: 'rejected', admin_comment: 'Описание не совпадает.' });
                App.showToast('❌ Заявка отклонена', 'success');
                loadAdminClaims();
            } catch { App.showToast('Ошибка', 'error'); }
        });
    }

    return { load, setTab };
})();

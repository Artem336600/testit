/* ══════════════════════════════════════════════════════════════
   card.js — Reusable card component builders
   ══════════════════════════════════════════════════════════════ */

const Card = (() => {
    const STATUS_LABELS = {
        on_moderation: '⏳ Модерация',
        active: '✅ Активна',
        returned: '🏠 Возвращена',
        deleted: '🗑 Удалена',
        pending: '⏳ Ожидание',
        approved: '✅ Одобрено',
        rejected: '❌ Отклонено',
        appeal_pending: '📤 Апелляция',
    };

    function formatDate(iso) {
        return new Date(iso).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        });
    }

    /** Public item card — no signs/photo */
    function itemPublic(item, onClick) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
      <div class="item-card-top">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-badge badge-${item.status}">${STATUS_LABELS[item.status] || item.status}</span>
      </div>
      <div class="item-meta">📅 ${formatDate(item.created_at)}</div>
    `;
        card.addEventListener('click', () => onClick(item));
        return card;
    }

    /** Admin item card — full info + action buttons */
    function itemAdmin(item, onApprove, onDelete) {
        const card = document.createElement('div');
        card.className = 'item-card admin-card';
        card.innerHTML = `
      <div class="item-card-top">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-badge badge-${item.status}">${STATUS_LABELS[item.status] || item.status}</span>
      </div>
      ${item.photo_url ? `<img class="admin-photo" src="${API_BASE}${item.photo_url}" alt="photo">` : ''}
      ${item.signs ? `<div class="admin-signs">🔎 ${escapeHtml(item.signs)}</div>` : ''}
      ${item.where_found ? `<div class="item-meta">📍 Найдено: ${escapeHtml(item.where_found)}</div>` : ''}
      <div class="item-meta">📅 ${formatDate(item.created_at)}</div>
      <div class="admin-actions">
        ${item.status === 'on_moderation' ? `<button class="btn btn-success btn-sm" data-action="approve">✅ Одобрить</button>` : ''}
        <button class="btn btn-danger btn-sm" data-action="delete">🗑 Удалить</button>
      </div>
    `;
        card.querySelector('[data-action="approve"]')?.addEventListener('click', (e) => {
            e.stopPropagation(); onApprove(item.id);
        });
        card.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
            e.stopPropagation(); onDelete(item.id);
        });
        return card;
    }

    /** Admin claim card */
    function claimAdmin(claim, onApprove, onReject) {
        const card = document.createElement('div');
        card.className = 'item-card admin-card';
        card.innerHTML = `
      <div class="item-card-top">
        <span class="item-name">Заявка #${claim.id}</span>
        <span class="item-badge badge-${claim.status}">${STATUS_LABELS[claim.status] || claim.status}</span>
      </div>
      <div class="admin-signs">🔎 ${escapeHtml(claim.private_signs)}</div>
      ${claim.comment ? `<div class="item-meta">💬 ${escapeHtml(claim.comment)}</div>` : ''}
      ${claim.appeal_message ? `<div class="admin-signs">⚖️ Апелляция: ${escapeHtml(claim.appeal_message)}</div>` : ''}
      <div class="item-meta">Вещь #${claim.item_id} · ${formatDate(claim.created_at)}</div>
      ${(claim.status === 'pending' || claim.status === 'appeal_pending') ? `
        <div class="admin-actions">
          <button class="btn btn-success btn-sm" data-action="approve">✅ Принять</button>
          <button class="btn btn-danger btn-sm" data-action="reject">❌ Отклонить</button>
        </div>
      ` : ''}
    `;
        card.querySelector('[data-action="approve"]')?.addEventListener('click', () => onApprove(claim.id));
        card.querySelector('[data-action="reject"]')?.addEventListener('click', () => onReject(claim.id));
        return card;
    }

    /** Admin lost request card */
    function lostRequestAdmin(req) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
      <div class="item-card-top">
        <span class="item-name">${escapeHtml(req.name)}</span>
        <span class="item-badge badge-${req.status === 'active' ? 'active' : 'returned'}">${req.status === 'active' ? '🔎 Ищем' : '✅ Закрыта'}</span>
      </div>
      ${req.signs ? `<div class="admin-signs">🔎 ${escapeHtml(req.signs)}</div>` : ''}
      <div class="item-meta">📅 ${formatDate(req.created_at)}</div>
    `;
        return card;
    }

    /** My claim card */
    function myClaim(claim, onAppeal) {
        const card = document.createElement('div');
        card.className = 'item-card';
        const canAppeal = claim.status === 'rejected' && !claim.appeal_message;
        card.innerHTML = `
      <div class="item-card-top">
        <span class="item-name">Заявка #${claim.id}</span>
        <span class="item-badge badge-${claim.status}">${STATUS_LABELS[claim.status] || claim.status}</span>
      </div>
      <div class="item-meta">🔎 ${escapeHtml(claim.private_signs)}</div>
      ${claim.admin_comment ? `<div class="admin-signs">💬 Комментарий: ${escapeHtml(claim.admin_comment)}</div>` : ''}
      <div class="item-meta">📅 ${formatDate(claim.created_at)}</div>
      ${canAppeal ? `<button class="btn btn-ghost btn-sm" data-action="appeal">⚖️ Подать апелляцию</button>` : ''}
    `;
        card.querySelector('[data-action="appeal"]')?.addEventListener('click', () => onAppeal(claim.id));
        return card;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    return { itemPublic, itemAdmin, claimAdmin, lostRequestAdmin, myClaim };
})();

const API_BASE = 'http://localhost:8000';

/* ══════════════════════════════════════════════════════════════
   items.js — Screen 2: Items feed for a category
   ══════════════════════════════════════════════════════════════ */

const ItemsScreen = (() => {
    let _currentCategory = null;
    let _page = 1;

    async function load(category) {
        _currentCategory = category;
        _page = 1;
        document.getElementById('items-title').textContent =
            `${category.emoji} ${category.name}`;

        const list = document.getElementById('items-list');
        const empty = document.getElementById('items-empty');
        list.innerHTML = '';
        empty.classList.add('hidden');

        try {
            const items = await Api.items.list(category.id, _page);
            if (items.length === 0) {
                empty.classList.remove('hidden');
            } else {
                items.forEach(item => {
                    list.appendChild(Card.itemPublic(item, (i) => App.goToClaim(i)));
                });
            }
        } catch (e) {
            App.showToast('Ошибка загрузки находок', 'error');
        }
    }

    return { load };
})();

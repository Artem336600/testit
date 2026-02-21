/* ══════════════════════════════════════════════════════════════
   categories.js — Screen 1: Category grid
   ══════════════════════════════════════════════════════════════ */

const CategoriesScreen = (() => {
    let _categories = [];

    async function load() {
        try {
            _categories = await Api.categories.list();
            render();
        } catch (e) {
            App.showToast('Не удалось загрузить категории', 'error');
        }
    }

    function render() {
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';
        _categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
        <div class="category-emoji">${cat.emoji}</div>
        <div class="category-name">${cat.name}</div>
        <span class="category-count ${cat.items_count === 0 ? 'zero' : ''}">${cat.items_count}</span>
      `;
            card.addEventListener('click', () => App.goToItems(cat));
            grid.appendChild(card);
        });
    }

    return { load };
})();

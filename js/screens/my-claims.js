/* ══════════════════════════════════════════════════════════════
   my-claims.js — Screen 4: User's own claims
   ══════════════════════════════════════════════════════════════ */

const MyClaimsScreen = (() => {
    async function load() {
        const list = document.getElementById('my-claims-list');
        const empty = document.getElementById('claims-empty');
        list.innerHTML = '';
        empty.classList.add('hidden');

        try {
            const claims = await Api.claims.my();
            if (claims.length === 0) {
                empty.classList.remove('hidden');
            } else {
                claims.forEach(claim => {
                    list.appendChild(Card.myClaim(claim, (id) => handleAppeal(id)));
                });
            }
        } catch (e) {
            App.showToast('Ошибка загрузки заявок', 'error');
        }
    }

    async function handleAppeal(claimId) {
        App.showModal(
            'Введи текст апелляции в следующем шаге или вернись назад.',
            async () => {
                const message = prompt('Текст апелляции:');
                if (!message?.trim()) return;
                try {
                    await Api.claims.appeal(claimId, message.trim());
                    App.showToast('✅ Апелляция отправлена', 'success');
                    load();
                } catch (e) {
                    App.showToast('Ошибка отправки апелляции', 'error');
                }
            }
        );
    }

    return { load };
})();

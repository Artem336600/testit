/* ══════════════════════════════════════════════════════════════
   claim-form.js — Screen 3: Submit claim for a found item
   ══════════════════════════════════════════════════════════════ */

const ClaimFormScreen = (() => {
    let _currentItem = null;
    let _photoFile = null;

    function load(item) {
        _currentItem = item;
        _photoFile = null;

        // Reset form
        document.getElementById('claim-signs').value = '';
        document.getElementById('claim-comment').value = '';
        document.getElementById('claim-photo').value = '';
        document.getElementById('photo-preview-wrap').classList.add('hidden');

        // Photo preview
        document.getElementById('claim-photo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            _photoFile = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('photo-preview').src = ev.target.result;
                document.getElementById('photo-preview-wrap').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btn-remove-photo').onclick = () => {
            _photoFile = null;
            document.getElementById('claim-photo').value = '';
            document.getElementById('photo-preview-wrap').classList.add('hidden');
        };
    }

    async function submit(e) {
        e.preventDefault();
        const signs = document.getElementById('claim-signs').value.trim();
        if (!signs) { App.showToast('Опиши особые признаки вещи', 'error'); return; }

        const btn = document.getElementById('btn-submit-claim');
        btn.disabled = true;
        btn.textContent = 'Отправляем…';

        try {
            let photoUrl = null;
            if (_photoFile) {
                const uploaded = await Api.uploads.image(_photoFile);
                photoUrl = uploaded.url;
            }

            await Api.claims.create({
                item_id: _currentItem.id,
                private_signs: signs,
                comment: document.getElementById('claim-comment').value.trim() || null,
                photo_url: photoUrl,
            });

            App.showToast('✅ Заявка отправлена! Ожидай ответа от администратора.', 'success');
            setTimeout(() => App.showScreen('screen-categories'), 1500);
        } catch (err) {
            App.showToast(err.message || 'Ошибка отправки', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Отправить заявку';
        }
    }

    return { load, submit };
})();

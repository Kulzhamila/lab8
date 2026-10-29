// =====================================================
// Кіру және тіркелу формаларын тексеру (клиент жағында)
// Ескерту: сервер жағындағы PHP тексеруі 10-аптада қосылады
// =====================================================

// Әр өріске арналған ереже: дұрыс болса true, қате болса хабарлама қайтарады
const rules = {
    full_name: (value) =>
        value.trim().length >= 3 || 'Аты-жөніңізді толық жазыңыз (кемінде 3 таңба)',

    email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || 'Email дұрыс емес (мысалы: aru@mail.kz)',

    phone: (value) => {
        const clean = value.replace(/[\s()-]/g, '');
        return clean === '' || /^\+7\d{10}$/.test(clean) || 'Телефон +7XXXXXXXXXX форматында болуы керек';
    },

    gender: (value) =>
        value !== '' || 'Жынысыңызды таңдаңыз',

    password: (value, form) => {
        if (form.dataset.mode === 'login') {
            return value.length > 0 || 'Құпиясөзді енгізіңіз';
        }
        if (value.length < 8) return 'Құпиясөз кемінде 8 таңбадан тұруы керек';
        if (!/\p{L}/u.test(value)) return 'Құпиясөзде кемінде бір әріп болуы керек';
        if (!/\d/.test(value)) return 'Құпиясөзде кемінде бір сан болуы керек';
        return true;
    },

    password_confirm: (value, form) =>
        (value !== '' && value === form.elements.password.value) || 'Құпиясөздер сәйкес келмейді',

    terms: (value, form, el) =>
        el.checked || 'Ережелермен келісуіңіз керек'
};

// Бір өрісті тексеру
function validateField(el, form) {
    const rule = rules[el.name];
    if (!rule) return true;

    const result = rule(el.value, form, el);
    const field = el.closest('.field');
    const error = field.querySelector('.error');

    if (result === true) {
        field.classList.remove('invalid');
        if (el.type !== 'checkbox' && el.value !== '') field.classList.add('valid');
        error.textContent = '';
        return true;
    }

    field.classList.remove('valid');
    field.classList.add('invalid');
    error.textContent = result;
    return false;
}

// Құпиясөздің күштілігін бағалау (тек тіркелу бетінде)
function updateStrength(value) {
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    if (!bar) return;

    let score = 0;
    if (value.length >= 8) score++;
    if (/\p{L}/u.test(value) && /\d/.test(value)) score++;
    if (/[A-ZА-ЯӘҒҚҢӨҰҮҺІ]/.test(value)) score++;
    if (/[^\p{L}\d]/u.test(value) || value.length >= 12) score++;

    const levels = [
        { width: '0%',   color: 'transparent', label: 'Әріп пен сан қолданыңыз' },
        { width: '25%',  color: '#c0392b',     label: 'Әлсіз' },
        { width: '50%',  color: '#e8a33d',     label: 'Орташа' },
        { width: '75%',  color: '#7cb342',     label: 'Жақсы' },
        { width: '100%', color: '#2e7d4f',     label: 'Күшті' }
    ];
    const level = value === '' ? levels[0] : levels[Math.max(score, 1)];

    bar.style.width = level.width;
    bar.style.background = level.color;
    text.textContent = level.label;
}

// Формаларды іске қосу
document.querySelectorAll('form[data-mode]').forEach(form => {
    const fields = Array.from(form.elements).filter(el => rules[el.name]);
    const success = document.getElementById('formSuccess');

    fields.forEach(el => {
        // Өрістен шыққанда тексеру
        el.addEventListener('blur', () => validateField(el, form));

        // Қате көрсетілген өрісті енгізу кезінде қайта тексеру
        el.addEventListener('input', () => {
            if (el.closest('.field').classList.contains('invalid')) validateField(el, form);
            if (el.name === 'password') updateStrength(el.value);
        });
        el.addEventListener('change', () => {
            if (el.type === 'checkbox' || el.tagName === 'SELECT') validateField(el, form);
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Барлық өрісті тексеру
        const allValid = fields.map(el => validateField(el, form)).every(Boolean);

        if (!allValid) {
            success.classList.remove('show');
            form.querySelector('.invalid .input, .invalid input')?.focus();
            return;
        }

        // Статикалық нұсқа: деректер әзірге серверге жіберілмейді
        success.textContent = form.dataset.mode === 'login'
            ? 'Деректер дұрыс толтырылды. Кіру функциясы PHP қосылғаннан кейін жұмыс істейді.'
            : 'Форма дұрыс толтырылды! Тіркелу функциясы PHP қосылғаннан кейін жұмыс істейді.';
        success.classList.add('show');

        form.reset();
        fields.forEach(el => el.closest('.field').classList.remove('valid', 'invalid'));
        updateStrength('');
    });
});

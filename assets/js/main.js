// =====================================================
// Барлық беттерге ортақ скрипт
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Мобильді мәзір (бургер батырмасы)
    const burger = document.querySelector('.burger');
    const nav = document.getElementById('nav');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            burger.classList.toggle('active', isOpen);
            burger.setAttribute('aria-expanded', isOpen);
        });
    }

    // 2. Ағымдағы беттің сілтемесін белгілеу
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage && !link.classList.contains('btn')) {
            link.classList.add('active');
        }
    });

    // 3. Footer-дегі жыл
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // 4. Құпиясөзді көрсету / жасыру
    document.querySelectorAll('.toggle-pass').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.textContent = show ? 'Жасыру' : 'Көрсету';
        });
    });
});

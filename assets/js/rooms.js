// =====================================================
// Бөлмелер каталогы: көрсету, іздеу, сүзу, сұрыптау
// Ескерту: әзірге деректер осы массивте тұр,
// кейін олар MySQL дерекқорынан PHP арқылы алынады
// =====================================================

const DORMS = {
    1: '№1 жатақхана',
    2: '№2 жатақхана',
    3: '№3 жатақхана'
};

const TYPES = {
    single: 'Бір орындық бөлме',
    double: 'Екі орындық бөлме',
    triple: 'Үш орындық бөлме',
    quad:   'Төрт орындық бөлме'
};

const rooms = [
    { dorm: 1, number: '101', floor: 1, type: 'double', capacity: 2, occupied: 1, price: 15000, status: 'available',   amenities: ['Wi-Fi', 'Жазу үстелі'] },
    { dorm: 1, number: '205', floor: 2, type: 'triple', capacity: 3, occupied: 3, price: 12000, status: 'available',   amenities: ['Wi-Fi'] },
    { dorm: 1, number: '312', floor: 3, type: 'single', capacity: 1, occupied: 0, price: 24000, status: 'available',   amenities: ['Wi-Fi', 'Жеке душ', 'Тоңазытқыш'] },
    { dorm: 2, number: '112', floor: 1, type: 'quad',   capacity: 4, occupied: 2, price: 10000, status: 'available',   amenities: ['Жазу үстелі'] },
    { dorm: 2, number: '208', floor: 2, type: 'double', capacity: 2, occupied: 0, price: 14000, status: 'maintenance', amenities: ['Wi-Fi', 'Балкон'] },
    { dorm: 2, number: '310', floor: 3, type: 'single', capacity: 1, occupied: 0, price: 25000, status: 'available',   amenities: ['Wi-Fi', 'Жеке душ', 'Тоңазытқыш', 'Кондиционер'] },
    { dorm: 3, number: '105', floor: 1, type: 'quad',   capacity: 4, occupied: 4, price: 9500,  status: 'available',   amenities: ['Жазу үстелі'] },
    { dorm: 3, number: '204', floor: 2, type: 'double', capacity: 2, occupied: 0, price: 16000, status: 'available',   amenities: ['Wi-Fi', 'Балкон'] },
    { dorm: 3, number: '301', floor: 3, type: 'triple', capacity: 3, occupied: 1, price: 13000, status: 'available',   amenities: ['Wi-Fi', 'Жазу үстелі', 'Кондиционер'] }
];

// DOM элементтері
const form       = document.getElementById('filters');
const grid       = document.getElementById('roomsGrid');
const countEl    = document.getElementById('count');
const emptyEl    = document.getElementById('empty');
const sortEl     = document.getElementById('sort');
const priceInput = document.getElementById('maxPrice');
const priceValue = document.getElementById('priceValue');

const formatPrice = (n) => n.toLocaleString('ru-RU') + ' ₸';
const freePlaces  = (room) => room.status === 'available' ? room.capacity - room.occupied : 0;

// Бір бөлменің карточкасын жасау
function roomCard(room) {
    const free = freePlaces(room);

    let badge;
    if (room.status === 'maintenance') badge = '<span class="badge badge-repair">Жөндеуде</span>';
    else if (free === 0)               badge = '<span class="badge badge-full">Орын жоқ</span>';
    else                               badge = `<span class="badge badge-free">Бос орын: ${free}</span>`;

    // Орындардың визуалды көрсеткіші (толған / бос)
    const places = Array.from({ length: room.capacity }, (_, i) =>
        `<span class="${i < room.occupied ? 'taken' : ''}"></span>`
    ).join('');

    const amenities = room.amenities.map(a => `<li>${a}</li>`).join('');

    const button = free > 0
        ? '<a href="login.html" class="btn btn-sm">Брондау</a>'
        : '<button class="btn btn-sm" disabled>Брондау</button>';

    return `
        <article class="room-card dorm-${room.dorm}">
            <div class="room-top">
                <span class="room-num">№${room.number}</span>
                ${badge}
            </div>
            <div class="room-body">
                <h3>${TYPES[room.type]}</h3>
                <p class="room-dorm">${DORMS[room.dorm]} · ${room.floor}-қабат</p>
                <div class="places" title="${room.occupied} / ${room.capacity} орын бос емес">${places}</div>
                <ul class="amenities">${amenities}</ul>
                <div class="room-foot">
                    <div class="price">${formatPrice(room.price)} <small>/ ай</small></div>
                    ${button}
                </div>
            </div>
        </article>`;
}

// Сүзу + сұрыптау + көрсету
function render() {
    const q         = form.elements.q.value.trim().toLowerCase();
    const dorm      = form.elements.dorm.value;
    const type      = form.elements.type.value;
    const maxPrice  = Number(priceInput.value);
    const onlyFree  = form.elements.onlyFree.checked;
    const amenities = Array.from(form.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value);

    priceValue.textContent = formatPrice(maxPrice);

    let result = rooms.filter(room =>
        (q === '' || room.number.includes(q) || room.amenities.some(a => a.toLowerCase().includes(q))) &&
        (dorm === '' || room.dorm === Number(dorm)) &&
        (type === '' || room.type === type) &&
        room.price <= maxPrice &&
        (!onlyFree || freePlaces(room) > 0) &&
        amenities.every(a => room.amenities.includes(a))
    );

    const sorters = {
        'number':     (a, b) => a.dorm - b.dorm || a.number.localeCompare(b.number),
        'price-asc':  (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'free':       (a, b) => freePlaces(b) - freePlaces(a)
    };
    result.sort(sorters[sortEl.value]);

    grid.innerHTML = result.map(roomCard).join('');
    countEl.textContent = result.length;
    emptyEl.classList.toggle('show', result.length === 0);
}

// Басты беттегі іздеу формасынан келген параметрлерді қолдану (?dorm=1&type=double)
const params = new URLSearchParams(location.search);
if (params.get('dorm')) form.elements.dorm.value = params.get('dorm');
if (params.get('type')) form.elements.type.value = params.get('type');

// Оқиғалар
form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('submit', (e) => e.preventDefault());
form.addEventListener('reset', () => setTimeout(render, 0));
sortEl.addEventListener('change', render);
document.getElementById('emptyReset').addEventListener('click', () => form.reset());

// Мобильді құрылғыда сүзгілер панелін ашу/жабу
document.getElementById('filtersToggle').addEventListener('click', () => {
    form.classList.toggle('open');
});

render();

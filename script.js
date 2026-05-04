/* ========================================
   Chez Léon — script.js
   Данные меню, корзина, отправка заказа
   ======================================== */

// === FORMSPREE ===
// Замени YOUR_FORM_ID на ID своей формы из Formspree.
// (Тот же ID должен стоять в index.html — атрибут action у <form>.)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkoyjany';

// ----------------------------------------
// Данные меню
// ----------------------------------------
const MENU = {
  entrees: [
    {
      id: 'perci',
      image: 'perci.jpg',
      name: 'Перцы запечённые',
      desc: 'Перцы, фарш, расплавленный сыр сверху. Подаётся горячим.',
      price: 2,
    },
  ],
  plats: [
    {
      id: 'pizza',
      image: 'picca.jpg',
      name: 'Пицца',
      desc: 'Тонкое тесто, томат, салями, красный лук под грилем.',
      price: 4,
    },
    {
      id: 'shaslik',
      image: 'shaslik.jpg',
      name: 'Шашлык',
      desc: 'Свинина, маринад на ночь, шесть шампуров на углях.',
      price: 5,
    },
    {
      id: 'ribs',
      image: 'rebra.jpg',
      name: 'Рёбра в глазури',
      desc: 'Свиные рёбра, медленный огонь, томатно-перечная глазурь. Мясо отходит от кости.',
      price: 5,
    },
    {
      id: 'steak-sandwich',
      image: 'steakssandwich.jpg',
      name: 'Стейк-сэндвич',
      desc: 'Багет, тонкие ломтики стейка, сыр, руккола.',
      price: 4,
    },
    {
      id: 'shaverma',
      image: 'shaverma.jpg',
      name: 'Шаверма',
      desc: 'Курица, тонкий лаваш, чесночный соус. Не церемонится.',
      price: 3,
    },
    {
      id: 'ramen',
      image: 'ramen.jpg',
      name: 'Рамен',
      desc: 'Лапша, мясной бульон, томлёное яйцо, нори, зелёный лук.',
      price: 4,
    },
    {
      id: 'burger',
      image: 'burger.jpg',
      name: 'Бургер',
      desc: 'Две котлеты, чеддер, бекон, маринованный огурец.',
      price: 4,
    },
    {
      id: 'lasagna',
      image: 'lazanja.jpg',
      name: 'Лазанья',
      desc: 'Болоньезе, бешамель, базилик. Запекается до пузырей.',
      price: 4,
    },
    {
      id: 'sushi',
      image: 'sushi.jpg',
      name: 'Запечённые суши',
      desc: 'Роллы с лососем под сыром, унаги-соус, кунжут.',
      price: 5,
    },
    {
      id: 'salmon',
      image: 'steajki.jpg',
      name: 'Лосось в сливочном соусе',
      desc: 'Стейки лосося, сливки, дижонская горчица.',
      price: 5,
    },
    {
      id: 'carbonara',
      image: 'carbonara.jpg',
      name: 'Карбонара',
      desc: 'Спагетти, гуанчале, желток, пармезан, перец. Без сливок.',
      price: 3,
    },
  ],
};

// ----------------------------------------
// Состояние
// ----------------------------------------
const cart = new Map(); // id -> { item, qty }

// ----------------------------------------
// DOM helpers
// ----------------------------------------
const $ = (sel) => document.querySelector(sel);

const els = {
  cartCount:    $('#cartCount'),
  cartButton:   $('#cartButton'),
  cartItems:    $('#cartItems'),
  cartTotalRow: $('#cartTotalRow'),
  cartTotal:    $('#cartTotal'),
  form:         $('#orderForm'),
  submitBtn:    $('#submitBtn'),
  formHint:     $('#formHint'),
  hiddenCmd:    $('#hiddenCommande'),
  hiddenTotal:  $('#hiddenTotal'),
  success:      $('#successMessage'),
  year:         $('#year'),
};

// ----------------------------------------
// Рендер: карточки меню
// ----------------------------------------
function renderMenu() {
  const map = [
    ['cat-entrees', MENU.entrees],
    ['cat-plats',   MENU.plats],
  ];
  for (const [containerId, items] of map) {
    const container = document.getElementById(containerId);
    if (!container) continue;
    container.innerHTML = items.map(dishCard).join('');
  }
  document.querySelectorAll('.dish__add').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

function dishCard(item) {
  return `
    <article class="dish" data-id="${item.id}">
      <div class="dish__photo">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <h4 class="dish__name">${item.name}</h4>
      <p class="dish__desc">${item.desc}</p>
      <div class="dish__footer">
        <span class="dish__price">${item.price} <span class="heart" aria-hidden="true">❤︎</span></span>
        <button type="button" class="dish__add" data-id="${item.id}" aria-label="Добавить ${item.name} в корзину">Добавить</button>
      </div>
    </article>
  `;
}

// ----------------------------------------
// Логика корзины
// ----------------------------------------
function findItem(id) {
  for (const list of Object.values(MENU)) {
    const found = list.find((d) => d.id === id);
    if (found) return found;
  }
  return null;
}

function addToCart(id) {
  const item = findItem(id);
  if (!item) return;
  const existing = cart.get(id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(id, { item, qty: 1 });
  }
  flashAddedButton(id);
  updateUI();
}

function changeQty(id, delta) {
  const entry = cart.get(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cart.delete(id);
  updateUI();
}

function removeFromCart(id) {
  cart.delete(id);
  updateUI();
}

function flashAddedButton(id) {
  const btn = document.querySelector(`.dish__add[data-id="${id}"]`);
  if (!btn) return;
  btn.classList.add('dish__add--added');
  btn.textContent = 'Добавлено ✦';
  setTimeout(() => {
    btn.classList.remove('dish__add--added');
    btn.textContent = 'Добавить';
  }, 900);
}

// ----------------------------------------
// Рендер: корзина
// ----------------------------------------
function updateUI() {
  const totalQty = Array.from(cart.values()).reduce((s, e) => s + e.qty, 0);
  const totalPrice = Array.from(cart.values()).reduce((s, e) => s + e.qty * e.item.price, 0);

  // Счётчик в навбаре
  if (totalQty > 0) {
    els.cartCount.textContent = String(totalQty);
    els.cartCount.hidden = false;
  } else {
    els.cartCount.hidden = true;
  }

  // Список заказа
  if (cart.size === 0) {
    els.cartItems.innerHTML = `<p class="cart__empty">Корзина пуста. Выбери что-нибудь из меню.</p>`;
    els.cartTotalRow.hidden = true;
  } else {
    els.cartItems.innerHTML = Array.from(cart.values()).map(cartRow).join('');
    els.cartTotalRow.hidden = false;
    els.cartTotal.textContent = String(totalPrice);

    // Привязка кнопок строк
    els.cartItems.querySelectorAll('[data-action]').forEach((btn) => {
      const { action, id } = btn.dataset;
      btn.addEventListener('click', () => {
        if (action === 'inc') changeQty(id, +1);
        else if (action === 'dec') changeQty(id, -1);
        else if (action === 'rm') removeFromCart(id);
      });
    });
  }

  // Состояние кнопки отправки
  const empty = cart.size === 0;
  els.submitBtn.disabled = empty;
  els.formHint.classList.toggle('order-form__hint--hidden', !empty);
}

function cartRow({ item, qty }) {
  const subtotal = item.price * qty;
  return `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__main">
        <img class="cart-item__thumb" src="${item.image}" alt="" loading="lazy" />
        <div>
          <div class="cart-item__name">${item.name}</div>
          <span class="cart-item__sub">${item.price} ❤︎ × ${qty}</span>
        </div>
      </div>
      <div class="cart-item__qty" role="group" aria-label="Количество ${item.name}">
        <button type="button" data-action="dec" data-id="${item.id}" aria-label="Убрать одну">−</button>
        <span aria-live="polite">${qty}</span>
        <button type="button" data-action="inc" data-id="${item.id}" aria-label="Добавить одну">+</button>
      </div>
      <div class="cart-item__end">
        <span class="cart-item__price">${subtotal} <span class="heart" aria-hidden="true">❤︎</span></span>
        <button type="button" class="cart-item__remove" data-action="rm" data-id="${item.id}" aria-label="Удалить ${item.name}">×</button>
      </div>
    </div>
  `;
}

// ----------------------------------------
// Отправка формы
// ----------------------------------------
function buildOrderSummary() {
  const lines = Array.from(cart.values()).map(({ item, qty }) => {
    return `• ${item.name} × ${qty} = ${item.price * qty} ❤︎`;
  });
  return lines.join('\n');
}

function buildOrderTotal() {
  return Array.from(cart.values()).reduce((s, e) => s + e.qty * e.item.price, 0);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (cart.size === 0) return;

  // Заполняем скрытые поля
  els.hiddenCmd.value = buildOrderSummary();
  els.hiddenTotal.value = String(buildOrderTotal()) + ' ❤︎';

  const form = els.form;
  const data = new FormData(form);

  // UI: блокируем кнопку, показываем «отправка»
  const originalLabel = els.submitBtn.textContent;
  els.submitBtn.disabled = true;
  els.submitBtn.textContent = 'Отправляем…';

  try {
    const action = form.getAttribute('action');
    const res = await fetch(action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      form.hidden = true;
      els.success.hidden = false;
      els.success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      let msg = 'Шеф не смог получить заказ. Попробуй ещё раз через минуту.';
      try {
        const json = await res.json();
        if (json && json.errors && json.errors.length) {
          msg = json.errors.map((x) => x.message).join(' · ');
        }
      } catch (_) {}
      alert(msg);
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = originalLabel;
    }
  } catch (err) {
    alert('Нет соединения. Проверь интернет и попробуй ещё раз.');
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = originalLabel;
  }
}

// ----------------------------------------
// Прочее
// ----------------------------------------
function wireCartButton() {
  els.cartButton.addEventListener('click', () => {
    const target = document.getElementById('commander');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setYear() {
  if (els.year) els.year.textContent = new Date().getFullYear();
}

// ----------------------------------------
// Init
// ----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  updateUI();
  wireCartButton();
  setYear();
  els.form.addEventListener('submit', handleSubmit);
});

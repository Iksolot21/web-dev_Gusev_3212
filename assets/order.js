import LocalStorageService from './localStorage.js';

document.addEventListener('DOMContentLoaded', () => {
  const fullOrder = LocalStorageService.getFullOrder();

  if (fullOrder && !isEmptyOrder(fullOrder)) {
    displayOrderSummary(fullOrder);
  } else {
    document.getElementById('orderSummary').innerHTML = '<p><b>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</b></p>';
  }

  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
});

function isEmptyOrder(order) {
  return Object.values(order).every(item => !item);
}

function displayOrderSummary(fullOrder) {
  const orderSummary = document.getElementById('orderSummary');
  const totalPriceDisplay = document.createElement('div');
  totalPriceDisplay.className = 'total-price';

  let totalPrice = 0;

  const categories = {
    soup: 'Суп',
    main: 'Основное блюдо',
    drink: 'Напиток',
    salad: 'Салат',
    dessert: 'Десерт'
  };

  orderSummary.innerHTML = '<h2>Состав заказа</h2>';

  Object.entries(categories).forEach(([category, categoryTitle]) => {
    const dish = fullOrder[category];

    if (dish) {
      const orderSection = document.createElement('div');
      orderSection.className = 'order-section';

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = categoryTitle;
      orderSection.appendChild(sectionTitle);

      const cardsContainer = document.createElement('div');
      cardsContainer.id = `${category}Cards`;
      cardsContainer.className = 'cards-container';

      const card = createDishCard(dish, category);
      cardsContainer.appendChild(card);

      orderSection.appendChild(cardsContainer);
      orderSummary.appendChild(orderSection);

      totalPrice += dish.price;
    }
  });

  totalPriceDisplay.innerHTML = `<h3>Итого: <span id="totalPriceDisplay">${totalPrice}</span> ₽</h3>`;
  orderSummary.appendChild(totalPriceDisplay);
}

function createDishCard(dish, category) {
  const card = document.createElement('div');
  card.className = 'dish-card';
  console.log('Путь к изображению:', dish.image);
  card.innerHTML = `
    <img src="${dish.image || 'https://via.placeholder.com/100'}" alt="${dish.name}">
    <div class="dish-card-info">
      <h3>${dish.name}</h3>
      <p>${dish.price} ₽</p>
      <button class="remove-dish" data-category="${category}">Удалить</button>
    </div>
  `;

  const removeButton = card.querySelector('.remove-dish');
  removeButton.addEventListener('click', () => removeDish(category, card));

  return card;
}

function removeDish(category, cardElement) {
  const fullOrder = LocalStorageService.getFullOrder();

  fullOrder[category] = null;
  LocalStorageService.saveFullOrder(fullOrder);

  const orderSection = cardElement.closest('.order-section');
  orderSection.remove();

  const totalPrice = calculateTotalPrice(fullOrder);
  document.getElementById('totalPriceDisplay').textContent = totalPrice;

  if (isEmptyOrder(fullOrder)) {
    window.location.href = 'lunch.html';
  }
}

function calculateTotalPrice(order) {
  return Object.keys(order)
    .filter(key => key !== 'totalPrice')
    .reduce((total, category) => total + (order[category]?.price || 0), 0);
}

function handleOrderSubmit(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('nameInput').value,
    phone: document.getElementById('phoneInput').value,
    email: document.getElementById('emailInput').value,
    order: LocalStorageService.getFullOrder()
  };

  // Пример отправки данных на сервер при помощи fetch
  fetch('url-to-server-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при отправке заказа на сервер');
      }
      // Успешная отправка, очистить localStorage
      LocalStorageService.clearFullOrder();
      alert('Заказ успешно оформлен!');
      window.location.href = 'lunch.html';
    })
    .catch(error => {
      alert('Произошла ошибка при отправке заказа: ' + error.message);
    });
}

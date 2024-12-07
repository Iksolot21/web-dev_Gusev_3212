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
  console.log('Отображаем заказ:', fullOrder); // Отладка

  const orderSummary = document.getElementById('orderSummary');
  orderSummary.innerHTML = ''; // Очищаем перед добавлением

  if (isEmptyOrder(fullOrder)) {
    orderSummary.innerHTML = '<p><b>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</b></p>';
    return;
  }

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

  // Пересчитываем и удаляем totalPrice, если нужно
  fullOrder.totalPrice = calculateTotalPrice(fullOrder);
  if (isEmptyOrder(fullOrder)) {
    delete fullOrder.totalPrice;
  }

  LocalStorageService.saveFullOrder(fullOrder);

  const orderSection = cardElement.closest('.order-section');
  orderSection.remove();

  const totalPrice = calculateTotalPrice(fullOrder);
  const totalPriceDisplay = document.getElementById('totalPriceDisplay');
  if (totalPriceDisplay) {
    totalPriceDisplay.textContent = totalPrice;
  }

  if (isEmptyOrder(fullOrder)) {
    window.location.href = 'order.html';
  }
}

function calculateTotalPrice(order) {
  return Object.keys(order)
    .filter(key => key !== 'totalPrice')
    .reduce((total, category) => total + (order[category]?.price || 0), 0);
}

function handleOrderSubmit(event) {
  event.preventDefault();

  const formElement = document.getElementById('orderForm');
  const formData = new FormData(formElement);

  // Добавляем данные из LocalStorage
  const fullOrder = LocalStorageService.getFullOrder();

  // Проверка наличия блюд
  if (isEmptyOrder(fullOrder)) {
    alert('Пожалуйста, сначала выберите блюда');
    return;
  }

  // Добавляем только существующие блюда
  if (fullOrder.soup && fullOrder.soup.id) {
    formData.append('soup_id', fullOrder.soup.id);
  }
  if (fullOrder.main && fullOrder.main.id) {
    formData.append('main_course_id', fullOrder.main.id);
  }
  if (fullOrder.salad && fullOrder.salad.id) {
    formData.append('salad_id', fullOrder.salad.id);
  }
  if (fullOrder.drink && fullOrder.drink.id) {
    formData.append('drink_id', fullOrder.drink.id);
  }
  if (fullOrder.dessert && fullOrder.dessert.id) {
    formData.append('dessert_id', fullOrder.dessert.id);
  }

  console.log('Отправляем данные:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const apiKey = "51b2819e-4751-42cf-b166-e18bf8f957cb";

  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${apiKey}`, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Ошибка при оформлении заказа');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Ваш заказ успешно оформлен! Спасибо!');
      LocalStorageService.clearFullOrder();
    })
    .catch(error => {
      console.error('Ошибка при отправке заказа:', error);
      alert(`Произошла ошибка: ${error.message}`);
    });
}


function validateOrder(data) {
  const requiredFields = [
    'full_name',
    'email',
    'phone',
    'delivery_address',
    'delivery_type',
    'delivery_time',
    'soup_id',
    'main_course_id',
    'salad_id',
    'drink_id',
    'dessert_id'
  ];

  return requiredFields.every(field => {
    // Проверяем, что поле существует и не является null или пустой строкой
    return data[field] !== undefined && data[field] !== null && data[field] !== '';
  });
}

// Добавляем обработчик на отправку формы
document.addEventListener('DOMContentLoaded', () => {
  const fullOrder = LocalStorageService.getFullOrder();

  if (fullOrder && !isEmptyOrder(fullOrder)) {
    displayOrderSummary(fullOrder);
  } else {
    document.getElementById('orderSummary').innerHTML = '<p><b>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</b></p>';
  }
});
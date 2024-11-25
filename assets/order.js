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

  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    order: LocalStorageService.getFullOrder()
  };

  // Пример отправки данных на сервер при помощи fetch
  fetch('http://api.allorigins.win/get?url=https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb', {
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

  // Получаем данные из localStorage и формы
  function handleOrderSubmit(event) {
    event.preventDefault();

    const fullOrder = LocalStorageService.getFullOrder();
    if (!fullOrder || isEmptyOrder(fullOrder)) {
      alert('Ваш заказ пуст. Пожалуйста, выберите блюда перед оформлением.');
      return;
    }

    // Собираем данные из формы
    const formData = {
      full_name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subscribe: document.querySelector('input[name="subscribe"]').checked ? 1 : 0,
      phone: document.getElementById('phone').value,
      delivery_address: document.getElementById('address').value,
      delivery_type: document.querySelector('input[name="delivery_time"]:checked').value,
      delivery_time: document.getElementById('time').value,
      comment: document.getElementById('comments').value || '',
      soup_id: fullOrder.soup?.id || null,
      main_course_id: fullOrder.main?.id || null,
      salad_id: fullOrder.salad?.id || null,
      drink_id: fullOrder.drink?.id || null,
      dessert_id: fullOrder.dessert?.id || null,
    };

    // Проверяем данные перед отправкой
    if (!validateOrder(formData)) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    // Отправка данных
    fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData).toString(),
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
        LocalStorageService.clearFullOrder(); // Очищаем заказ в localStorage
        window.location.href = 'lunch.html'; // Возвращаем пользователя на главную
      })
      .catch(error => {
        alert(`Произошла ошибка: ${error.message}`);
      });
  }

  // Проверка заполненности формы
  function validateOrder(data) {
    const requiredFields = ['full_name', 'email', 'phone', 'delivery_address', 'delivery_type', 'soup_id', 'main_course_id', 'salad_id', 'drink_id', 'dessert_id'];
    return requiredFields.every(field => data[field]);
  }

  // Добавляем обработчик на отправку формы
  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);

}


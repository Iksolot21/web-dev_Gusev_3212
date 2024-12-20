import LocalStorageService from './localStorage.js';

let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;


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
  const cardsDisplay = document.getElementById('cards-display');

  // Очищаем содержимое перед обновлением
  orderSummary.innerHTML = '';
  cardsDisplay.innerHTML = '';

  if (isEmptyOrder(fullOrder)) {
    // Если заказ пустой, отображаем сообщение
    orderSummary.innerHTML = '<p><b>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</b></p>';
    cardsDisplay.innerHTML = '<p></p><p>Добавьте блюда, чтобы они появились здесь.</p>';
    return;
  }

  let totalPrice = 0;
  const categories = {
    soup: 'Суп',
    main: 'Основное блюдо',
    drink: 'Напиток',
    salad: 'Салат',
    dessert: 'Десерт'
  };

  // Обрабатываем категории и добавляем элементы в интерфейс
  Object.entries(categories).forEach(([category, categoryTitle]) => {
    const dish = fullOrder[category];
    if (dish) {
      // Создаём карточку и добавляем её в верхний контейнер
      const cardForDisplay = createDishCard(dish, category);
      cardsDisplay.appendChild(cardForDisplay);

      // Добавляем информацию в состав заказа
      const orderSection = document.createElement('div');
      orderSection.className = 'order-section';

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = `${categoryTitle}`;
      orderSection.appendChild(sectionTitle);

      const dishInfo = document.createElement('p');
      dishInfo.textContent = `${dish.name} ${dish.price} ₽`;
      orderSection.appendChild(dishInfo);

      orderSummary.appendChild(orderSection);

      totalPrice += dish.price;
    }
  });

  if (totalPrice > 0) {
    const totalPriceDisplay = document.createElement('div');
    totalPriceDisplay.className = 'total-price';
    totalPriceDisplay.innerHTML = `<h3>Итого: <span id="totalPriceDisplay">${totalPrice}</span> ₽</h3>`;
    orderSummary.appendChild(totalPriceDisplay);
  } else {
    orderSummary.innerHTML = '<p><b>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</b></p>';
    cardsDisplay.innerHTML = '<p></p><p>Добавьте блюда, чтобы они появились здесь.</p>';
  }
}


function calculateTotalPrice(fullOrder) {
  let totalPrice = 0;

  const categories = ['soup', 'main', 'drink', 'salad', 'dessert'];

  categories.forEach(category => {
    const dish = fullOrder[category];
    if (dish) {
      totalPrice += dish.price;
    }
  });

  return totalPrice;
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

function removeDish(category) {
  const fullOrder = LocalStorageService.getFullOrder();

  // Удаляем выбранное блюдо из данных заказа
  fullOrder[category] = null;

  // Пересчитываем общую стоимость
  const totalPrice = calculateTotalPrice(fullOrder);

  // Сохраняем обновленный заказ
  LocalStorageService.saveFullOrder(fullOrder);

  // Обновляем отображение только текущей карточки
  const cardToRemove = document.querySelector(`.dish-card[data-category="${category}"]`);
  if (cardToRemove) {
    cardToRemove.remove(); // Удаляем карточку из DOM
  }

  // Обновляем состав заказа
  displayOrderSummary(fullOrder);

  // Проверяем, если все карточки удалены, отображаем сообщение
  if (isEmptyOrder(fullOrder)) {
    const cardsDisplay = document.getElementById('cards-display');
    cardsDisplay.innerHTML = '<p></p><p>Добавьте блюда, чтобы они появились здесь.</p>';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', handleOrderSubmit);
});

function handleOrderSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const subscribeCheckbox = form.querySelector('input[name="subscribe"]');
  const subscribeValue = subscribeCheckbox ? subscribeCheckbox.checked : false;
  // Получаем выбранный тип доставки
  const deliveryType = form.querySelector('input[name="delivery_type"]:checked');

  if (!deliveryType) {
    alert('Выберите тип доставки.');
    return;
  }

  // Учитываем время доставки
  const deliveryTime = form.querySelector('#delivery_time').value;

  if (deliveryType.value === 'by_time' && !deliveryTime) {
    alert('Укажите время доставки для варианта "К указанному времени".');
    return;
  }

  if (deliveryType.value === 'now' && deliveryTime) {
    alert('Время доставки не требуется для варианта "Как можно скорее". Уберите его.');
    return;
  }


  const fullOrder = LocalStorageService.getFullOrder();

  // Установка выбранных блюд в соответствующие переменные
  selectedSoup = fullOrder.soup;
  selectedMain = fullOrder.main;
  selectedDrink = fullOrder.drink;
  selectedSalad = fullOrder.salad;
  selectedDessert = fullOrder.dessert;

  const comboError = validateCombo();
  if (comboError) {
    alert(comboError);
    return;
  }

  const commentValue = document.getElementById('comment').value;

  // Создаем объект с данными заказа
  const orderData = {
    full_name: form.querySelector('#full_name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    subscribe: subscribeValue,
    phone: form.querySelector('#phone').value.trim(),
    delivery_address: form.querySelector('#delivery_address').value.trim(),
    delivery_type: deliveryType.value,
    delivery_time: deliveryType.value === 'by_time' ? deliveryTime : '',
    soup_id: fullOrder.soup ? fullOrder.soup.id : '',
    main_course_id: fullOrder.main ? fullOrder.main.id : '',
    salad_id: fullOrder.salad ? fullOrder.salad.id : '',
    drink_id: fullOrder.drink ? fullOrder.drink.id : '',
    dessert_id: fullOrder.dessert ? fullOrder.dessert.id : '',
    comment: commentValue,
  };

  console.log('JSON данных заказа:', orderData);

  const formData = new FormData();
  for (const key in orderData) {
    formData.append(key, orderData[key]);
  }

  console.log('FormData для отправки:', formData);

  const apiKey = "51b2819e-4751-42cf-b166-e18bf8f957cb";
  const apiUrl = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${apiKey}`;

  fetch(apiUrl, {
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
      console.log('Комментарий:', commentValue);
      LocalStorageService.clearFullOrder();
    })
    .catch(error => {
      console.error('Ошибка при отправке заказа:', error);
      alert(`Произошла ошибка: ${error.message}`);
    });
}

function validateCombo(fullOrder) {
  const hasAnySelection = selectedSoup || selectedMain || selectedDrink || selectedSalad || selectedDessert;

  if (!hasAnySelection) {
    return "Ничего не выбрано. Выберите блюда для заказа";
  }

  const hasDrink = selectedDrink !== null;

  if (!hasDrink && (selectedMain || selectedSoup || selectedSalad)) {
    return "Выберите напиток";
  }

  if (selectedSoup && !selectedMain && !selectedSalad) {
    return "Выберите главное блюдо/салат/стартер";
  }

  if (selectedSalad && !selectedSoup && !selectedMain) {
    return "Выберите суп или главное блюдо";
  }

  const validCombinations = [
    selectedSoup && selectedMain && selectedSalad && selectedDrink,     // Полный комплекс
    selectedSoup && selectedMain && selectedDrink && !selectedSalad,    // Суп + основное + напиток
    selectedSoup && selectedSalad && selectedDrink && !selectedMain,    // Суп + салат + напиток
    selectedMain && selectedSalad && selectedDrink && !selectedSoup,    // Основное + салат + напиток
    selectedMain && selectedDrink && !selectedSoup && !selectedSalad    // Основное + напиток
  ];

  return validCombinations.some(combo => combo) ? "" : "Неверная комбинация блюд";
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

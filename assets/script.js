// Загруженные блюда
let dishes = [];
const baseImageUrl = 'http://example.com/images/';

// Состояние выбранных блюд
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;

// Текущие фильтры
const currentFilters = {
  soup: 'all',        // Фильтр для супов. Значение 'all' означает, что все блюда из этой категории отображаются без фильтрации.
  main: 'all', // Фильтр для основных блюд. Также по умолчанию показываются все блюда.
  drink: 'all',        // Фильтр для напитков.
  salad: 'all',        // Фильтр для салатов.
  dessert: 'all'       // Фильтр для десертов.
};

// Добавляем стили для уведомлений
const notificationStyles = `
.notification {
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: white;
padding: 20px;
border-radius: 8px;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
z-index: 1000;
text-align: center;
min-width: 300px;
}

.notification button {
margin-top: 15px;
padding: 8px 20px;
background: #4CAF50;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
transition: all 0.3s ease;
}

.notification button:hover {
background: white;
color: #4CAF50;
border: 1px solid #4CAF50;
}

.overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
z-index: 999;
}`;

// Добавляем стили на страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Функция для загрузки данных о блюдах с API
async function loadDishes() {
  try {
    const response = await fetch('http://lab7-api.std-900.ist.mospolytech.ru/api/dishes');
    const data = await response.json();
    console.log('Загруженные блюда:', data);
    dishes = data;
    displayAllDishes(); // Отображаем все блюда при первой загрузке
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

// Функция для отображения всех блюд
function displayAllDishes() {
  // Обновляем все категории
  const categories = ['soup', 'main-course', 'drink', 'salad', 'dessert'];
  categories.forEach(category => displayDishes(category, 'all'));
}

// Функция для отображения блюд по категории и фильтру
// Функция для отображения блюд по категории и фильтру
function displayDishes(category, kind = 'all') {
  const container = document.getElementById(`${category}-list`);

  if (!container) {
    console.error(`Контейнер с id ${category}-list не найден!`);
    return; // Если контейнер не найден, выходим из функции
  }

  container.innerHTML = ''; // Очищаем контейнер перед отображением новых данных

  // Если фильтр уже установлен на текущий вид фильтра (kind), сбрасываем его на 'all'
  if (currentFilters[category] === kind) {
    currentFilters[category] = 'all'; // Сбрасываем фильтр на 'all'
  } else {
    currentFilters[category] = kind; // Устанавливаем выбранный фильтр
  }

  // Фильтруем блюда по категории и выбранному фильтру
  let filteredDishes = dishes.filter(dish => dish.category === category)
    .filter(dish => currentFilters[category] === 'all' || dish.kind === currentFilters[category]);

  filteredDishes = sortDishesAlphabetically(filteredDishes);

  // Отображаем отфильтрованные блюда
  filteredDishes.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
<img src="${baseImageUrl + dish.image}" alt="${dish.name}">
<h3>${dish.name}</h3>
<p class="price">${dish.price}₽</p>
<p class="weight">${dish.count}</p>
<button data-dish="${dish.keyword}" onclick="addToOrder('${dish.keyword}')">Добавить</button>
`;
    container.appendChild(dishBlock);
  });

  updateFilterButtons(category);
}

// Функция для сортировки блюд по алфавиту
function sortDishesAlphabetically(dishes) {
  return dishes.sort((a, b) => a.name.localeCompare(b.name));
}

// Функция для обновления кнопок фильтрации
function updateFilterButtons(category) {
  const filterButtons = document.querySelectorAll(`#filters-${category} .filter-btn`);
  filterButtons.forEach(button => {
    if (button.dataset.kind === currentFilters[category]) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Функция для обработки добавления блюда в заказ
function addToOrder(dishKeyword) {
  const dish = dishes.find(d => d.keyword === dishKeyword);

  if (!dish) return;

  // Обновляем выбранные блюда
  switch (dish.category) {
    case 'soup':
      selectedSoup = dish;
      break;
    case 'main-course':
      selectedMain = dish;
      break;
    case 'drink':
      selectedDrink = dish;
      break;
    case 'salad':
      selectedSalad = dish;
      break;
    case 'dessert':
      selectedDessert = dish;
      break;
  }

  // Обновляем видимость заказа
  updateOrderVisibility();
}

function updateOrderVisibility() {
  const orderSummary = document.getElementById('order-summary');
  const orderForm = document.getElementById('order-form');  // Форма для отображения заказа

  const hasAnySelection = selectedSoup || selectedMain || selectedDrink || selectedSalad || selectedDessert;

  // Если ничего не выбрано, показываем сообщение
  if (!hasAnySelection) {
    orderSummary.innerHTML = '<p><b>Ничего не выбрано</b></p>';
    orderForm.innerHTML = '';  // Очищаем форму
    return;
  }

  const totalPrice = calculateTotalPrice();
  orderSummary.innerHTML = `
    <p><b>Суп</b></p>
    <p>${selectedSoup ? selectedSoup.name + ' - ' + selectedSoup.price + '₽' : 'Суп не выбран'}</p>

    <p><b>Главное блюдо</b></p>
    <p>${selectedMain ? selectedMain.name + ' - ' + selectedMain.price + '₽' : 'Блюдо не выбрано'}</p>

    <p><b>Напиток</b></p>
    <p>${selectedDrink ? selectedDrink.name + ' - ' + selectedDrink.price + '₽' : 'Напиток не выбран'}</p>

    <p><b>Салат или стартер</b></p>
    <p>${selectedSalad ? selectedSalad.name + ' - ' + selectedSalad.price + '₽' : 'Салат не выбран'}</p>

    <p><b>Десерт</b></p>
    <p>${selectedDessert ? selectedDessert.name + ' - ' + selectedDessert.price + '₽' : 'Десерт не выбран'}</p>

    <p><b>Стоимость заказа</b></p>
    <p><span id="order-price">${totalPrice}₽</span></p>
  `;

  // Обновление формы
  orderForm.innerHTML = `
    <h3>Ваш заказ:</h3>
    <p><b>Суп:</b> ${selectedSoup ? selectedSoup.name + ' - ' + selectedSoup.price + '₽' : 'Не выбран'}</p>
    <p><b>Главное блюдо:</b> ${selectedMain ? selectedMain.name + ' - ' + selectedMain.price + '₽' : 'Не выбрано'}</p>
    <p><b>Напиток:</b> ${selectedDrink ? selectedDrink.name + ' - ' + selectedDrink.price + '₽' : 'Не выбран'}</p>
    <p><b>Салат:</b> ${selectedSalad ? selectedSalad.name + ' - ' + selectedSalad.price + '₽' : 'Не выбран'}</p>
    <p><b>Десерт:</b> ${selectedDessert ? selectedDessert.name + ' - ' + selectedDessert.price + '₽' : 'Не выбран'}</p>

    <button type="submit" id="submitOrderButton">Отправить заказ</button>
  `;
}

function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  selectedSalad = null;
  selectedDessert = null;

  updateOrderVisibility();
}

// Функция для валидации выбора в заказе
function validateCombo() {
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
    selectedSoup && selectedMain && selectedSalad && selectedDrink,
    selectedSoup && selectedMain && selectedDrink && !selectedSalad,
    selectedSoup && selectedSalad && selectedDrink && !selectedMain,
    selectedMain && selectedSalad && selectedDrink && !selectedSoup,
    selectedMain && selectedDrink && !selectedSoup && !selectedSalad
  ];

  return validCombinations.some(combo => combo) ? "" : "Неверная комбинация блюд";
}

function showNotification(message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const notification = document.createElement('div');
  notification.className = 'notification';

  notification.innerHTML = `
    <p>${message}</p>
    <button>Окей👌</button>
  `;

  const button = notification.querySelector('button');
  button.addEventListener('click', () => {
    overlay.remove();
    notification.remove();
  });

  document.body.appendChild(overlay);
  document.body.appendChild(notification);
}

// Добавление обработчиков событий для фильтров
function addFilterEventListeners() {
  const categories = ['soup', 'main-course', 'drink', 'salad', 'dessert'];

  categories.forEach(category => {
    const filterButtons = document.querySelectorAll(`#filters-${category} .filter-btn`);

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const kind = button.dataset.kind;
        displayDishes(category, kind); // Отображаем блюда с новым фильтром
      });
    });
  });
}
function calculateTotalPrice() {
  let totalPrice = 0;

  // Проверяем, если блюдо выбрано, добавляем его цену
  if (selectedSoup) {
    totalPrice += selectedSoup.price;
  }

  if (selectedMain) {
    totalPrice += selectedMain.price;
  }

  if (selectedDrink) {
    totalPrice += selectedDrink.price;
  }

  if (selectedSalad) {
    totalPrice += selectedSalad.price;
  }

  if (selectedDessert) {
    totalPrice += selectedDessert.price;
  }

  return totalPrice;
}

// Инициализация страницы
function initializePage() {
  loadDishes();
  addFilterEventListeners();

  // Добавляем обработчик для формы заказа
  document.querySelector('form.custom-detail').addEventListener('submit', (event) => {
    event.preventDefault();
    const validationMessage = validateCombo();
    if (validationMessage) {
      showNotification(validationMessage);
    } else {
      console.log('Форма валидна, можно отправлять');
    }
  });

  // Обработчик для сброса заказа
  document.getElementById('resetOrderButton').addEventListener('click', resetOrder);
}

// Запуск страницы
window.onload = initializePage;
window.displayDishes = displayDishes;
window.addToOrder = addToOrder;
window.resetOrder = resetOrder;
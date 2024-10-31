import { dishes } from './dishes.js';

// Состояние выбранных блюд
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;

const currentFilters = {
  soup: 'all',
  main: 'all',
  drink: 'all',
  salad: 'all',
  dessert: 'all'
};

// Добавляем стили для уведомления
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

function calculateTotalPrice() {
  return (
    (selectedSoup?.price || 0) +
    (selectedMain?.price || 0) +
    (selectedDrink?.price || 0) +
    (selectedSalad?.price || 0) +
    (selectedDessert?.price || 0)
  );
}

function updateOrderVisibility() {
  const orderSummary = document.getElementById('order-summary');
  const hasAnySelection = selectedSoup || selectedMain || selectedDrink || selectedSalad || selectedDessert;

  if (!hasAnySelection) {
    orderSummary.innerHTML = '<p><b>Ничего не выбрано</b></p>';
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
}

function addToOrder(dishKeyword) {
  const dish = dishes.find(d => d.keyword === dishKeyword);
  if (!dish) return;

  switch (dish.category) {
    case 'soup':
      selectedSoup = dish;
      break;
    case 'main':
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

  updateOrderVisibility();
}

function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  selectedSalad = null;
  selectedDessert = null;

  updateOrderVisibility();
}

// Функция проверки валидности комбо
function validateCombo() {
  // Проверяем есть ли хоть что-то выбрано
  const hasAnySelection = selectedSoup || selectedMain || selectedDrink ||
    selectedSalad || selectedDessert;

  if (!hasAnySelection) {
    return "Ничего не выбрано. Выберите блюда для заказа";
  }

  // Проверяем наличие напитка
  const hasDrink = selectedDrink !== null;
  if (!hasDrink && (selectedMain || selectedSoup || selectedSalad)) {
    return "Выберите напиток";
  }

  // Проверяем комбинации с супом
  if (selectedSoup && !selectedMain && !selectedSalad) {
    return "Выберите главное блюдо/салат/стартер";
  }

  // Проверяем комбинации с салатом
  if (selectedSalad && !selectedSoup && !selectedMain) {
    return "Выберите суп или главное блюдо";
  }

  // Проверяем базовые требования
  if ((selectedDrink || selectedDessert) && !selectedMain) {
    return "Выберите главное блюдо";
  }

  // Проверяем валидные комбинации
  const validCombinations = [
    // Комбо 1: Суп + Главное + Салат + Напиток
    selectedSoup && selectedMain && selectedSalad && selectedDrink,
    // Комбо 2: Суп + Главное + Напиток
    selectedSoup && selectedMain && selectedDrink && !selectedSalad,
    // Комбо 3: Суп + Салат + Напиток
    selectedSoup && selectedSalad && selectedDrink && !selectedMain,
    // Комбо 4: Главное + Салат + Напиток
    selectedMain && selectedSalad && selectedDrink && !selectedSoup,
    // Комбо 5: Главное + Напиток
    selectedMain && selectedDrink && !selectedSoup && !selectedSalad
  ];

  return validCombinations.some(combo => combo) ? "" : "Неверная комбинация блюд";
}

// Функция создания и показа уведомления
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

function displayDishes(category, kind) {
  const container = document.getElementById(`${category}-list`);
  container.innerHTML = '';

  if (currentFilters[category] === kind) {
    currentFilters[category] = 'all';
  } else {
    currentFilters[category] = kind;
  }

  let filteredDishes = dishes.filter(dish => dish.category === category)
    .filter(dish => currentFilters[category] === 'all' || dish.kind === currentFilters[category]);

  filteredDishes = sortDishesAlphabetically(filteredDishes);

  filteredDishes.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p class="price">${dish.price}₽</p>
      <p class="weight">${dish.count}</p>
      <button data-dish="${dish.keyword}" onclick="addToOrder('${dish.keyword}')">Добавить</button>
    `;
    container.appendChild(dishBlock);
  });

  updateFilterButtons(category);
}

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

function sortDishesAlphabetically(dishes) {
  return dishes.sort((a, b) => a.name.localeCompare(b.name));
}

function initializePage() {
  displayDishes('soup', 'all');
  displayDishes('main', 'all');
  displayDishes('drink', 'all');
  displayDishes('salad', 'all');
  displayDishes('dessert', 'all');

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      const category = this.closest('section').id.replace('filters-', '');
      const kind = this.dataset.kind;
      displayDishes(category, kind);
    });
  });

  // Добавляем обработчик отправки формы
  document.querySelector('form.custom-detail').addEventListener('submit', function (event) {
    event.preventDefault();
    const validationMessage = validateCombo();

    if (validationMessage) {
      showNotification(validationMessage);
    } else {
      // Если валидация прошла успешно, можно отправлять форму
      // this.submit();
      console.log('Форма валидна, можно отправлять');
    }
  });

  // Добавляем обработчик для кнопки сброса заказа
  document.getElementById('resetOrderButton').addEventListener('click', resetOrder);

  updateOrderVisibility();
}

window.onload = initializePage;
window.displayDishes = displayDishes;
window.addToOrder = addToOrder;
window.resetOrder = resetOrder;
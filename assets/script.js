import { dishes } from './dishes.js'; // Импортируем массив с блюдами

// Переменные для хранения выбранных блюд
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;

// Объект для хранения текущего состояния фильтров
const currentFilters = {
  soup: 'all',
  main: 'all',
  drink: 'all',
  salad: 'all',
  dessert: 'all'
};

// Функция для добавления блюда в заказ
function addToOrder(dishKeyword) {
  const dish = dishes.find(d => d.keyword === dishKeyword);
  if (!dish) return;

  // Проверяем категорию и добавляем выбранное блюдо в соответствующую переменную
  switch (dish.category) {
    case 'soup':
      selectedSoup = dish;
      document.getElementById('order-soup').textContent = `${dish.name} - ${dish.price}₽`;
      break;
    case 'main':
      selectedMain = dish;
      document.getElementById('order-main').textContent = `${dish.name} - ${dish.price}₽`;
      break;
    case 'drink':
      selectedDrink = dish;
      document.getElementById('order-drink').textContent = `${dish.name} - ${dish.price}₽`;
      break;
    case 'salad':
      selectedSalad = dish;
      document.getElementById('order-salad').textContent = `${dish.name} - ${dish.price}₽`;
      break;
    case 'dessert':
      selectedDessert = dish;
      document.getElementById('order-dessert').textContent = `${dish.name} - ${dish.price}₽`;
      break;
    default:
      break;
  }

  // Обновляем общую стоимость заказа
  updateOrderPrice();
}

// Функция для обновления стоимости заказа
function updateOrderPrice() {
  const totalPrice =
    (selectedSoup?.price || 0) +
    (selectedMain?.price || 0) +
    (selectedDrink?.price || 0) +
    (selectedSalad?.price || 0) +
    (selectedDessert?.price || 0);

  document.getElementById('order-price').textContent = `${totalPrice}₽`;
}

// Функция для сброса заказа
function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  selectedSalad = null;
  selectedDessert = null;

  // Сбрасываем тексты в интерфейсе
  document.textContent = 'Ничего не выбрано';
  document.getElementById('order-main').textContent = 'Ничего не выбрано';
  document.getElementById('order-drink').textContent = 'Ничего не выбрано';
  document.getElementById('order-salad').textContent = 'Ничего не выбрано';
  document.getElementById('order-dessert').textContent = 'Ничего не выбрано';

  // Сбрасываем общую стоимость
  document.getElementById('order-price').textContent = '0₽';
}

// Функция для отображения блюд на странице
function displayDishes(category, kind) {
  const container = document.getElementById(`${category}-list`);
  container.innerHTML = '';

  // Обновляем текущий фильтр
  if (currentFilters[category] === kind) {
    // Если фильтр уже применен, сбрасываем его
    currentFilters[category] = 'all';
  } else {
    // Иначе применяем новый фильтр
    currentFilters[category] = kind;
  }

  // Функция для отображения блюд
  const renderDishes = (dishes) => {
    dishes.forEach(dish => {
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
  };

  // Фильтрация блюд по типу
  const filteredDishes = dishes.filter(dish => dish.category === category)
    .filter(dish => currentFilters[category] === 'all' || dish.kind === currentFilters[category]);

  // Отображаем отфильтрованные блюда в соответствующем контейнере
  renderDishes(filteredDishes);
  console.log(`Фильтрация по категории: ${category}, тип: ${currentFilters[category]}`);

  // Обновляем внешний вид кнопок фильтра
  updateFilterButtons(category);
}

// Функция для обновления внешнего вида кнопок фильтра
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

// ... (остальной код остается без изменений)

// Функция инициализации страницы
function initializePage() {
  // Отображаем все блюда при загрузке страницы
  displayDishes('soup', 'all');
  displayDishes('main', 'all');
  displayDishes('drink', 'all');
  displayDishes('salad', 'all');
  displayDishes('dessert', 'all');

  // Добавляем обработчики событий для кнопок фильтра
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      const category = this.closest('section').id.replace('filters-', '');
      const kind = this.dataset.kind;
      displayDishes(category, kind);
    });
  });
}

// Вызываем функцию инициализации при загрузке страницы
window.onload = initializePage;

window.displayDishes = displayDishes;
window.addToOrder = addToOrder;
window.resetOrder = resetOrder;
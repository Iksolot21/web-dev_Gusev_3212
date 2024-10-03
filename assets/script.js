import { dishes } from './dishes.js'; // Импортируем массив с блюдами

// Переменные для хранения выбранных блюд
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;

// Функция для сортировки блюд по категории
function sortDishesByCategory() {
  const soups = dishes.filter(dish => dish.category === 'soup').sort((a, b) => a.name.localeCompare(b.name));
  const mains = dishes.filter(dish => dish.category === 'main').sort((a, b) => a.name.localeCompare(b.name));
  const drinks = dishes.filter(dish => dish.category === 'drink').sort((a, b) => a.name.localeCompare(b.name));

  return { soups, mains, drinks };
}

// Функция для отображения блюд на странице
function displayDishes() {
  const soupContainer = document.getElementById('soup-list');
  const mainContainer = document.getElementById('main-list');
  const drinkContainer = document.getElementById('drink-list');

  // Получаем отсортированные блюда
  const { soups, mains, drinks } = sortDishesByCategory();

  // Очистка контейнеров перед добавлением новых элементов
  soupContainer.innerHTML = '';
  mainContainer.innerHTML = '';
  drinkContainer.innerHTML = '';

  // Отображаем отсортированные супы
  soups.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p class="price">${dish.price}₽</p>
      <p class="weight">${dish.count}</p>
      <button data-dish="${dish.keyword}" onclick="addToOrder('${dish.keyword}')">Добавить</button>
    `;
    soupContainer.appendChild(dishBlock);
  });

  // Отображаем отсортированные основные блюда
  mains.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p class="price">${dish.price}₽</p>
      <p class="weight">${dish.count}</p>
      <button data-dish="${dish.keyword}" onclick="addToOrder('${dish.keyword}')">Добавить</button>
    `;
    mainContainer.appendChild(dishBlock);
  });

  // Отображаем отсортированные напитки
  drinks.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p class="price">${dish.price}₽</p>
      <p class="weight">${dish.count}</p>
      <button data-dish="${dish.keyword}" onclick="addToOrder('${dish.keyword}')">Добавить</button>
    `;
    drinkContainer.appendChild(dishBlock);
  });
}

// Функция для добавления блюда в заказ
function addToOrder(keyword) {
  const dish = dishes.find(d => d.keyword === keyword);

  if (dish.category === 'soup') {
    selectedSoup = dish;
  } else if (dish.category === 'main') {
    selectedMain = dish;
  } else if (dish.category === 'drink') {
    selectedDrink = dish;
  }

  updateOrderSummary();
}

// Функция для обновления информации о заказе
function updateOrderSummary() {
  const orderSummary = document.getElementById('order-summary');

  if (!selectedSoup && !selectedMain && !selectedDrink) {
    orderSummary.innerHTML = '<p><strong>Ничего не выбрано</strong></p>';
  } else {
    const soupText = selectedSoup ? `${selectedSoup.name} ${selectedSoup.price}₽` : 'Ничего не выбрано';
    const mainText = selectedMain ? `${selectedMain.name} ${selectedMain.price}₽` : 'Ничего не выбрано';
    const drinkText = selectedDrink ? `${selectedDrink.name} ${selectedDrink.price}₽` : 'Ничего не выбрано';

    const totalPrice = (selectedSoup?.price || 0) + (selectedMain?.price || 0) + (selectedDrink?.price || 0);

    orderSummary.innerHTML = `
      <p>Суп: ${soupText}</p>
      <p>Главное блюдо: ${mainText}</p>
      <p>Напиток: ${drinkText}</p>
      <p>Стоимость заказа: ${totalPrice}₽</p>
    `;
  }
}

// Функция для сброса заказа
function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  updateOrderSummary();
}

// Инициализация страницы
updateOrderSummary();
displayDishes();
window.addToOrder = addToOrder;
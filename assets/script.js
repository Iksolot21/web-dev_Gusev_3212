import { dishes } from './dishes.js'; // Импортируем массив с блюдами

// Переменные для хранения выбранных блюд
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;

// Функция для сортировки блюд по категориям
function sortDishesByCategory() {
  const soups = dishes.filter(dish => dish.category === 'soup').sort((a, b) => a.name.localeCompare(b.name));
  const mains = dishes.filter(dish => dish.category === 'main').sort((a, b) => a.name.localeCompare(b.name));
  const drinks = dishes.filter(dish => dish.category === 'drink').sort((a, b) => a.name.localeCompare(b.name));
  const salads = dishes.filter(dish => dish.category === 'salad').sort((a, b) => a.name.localeCompare(b.name));
  const desserts = dishes.filter(dish => dish.category === 'dessert').sort((a, b) => a.name.localeCompare(b.name));

  return { soups, mains, drinks, salads, desserts };
}

// Функция для отображения блюд на странице
function displayDishes(kind = 'all', category = 'all') {
  const soupContainer = document.getElementById('soup-list');
  const mainContainer = document.getElementById('main-list');
  const drinkContainer = document.getElementById('drink-list');
  const saladContainer = document.getElementById('salad-list');
  const dessertContainer = document.getElementById('dessert-list');

  // Получаем отсортированные блюда
  const { soups, mains, drinks, salads, desserts } = sortDishesByCategory();

  // Очистка контейнеров перед добавлением новых элементов
  soupContainer.innerHTML = '';
  mainContainer.innerHTML = '';
  drinkContainer.innerHTML = '';
  saladContainer.innerHTML = '';
  dessertContainer.innerHTML = '';

  // Функция для отображения блюд
  const renderDishes = (container, dishes) => {
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

  // Отображаем блюда в зависимости от категории и kind
  if (category === 'soup') renderDishes(soupContainer, soups.filter(dish => kind === 'all' || dish.kind === kind));
  else if (category === 'main') renderDishes(mainContainer, mains.filter(dish => kind === 'all' || dish.kind === kind));
  else if (category === 'drink') renderDishes(drinkContainer, drinks.filter(dish => kind === 'all' || dish.kind === kind));
  else if (category === 'salad') renderDishes(saladContainer, salads.filter(dish => kind === 'all' || dish.kind === kind));
  else if (category === 'dessert') renderDishes(dessertContainer, desserts.filter(dish => kind === 'all' || dish.kind === kind));
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
  } else if (dish.category === 'salad') {
    selectedSalad = dish;
  } else if (dish.category === 'dessert') {
    selectedDessert = dish;
  }

  updateOrderSummary();
}

// Функция для обновления информации о заказе
function updateOrderSummary() {
  const orderSummary = document.getElementById('order-summary');

  if (!selectedSoup && !selectedMain && !selectedDrink && !selectedSalad && !selectedDessert) {
    orderSummary.innerHTML = '<p><strong>Ничего не выбрано</strong></p>';
  } else {
    const soupText = selectedSoup ? `${selectedSoup.name} ${selectedSoup.price}₽` : 'Суп не выбран';
    const mainText = selectedMain ? `${selectedMain.name} ${selectedMain.price}₽` : 'Блюдо не выбрано';
    const drinkText = selectedDrink ? `${selectedDrink.name} ${selectedDrink.price}₽` : 'Напиток не выбран';
    const saladText = selectedSalad ? `${selectedSalad.name} ${selectedSalad.price}₽` : 'Салат не выбран';
    const dessertText = selectedDessert ? `${selectedDessert.name} ${selectedDessert.price}₽` : 'Десерт не выбран';

    const totalPrice = (selectedSoup?.price || 0) + (selectedMain?.price || 0) + (selectedDrink?.price || 0) + (selectedSalad?.price || 0) + (selectedDessert?.price || 0);

    orderSummary.innerHTML = `
      <p><b>Суп</b></p>
      <p>${soupText}</p>
      <p><b>Главное блюдо</b></p>
      <p>${mainText}</p>
      <p><b>Напиток</b></p>
      <p>${drinkText}</p>
      <p><b>Салат</b></p>
      <p>${saladText}</p>
      <p><b>Десерт</b></p>
      <p>${dessertText}</p>
      <p><b>Стоимость заказа</b></p>
      <p>${totalPrice}₽</p>
    `;
  }
}

// Функция для сброса заказа
function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  selectedSalad = null;
  selectedDessert = null;
  updateOrderSummary();
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
  displayDishes(); // Отображаем все блюда по умолчанию
  updateOrderSummary();
  window.addToOrder = addToOrder;
  window.resetOrder = resetOrder;
});

// Обработчики событий для фильтров
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', function () {
    const category = this.parentElement.id.replace('filters-', ''); // Получаем категорию из ID родительского элемента
    const kind = this.dataset.kind; // Получаем kind из data-атрибута кнопки
    displayDishes(kind, category); // Фильтруем и отображаем блюда
  });
});

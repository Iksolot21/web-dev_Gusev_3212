import { dishes } from './dishes.js';

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

  console.log(`Фильтрация по категории: ${category}, тип: ${currentFilters[category]}`);
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

  updateOrderVisibility();
}

window.onload = initializePage;
window.displayDishes = displayDishes;
window.addToOrder = addToOrder;
window.resetOrder = resetOrder;
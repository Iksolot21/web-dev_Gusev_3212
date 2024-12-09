import LocalStorageService from './localStorage.js';

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
    }
`;

// Создание элемента style и добавление стилей в <head>
const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);

let dishes = [];
let selectedSoup = null;
let selectedMain = null;
let selectedDrink = null;
let selectedSalad = null;
let selectedDessert = null;

const orderPanel = document.getElementById('order-panel');
const orderPanelPrice = document.getElementById('order-panel-price');
const orderPanelLink = document.getElementById('order-panel-link');

const currentFilters = {
  soup: 'all',
  main: 'all',
  drink: 'all',
  salad: 'all',
  dessert: 'all'
};

const resetButton = document.getElementById('order-panel-reset');
resetButton.addEventListener('click', resetOrder);
function resetOrder() {
  selectedSoup = null;
  selectedMain = null;
  selectedDrink = null;
  selectedSalad = null;
  selectedDessert = null;

  LocalStorageService.clearOrder(); // Предполагается, что будет метод для очистки данных из локального хранилища

  updateOrderPanel();
  displayAllDishes(); // Показать все блюда заново после сброса
}

async function loadDishes() {
  try {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    dishes = await response.json();
    displayAllDishes();
    setupFilterButtons();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.closest('section').id.replace('filters-', '').replace('-section', '');
      const kind = button.dataset.kind;

      // Проверяем текущее состояние кнопки
      const isActive = button.classList.contains('active');

      // Сброс активных состояний для всех кнопок в текущей категории
      const categoryButtons = document.querySelectorAll(`#${button.closest('section').id} .filter-btn`);
      categoryButtons.forEach(btn => btn.classList.remove('active'));

      // Если кнопка уже была активной, удаляем класс 'active' (иначе добавляем)
      if (!isActive) {
        button.classList.add('active');
      }

      displayDishes(category, kind);
    });
  });
}


function displayAllDishes() {
  const categories = ['soup', 'main-course', 'drink', 'salad', 'dessert'];
  categories.forEach(category => displayDishes(category, 'all'));
}

function displayDishes(category, kind = 'all') {
  const container = document.getElementById(`${category}-list`);
  if (!container) return;

  container.innerHTML = '';
  currentFilters[category.replace('-course', '')] = currentFilters[category.replace('-course', '')] === kind ? 'all' : kind;

  let filteredDishes = dishes
    .filter(dish => dish.category === category)
    .filter(dish => currentFilters[category.replace('-course', '')] === 'all' || dish.kind === currentFilters[category.replace('-course', '')])
    .sort((a, b) => a.name.localeCompare(b.name));

  filteredDishes.forEach(dish => {
    const dishBlock = document.createElement('div');
    dishBlock.classList.add('dish-block');
    dishBlock.innerHTML = `
      <img src="${dish.image || 'https://via.placeholder.com/150'}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p class="price">${dish.price}₽</p>
      <button onclick="addToOrder('${dish.keyword}')">Добавить</button>
    `;
    container.appendChild(dishBlock);
  });
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
    selectedSoup && selectedMain && selectedSalad && selectedDrink,     // Полный комплекс
    selectedSoup && selectedMain && selectedDrink && !selectedSalad,    // Суп + основное + напиток
    selectedSoup && selectedSalad && selectedDrink && !selectedMain,    // Суп + салат + напиток
    selectedMain && selectedSalad && selectedDrink && !selectedSoup,    // Основное + салат + напиток
    selectedMain && selectedDrink && !selectedSoup && !selectedSalad    // Основное + напиток
  ];

  return validCombinations.some(combo => combo) ? "" : "Неверная комбинация блюд";
}

function addToOrder(dishKeyword) {
  const dish = dishes.find(d => d.keyword === dishKeyword);
  if (!dish) return;

  switch (dish.category) {
    case 'soup':
      selectedSoup = dish;
      LocalStorageService.updateOrderDish('soup', dish);
      break;
    case 'main-course':
      selectedMain = dish;
      LocalStorageService.updateOrderDish('main', dish);
      break;
    case 'drink':
      selectedDrink = dish;
      LocalStorageService.updateOrderDish('drink', dish);
      break;
    case 'salad':
      selectedSalad = dish;
      LocalStorageService.updateOrderDish('salad', dish);
      break;
    case 'dessert':
      selectedDessert = dish;
      LocalStorageService.updateOrderDish('dessert', dish);
      break;
  }

  updateOrderPanel();
}

function updateOrderPanel() {
  const totalPrice = calculateTotalPrice();
  orderPanelPrice.textContent = `${totalPrice}₽`;

  const hasAnySelection = selectedSoup || selectedMain || selectedSalad || selectedDessert || selectedDrink;

  if (hasAnySelection) {
    orderPanel.style.display = 'block';
    orderPanelLink.disabled = false;
    orderPanelLink.addEventListener('click', proceedToOrder);
  } else {
    orderPanel.style.display = 'none';
  }
}


function proceedToOrder() {
  console.log('Процесс оформления заказа начат');
  const validationMessage = validateCombo();

  if (validationMessage) {
    showNotification(validationMessage);
    return;
  }
  const fullOrder = {
    soup: selectedSoup ? {
      id: selectedSoup.id,
      name: selectedSoup.name,
      price: selectedSoup.price,
      keyword: selectedSoup.keyword,
      image: selectedSoup.image
    } : null,
    main: selectedMain ? {
      id: selectedMain.id,
      name: selectedMain.name,
      price: selectedMain.price,
      keyword: selectedMain.keyword,
      image: selectedMain.image
    } : null,
    drink: selectedDrink ? {
      id: selectedDrink.id,
      name: selectedDrink.name,
      price: selectedDrink.price,
      keyword: selectedDrink.keyword,
      image: selectedDrink.image
    } : null,
    salad: selectedSalad ? {
      id: selectedSalad.id,
      name: selectedSalad.name,
      price: selectedSalad.price,
      keyword: selectedSalad.keyword,
      image: selectedSalad.image
    } : null,
    dessert: selectedDessert ? {
      id: selectedDessert.id,
      name: selectedDessert.name,
      price: selectedDessert.price,
      keyword: selectedDessert.keyword,
      image: selectedDessert.image
    } : null,
    totalPrice: calculateTotalPrice()
  };


  LocalStorageService.saveFullOrder(fullOrder);
  window.location.href = 'order.html';
}

function calculateTotalPrice() {
  return (selectedSoup?.price || 0) +
    (selectedMain?.price || 0) +
    (selectedDrink?.price || 0) +
    (selectedSalad?.price || 0) +
    (selectedDessert?.price || 0);
}

window.onload = loadDishes;
window.addToOrder = addToOrder;


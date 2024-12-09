
loadDishDetails();
loadOrderDetails();
// Modify the initial fetch to sort orders by date
document.addEventListener('DOMContentLoaded', () => {
  const ordersTableBody = document.getElementById('ordersTableBody');
  fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb')
    .then(response => response.json())
    .then(async (data) => {
      const orders = data || [];

      // Sort orders by created_at in descending order (newest first)
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Нет заказов для отображения.</td></tr>';
        return;
      }

      // Process orders with dish names and prices
      for (const order of orders) {
        const row = document.createElement('tr');

        // Fetch dish names
        const soupName = getDish(order.soup_id) != null ? getDish(order.soup_id).name : "";;
        const mainCourseName = getDish(order.main_course_id) != null ? getDish(order.main_course_id).name : "";;
        const drinkName = getDish(order.drink_id) != null ? getDish(order.drink_id).name : "";;
        const saladName = getDish(order.salad_id) != null ? getDish(order.salad_id).name : "";
        const dessertName = getDish(order.dessert_id) != null ? getDish(order.dessert_id).name : "";

        // Calculate total price
        const totalPrice = await calculateOrderPrice(order);

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${new Date(order.created_at).toLocaleString()}</td>
            <td>
              ${[
            soupName,
            mainCourseName,
            drinkName,
            saladName,
            dessertName
          ]
            .filter(dish => dish && dish !== 'Не выбрано')
            .join(', ')}
            </td>
            <td class="text-right">${totalPrice}₽</td>
          <td>${order.delivery_time ? order.delivery_time : 'Как можно скорее<br>(с 07:00 до 23:00)'}</td>
            <td class="btn-container">
    <button onclick="viewOrderDetails(${order.id})">👁️</button>
    <button onclick="editOrder(${order.id})">✏️</button>
    <button onclick="confirmDeleteOrder(${order.id})">❌</button>
  </td>
          `;
        ordersTableBody.appendChild(row);
      }
    })
    .catch(error => {
      console.error('Ошибка при получении заказов для таблицы:', error);
      ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Произошла ошибка при загрузке данных.</td></tr>';
    });
});


// Function to calculate total order price
async function calculateOrderPrice(order) {
  const dishIds = [
    order.soup_id,
    order.main_course_id,
    order.drink_id,
    order.salad_id,
    order.dessert_id
  ].filter(Boolean);

  // Используем Set для уникальных блюд и их цен
  const uniqueDishes = new Set();
  let totalPrice = 0;

  for (const dishId of dishIds) {
    const dish = getDish(dishId)
    totalPrice += dish.price || 0;
    uniqueDishes.add(dishId);
  }
  return totalPrice;
}


function perebor(id) {
  if (id == null) {
    return "Не выбрано"
  }
  let dish = getDish(id)
  return { name: dish.name || 'Не выбрано', price: dish.price || 0 };
}

// Функция для открытия модального окна с деталями заказа

async function viewOrderDetails(orderId) {
  const order = getOrder(orderId);
  // 3. Получение данных всех блюд заказа
  const soup = perebor(order.soup_id);
  const mainCourse = perebor(order.main_course_id);
  const drink = perebor(order.drink_id);
  const salad = perebor(order.salad_id);
  const dessert = perebor(order.dessert_id);

  // 4. Состав заказа для отображения в модальном окне
  const dishes = [
    { category: 'Суп', ...soup },
    { category: 'Основное блюдо', ...mainCourse },
    { category: 'Напиток', ...drink },
    { category: 'Салат', ...salad },
    { category: 'Десерт', ...dessert },
  ];

  // 5. Расчет итоговой стоимости
  const totalPrice = dishes.reduce((sum, dish) => sum + (dish.price || 0), 0);


  // 6. Отображение атрибутов заказа в модальном окне
  // Обновление атрибутов заказа в модальном окне просмотра
  document.getElementById('viewOrderDate').textContent = `Дата оформления: ${new Date(order.created_at).toLocaleDateString()}`;
  document.getElementById('viewOrderFullName').textContent = `Имя получателя: ${order.full_name}`;
  document.getElementById('viewOrderEmail').textContent = `Email: ${order.email}`;
  document.getElementById('viewOrderPhone').textContent = `Телефон: ${order.phone}`;
  document.getElementById('viewOrderAddress').textContent = `Адрес доставки: ${order.delivery_address}`;
  document.getElementById('viewOrderDeliveryTime').textContent = `Время доставки: ${order.delivery_time || 'Как можно скорее (с 07:00 до 23:00) '}`;
  document.getElementById('viewOrderComment').textContent = `Комментарий: ${order.comment || 'Отсутствует'}`;

  // 7. Обновление списка блюд в модальном окне
  const orderItemsList = document.getElementById('orderItemsView');
  orderItemsList.innerHTML = ''; // Очистка списка
  dishes.forEach(dish => {
    if (dish.name && dish.name !== 'Не выбрано') {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${dish.category}:</strong> ${dish.name} (${dish.price}₽)`;
      orderItemsList.appendChild(listItem);
    }
  });

  // 8. Отображение итоговой стоимости
  const totalPriceElement = document.getElementById('totalPriceView');
  totalPriceElement.textContent = `Итоговая стоимость: ${totalPrice}₽`;

  // 9. Открытие модального окна для просмотра заказа
  openModal('viewOrderModal');
}

let dishes = [];
let orders = [];

async function loadDishDetails() {
  try {
    const dishesResponse = await fetch("https://edu.std-900.ist.mospolytech.ru/labs/api/dishes?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb");
    dishes = await dishesResponse.json();
    console.log("Dishes loaded:", dishes);
  } catch (error) {
    console.error("Error loading dishes:", error);
  }
}

async function loadOrderDetails() {
  try {
    const ordersResponse = await fetch("https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb");
    orders = await ordersResponse.json();
    console.log("orders loaded:", orders);
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

function getDish(dishId) {
  return dishes.find(dish => dish.id === dishId);
}

function getOrder(orderId) {
  return orders.find(order => order.id === orderId);
}

// Функция для открытия модального окна
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

// Функция для закрытия модального окна
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}


async function editOrder(orderId) {
  // 1. Получение данных заказа
  const order = getOrder(orderId);

  // 2. Заполнение данных в форме редактирования
  document.getElementById('editFullName').value = order.full_name;
  document.getElementById('editEmail').value = order.email;
  document.getElementById('editPhone').value = order.phone;
  document.getElementById('editAddress').value = order.delivery_address;
  document.getElementById('delivery_time').value = order.delivery_time || '';

  document.getElementById('editComment').value = order.comment || '';
  window.editOrderId = orderId;
  const orderDate = new Date(order.created_at);
  const formattedOrderDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
  document.getElementById('editOrderDate').textContent = `Дата оформления: ${formattedOrderDate}`;
  // Отображение времени доставки, если оно указано
  if (order.delivery_time) {
    document.getElementById('delivery_time').value = order.delivery_time;
  } else {
    document.getElementById('delivery_time').value = '';
  }

  // 4. Получение данных всех блюд заказа
  const soup = perebor(order.soup_id);
  const mainCourse = perebor(order.main_course_id);
  const drink = perebor(order.drink_id);

  // 5. Состав заказа для отображения в модальном окне
  const dishes = [
    { category: 'Суп', ...soup },
    { category: 'Основное блюдо', ...mainCourse },
    { category: 'Напиток', ...drink }
  ];

  // 6. Обновление списка блюд в модальном окне редактирования
  const orderItemsList = document.getElementById('orderItems2');
  orderItemsList.innerHTML = ''; // Очистка списка
  dishes.forEach(dish => {
    if (dish.name && dish.name !== 'Не выбрано') {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${dish.category}:</strong> ${dish.name} (${dish.price}₽)`;
      orderItemsList.appendChild(listItem);
    }
  });

  // 7. Расчет итоговой стоимости
  const totalPrice = dishes.reduce((sum, dish) => sum + dish.price, 0);

  // 8. Отображение итоговой стоимости
  const totalPriceElement = document.getElementById('totalPrice2');
  totalPriceElement.textContent = `Итоговая стоимость: ${totalPrice}₽`;

  // 9. Открытие модального окна для редактирования заказа
  openModal('orderEditModal');
}



// Функция для сохранения изменений в заказе
function saveEditedOrder(event) {
  event.preventDefault();

  const editedOrder = new FormData(); // Используем FormData для формирования данных

  editedOrder.append('full_name', document.getElementById('editFullName').value);
  editedOrder.append('email', document.getElementById('editEmail').value);
  editedOrder.append('phone', document.getElementById('editPhone').value);
  editedOrder.append('delivery_address', document.getElementById('editAddress').value);
  editedOrder.append('comment', document.getElementById('editComment').value);

  // Отправка PUT запроса с использованием FormData
  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${window.editOrderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`, {
    method: 'PUT',
    body: editedOrder // Передаем объект FormData в теле запроса
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Произошла ошибка при сохранении изменений заказа');
      }
      return response.json();
    })
    .then(data => {
      alert('Заказ успешно изменен');
      closeModal('orderEditModal');
      location.reload();
    })
    .catch(error => {
      console.error('Ошибка при сохранении изменений заказа:', error);
      alert('Произошла ошибка при сохранении изменений заказа');
    });
}

// Функция для подтверждения удаления заказа
function confirmDeleteOrder(orderId) {
  window.deleteOrderId = orderId;
  openModal('deleteConfirmationModal');
}

// Функция для удаления заказа
function deleteOrder() {
  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${window.deleteOrderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      alert('Заказ удален');
      closeModal('deleteConfirmationModal');
      location.reload();
    })
    .catch(error => {
      console.error('Ошибка при удалении заказа:', error);
      alert('Произошла ошибка при удалении заказа');
    });
}

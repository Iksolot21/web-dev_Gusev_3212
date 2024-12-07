document.addEventListener('DOMContentLoaded', () => {
  const ordersTableBody = document.getElementById('ordersTableBody');

  fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb')
    .then(response => response.json())
    .then(async (data) => {
      const orders = data || [];

      if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6">Нет заказов для отображения.</td></tr>';
        return;
      }

      // Process orders with dish names and prices
      for (const order of orders) {
        const row = document.createElement('tr');

        // Fetch dish names
        const soupName = await fetchDishName(order.soup_id);
        const mainCourseName = await fetchDishName(order.main_course_id);
        const drinkName = await fetchDishName(order.drink_id);
        const saladName = await fetchDishName(order.salad_id);
        const dessertName = await fetchDishName(order.dessert_id);

        // Calculate total price
        const totalPrice = await calculateOrderPrice(order);

        row.innerHTML = `
  <td>${order.id}</td>
  <td>${new Date(order.created_at).toLocaleDateString()}</td>
  <td>
    ${[
            soupName,
            mainCourseName,
            drinkName,
            saladName,
            dessertName
          ]
            .filter(dish => dish && dish !== 'Не выбрано')  // Фильтруем только те блюда, которые существуют и не являются "Не выбрано"
            .join(', ')}
  </td>
  <td class="text-right">${totalPrice}₽</td>
  <td>${order.delivery_time}</td>
  <td>
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
      ordersTableBody.innerHTML = '<tr><td colspan="6">Произошла ошибка при загрузке данных.</td></tr>';
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
    try {
      if (!uniqueDishes.has(dishId)) {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes/${dishId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
        if (response.ok) {
          const dish = await response.json();
          totalPrice += dish.price || 0;
          uniqueDishes.add(dishId); // Добавляем id блюда в Set, чтобы избежать дублирования
        }
      }
    } catch (error) {
      console.warn(`Ошибка расчета цены для блюда ${dishId}:`, error);
    }
  }

  return totalPrice;
}
// Function to fetch dish details
async function fetchDishName(dishId) {
  if (!dishId) return 'Не выбрано';

  try {
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes/${dishId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
    if (!response.ok) return 'Блюдо недоступно';
    const dish = await response.json();
    console.log(`Данные блюда:`, dish);
    return dish.name || 'Блюдо без названия';
  } catch (error) {
    console.warn(`Ошибка загрузки блюда ${dishId}:`, error);
    return 'Ошибка загрузки';
  }
}

// Функция для открытия модального окна с деталями заказа
async function viewOrderDetails(orderId) {
  try {
    // 1. Получение данных заказа
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
    const order = await response.json();

    // 2. Функция для получения названия блюда с ценой
    const fetchDishDetails = async (dishId) => {
      if (!dishId) return { name: 'Не выбрано', price: 0 };
      try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes/${dishId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
        if (response.ok) {
          const dish = await response.json();
          return { name: dish.name || 'Не выбрано', price: dish.price || 0 };
        } else {
          throw new Error(`Ошибка HTTP! статус: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Ошибка загрузки данных блюда ${dishId}:`, error);
        return { name: 'Ошибка загрузки', price: 0 };
      }
    };

    // 3. Получение данных всех блюд заказа
    const soup = await fetchDishDetails(order.soup_id);
    const mainCourse = await fetchDishDetails(order.main_course_id);
    const drink = await fetchDishDetails(order.drink_id);
    const salad = await fetchDishDetails(order.salad_id);
    const dessert = await fetchDishDetails(order.dessert_id);

    // 4. Состав заказа для отображения в модальном окне
    const dishes = [
      { category: 'Суп', ...soup },
      { category: 'Основное блюдо', ...mainCourse },
      { category: 'Напиток', ...drink },
      { category: 'Салат', ...salad },
      { category: 'Десерт', ...dessert },
    ];

    // 5. Расчет итоговой стоимости
    const totalPrice = dishes.reduce((sum, dish) => sum + dish.price, 0);

    // 6. Отображение атрибутов заказа в модальном окне
    // Обновление атрибутов заказа в модальном окне просмотра
    document.getElementById('viewOrderDate').textContent = `Дата оформления: ${new Date(order.created_at).toLocaleDateString()}`;
    document.getElementById('viewOrderFullName').textContent = `Имя получателя: ${order.full_name}`;
    document.getElementById('viewOrderEmail').textContent = `Email: ${order.email}`;
    document.getElementById('viewOrderPhone').textContent = `Телефон: ${order.phone}`;
    document.getElementById('viewOrderAddress').textContent = `Адрес доставки: ${order.delivery_address}`;
    document.getElementById('viewOrderDeliveryTime').textContent = `Время доставки: ${order.delivery_time || 'Не указано'}`;
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
  } catch (error) {
    console.error('Ошибка при загрузке данных заказа для просмотра:', error);
    alert('Произошла ошибка при загрузке данных заказа для просмотра');
  }
}

// Функция для загрузки данных о блюде по его ID
function loadDishDetails(dishId, dishCategory) {
  // Пропускаем, если id пустой
  if (!dishId) return;

  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes/${dishId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }
      return response.json();
    })
    .then(dish => {
      const orderItemsList = document.getElementById('orderItems');
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${dishCategory}:</strong> ${dish.name || 'Блюдо без названия'} (${dish.price || 'Цена не указана'}₽)`;
      orderItemsList.appendChild(listItem);
    })
    .catch(error => {
      console.warn(`Ошибка загрузки деталей для ${dishCategory}:`, error);
      const orderItemsList = document.getElementById('orderItems');
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${dishCategory}:</strong> Не удалось загрузить детали блюда`;
      orderItemsList.appendChild(listItem);
    });
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
  try {
    // 1. Получение данных заказа
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
    const order = await response.json();

    // 2. Заполнение данных в форме редактирования
    document.getElementById('editFullName').value = order.full_name;
    document.getElementById('editEmail').value = order.email;
    document.getElementById('editPhone').value = order.phone;
    document.getElementById('editAddress').value = order.delivery_address;
    document.getElementById('editDeliveryTime').value = order.delivery_time || '';
    document.getElementById('editComment').value = order.comment || '';
    window.editOrderId = orderId;
    const orderDate = new Date(order.created_at);
    const formattedOrderDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
    document.getElementById('editOrderDate').textContent = `Дата оформления: ${formattedOrderDate}`;

    // Отображение времени доставки, если оно указано
    if (order.delivery_time) {
      document.getElementById('editDeliveryTime').textContent = ` ${order.delivery_time}`;
    } else {
      document.getElementById('editDeliveryTime').textContent = '';
    }

    // 3. Функция для получения названия блюда с ценой
    const fetchDishDetails = async (dishId) => {
      if (!dishId) return { name: 'Не выбрано', price: 0 };
      try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes/${dishId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`);
        if (response.ok) {
          const dish = await response.json();
          return { name: dish.name || 'Не выбрано', price: dish.price || 0 };
        } else {
          throw new Error(`Ошибка HTTP! статус: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Ошибка загрузки данных блюда ${dishId}:`, error);
        return { name: 'Ошибка загрузки', price: 0 };
      }
    };

    // 4. Получение данных всех блюд заказа
    const soup = await fetchDishDetails(order.soup_id);
    const mainCourse = await fetchDishDetails(order.main_course_id);
    const drink = await fetchDishDetails(order.drink_id);

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

  } catch (error) {
    console.error('Ошибка при редактировании заказа:', error);
    alert('Произошла ошибка при загрузке данных для редактирования');
  }
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
      closeModal('viewOrderModal'); // Закрыть модальное окно просмотра
      location.reload();
      viewOrderDetails(window.editOrderId);
      editOrder(window.editOrderId);
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

document.addEventListener('DOMContentLoaded', () => {
  const ordersTableBody = document.getElementById('ordersTableBody');

  // Запрос на сервер для получения всех заказов и отображение в таблице
  fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb')
    .then(response => response.json())
    .then(data => {
      const orders = data.orders; // Предполагается, что заказы содержатся в поле 'orders' ответа

      if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6">Нет заказов для отображения.</td></tr>';
        return;
      }

      // Отображаем каждый заказ в таблице
      orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order.id}</td>
          <td>${new Date(order.created_at).toLocaleDateString()}</td>
          <td>
            <ul>
              <li>Суп: ${order.soup.name}</li>
              <li>Основное блюдо: ${order.main.name}</li>
              <li>Напиток: ${order.drink.name}</li>
              <li>Салат: ${order.salad.name}</li>
              <li>Десерт: ${order.dessert.name}</li>
            </ul>
          </td>
          <td>${order.totalPrice} ₽</td>
          <td>${order.delivery_time}</td>
          <td>
            <button onclick="viewOrderDetails(${order.id})">👁️</button>
            <button onclick="editOrder(${order.id})">✏️</button>
            <button onclick="confirmDeleteOrder(${order.id})">❌</button>
          </td>
        `;
        ordersTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Ошибка при получении заказов для таблицы:', error);
      ordersTableBody.innerHTML = '<tr><td colspan="6">Произошла ошибка при загрузке данных.</td></tr>';
    });
});

// Функция для просмотра деталей заказа
function viewOrderDetails(orderId) {
  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`)
    .then(response => response.json())
    .then(order => {
      const orderDetailsContainer = document.getElementById('orderDetails');
      orderDetailsContainer.innerHTML = `
        <p>Заказ №${order.id}</p>
        <p>Дата: ${new Date(order.created_at).toLocaleDateString()}</p>
        <p>Состав: </p>
        <ul>
          <li>Суп: ${order.soup.name}</li>
          <li>Основное блюдо: ${order.main.name}</li>
          <li>Напиток: ${order.drink.name}</li>
          <li>Салат: ${order.salad.name}</li>
          <li>Десерт: ${order.dessert.name}</li>
        </ul>
        <p>Стоимость: ${order.totalPrice} ₽</p>
        <p>Время доставки: ${order.delivery_time}</p>
        <p>Комментарий: ${order.comment}</p>
        <p>Адрес доставки: ${order.delivery_address}</p>
      `;
      openModal('orderDetailsModal');
    })
    .catch(error => {
      console.error('Ошибка при получении деталей заказа:', error);
      alert('Произошла ошибка при получении деталей заказа');
    });
}

// Функция для редактирования заказа
function editOrder(orderId) {
  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`)
    .then(response => response.json())
    .then(order => {
      document.getElementById('editFullName').value = order.full_name;
      document.getElementById('editEmail').value = order.email;
      document.getElementById('editPhone').value = order.phone;
      document.getElementById('editAddress').value = order.delivery_address;
      window.editOrderId = orderId;
      openModal('orderEditModal');
    })
    .catch(error => {
      console.error('Ошибка при получении данных для редактирования:', error);
      alert('Произошла ошибка при получении данных для редактирования');
    });
}

// Функция для сохранения изменений в заказе
function saveEditedOrder(event) {
  event.preventDefault();

  const editedOrder = {
    full_name: document.getElementById('editFullName').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
    delivery_address: document.getElementById('editAddress').value
  };

  fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${window.editOrderId}?api_key=51b2819e-4751-42cf-b166-e18bf8f957cb`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(editedOrder)
  })
    .then(response => response.json())
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

// Функция для открытия модальных окон
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

// Функция для закрытия модальных окон
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

const LocalStorageService = {
  ORDER_KEY: 'currentOrder',
  FULL_ORDER_KEY: 'fullOrder',

  saveOrder(order) {
    localStorage.setItem(this.ORDER_KEY, JSON.stringify(order));
  },

  getOrder() {
    const order = localStorage.getItem(this.ORDER_KEY);
    return order ? JSON.parse(order) : {
      soup: null,
      main: null,
      drink: null,
      salad: null,
      dessert: null
    };
  },

  clearOrder() {
    localStorage.removeItem(this.ORDER_KEY);
  },

  updateOrderDish(category, dish) {
    const currentOrder = this.getFullOrder() || {};

    currentOrder[category] = dish ? {
      id: dish.id,           // Добавлено сохранение ID
      name: dish.name,
      price: dish.price,
      keyword: dish.keyword,
      image: dish.image
    } : null;

    this.saveFullOrder(currentOrder);
  },

  saveFullOrder(order) {
    localStorage.setItem(this.FULL_ORDER_KEY, JSON.stringify(order));
  },

  getFullOrder() {
    const order = localStorage.getItem(this.FULL_ORDER_KEY);
    return order ? JSON.parse(order) : {
      soup: null,
      main: null,
      drink: null,
      salad: null,
      dessert: null
    };
  },

  clearFullOrder() {
    localStorage.removeItem(this.FULL_ORDER_KEY);
  }
};

export default LocalStorageService;
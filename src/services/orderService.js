import api from './api';

export const orderService = {
  // Tạo order mới
  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },

  // Lấy order theo ID
  getOrderById: (id) => {
    return api.get(`/orders/${id}`);
  },

  // Lấy orders của user
  getUserOrders: (userId) => {
    return api.get(`/orders/user/${userId}`);
  },

  // Update order status
  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status`, { status });
  }
};
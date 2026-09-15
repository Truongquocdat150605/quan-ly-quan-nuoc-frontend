import api from './api';

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },

  // Lấy chi tiết sản phẩm
  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },

  // Thêm sản phẩm mới
  createProduct: (productData) => {
    return api.post('/products', productData);
  },

  // Cập nhật sản phẩm
  updateProduct: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  // Xóa sản phẩm
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },

  // Upload ảnh
  uploadImage: (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};
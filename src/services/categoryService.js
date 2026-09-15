import api from './api';

export const categoryService = {
  // Lấy danh sách danh mục
  getCategories: () => {
    return api.get('/categories');
  },

  // Lấy chi tiết danh mục
  getCategoryById: (id) => {
    return api.get(`/categories/${id}`);
  },

  // Thêm danh mục mới
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  },

  // Cập nhật danh mục
  updateCategory: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },

  // Xóa danh mục
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  }
};
import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const EmployeeMenu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // Load danh mục, sản phẩm, bàn
  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes, tRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/tables"),
        ]);

        setProducts(pRes.data || []);
        setCategories(cRes.data || []);
        setTables(tRes.data || []);
      } catch (e) {
        toast.error("Không tải được dữ liệu!");
      }
    })();
  }, []);

  // Khi chọn bàn → kiểm tra đã có hóa đơn chưa
  const handleSelectTable = async (tableId) => {
    setSelectedTable(tableId);

    try {
      const res = await api.get(`/orders?tableId=${tableId}`);
      const order = res.data?.data?.find(
        (o) => o.status !== "PAID" && o.status !== "CANCELLED"
      );
      setExistingOrder(order || null);
    } catch {
      setExistingOrder(null);
    }
  };

  // Nhân viên gọi món
  const orderProduct = async (product) => {
    if (!selectedTable) return toast.warning("⚠ Vui lòng chọn bàn trước!");

    const orderData = {
      items: [{ productId: product.id, quantity: 1 }],
    };

    try {
      if (existingOrder) {
        // ➕ Thêm vào đơn đang mở
        await api.post(`/orders/${existingOrder.id}/add-item`, orderData);
        toast.success(`➕ Đã thêm ${product.title} vào hóa đơn #${existingOrder.id}`);
      } else {
        // 🆕 Tạo đơn mới
        await api.post(`/orders`, {
          tableId: selectedTable,
          userId: JSON.parse(localStorage.getItem("user"))?.id || 1,
          items: orderData.items,
        });
        toast.success(`🆕 Đã tạo đơn mới & thêm ${product.title}`);
      }
    } catch (err) {
      toast.error("❌ Lỗi xử lý order!");
    }
  };

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchKeyword =
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description?.toLowerCase().includes(keyword.toLowerCase());

      const matchCategory = activeCategory ? p.category?.id === activeCategory : true;

      return matchKeyword && matchCategory;
    });
  }, [products, keyword, activeCategory]);

  return (
    <div className="container py-4">
      <h3 className="fw-bold text-primary">🍽 Menu Dành cho Nhân viên</h3>

      {/* Chọn bàn */}
      <div className="my-3">
        <label className="fw-bold">🪑 Chọn bàn:</label>
        <select
          className="form-select"
          value={selectedTable || ""}
          onChange={(e) => handleSelectTable(Number(e.target.value))}
        >
          <option value="">-- Chọn bàn --</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.status})
            </option>
          ))}
        </select>
      </div>

      {/* Search + Category */}
      <div className="d-flex gap-2 my-3">
        <input
          className="form-control"
          placeholder="🔍 Tìm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 300 }}
        />

        <select
          className="form-select"
          style={{ width: 200 }}
          value={activeCategory ?? ""}
          onChange={(e) =>
            setActiveCategory(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* List sản phẩm */}
      <div className="row">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted">⚠ Không có sản phẩm</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="col-md-3 mb-3">
              <div className="card shadow-sm h-100">
                <img
                  src={`http://localhost:8081/uploads/${product.photo}`}
                  alt={product.title}
                  className="card-img-top"
                  style={{ height: 150, objectFit: "cover" }}
                  onError={(e) => (e.target.src = "/no-image.png")}
                />

                <div className="card-body">
                  <h6 className="fw-bold">{product.title}</h6>
                  <p className="text-success fw-bold">
                    {product.price.toLocaleString("vi-VN")}₫
                  </p>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => orderProduct(product)}
                  >
                    🛒 Order
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeMenu;

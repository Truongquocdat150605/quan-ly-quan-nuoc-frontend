import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { orderService } from "../../services/orderService";
import { toast, ToastContainer } from "react-toastify";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "react-toastify/dist/ReactToastify.css";

const MenuOrder = () => {
  const { tableId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [existingOrder, setExistingOrder] = useState(null);
  const [searchParams] = useSearchParams();
  const [stompClient, setStompClient] = useState(null);

  // 🔥 Promotion state
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionError, setPromotionError] = useState("");

  // ⭐ Pagination
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 WebSocket init
  useEffect(() => {
    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
    });

    client.onConnect = () => console.log("🟢 WebSocket connected");
    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, []);

  // Load products + categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        
        // Debug: Kiểm tra dữ liệu API trả về
        console.log("Products data:", productsRes.data);
        console.log("Categories data:", categoriesRes.data);
        
        setProducts(productsRes.data || []);
        setFiltered(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("❌ Không thể tải menu!");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load existing order
  useEffect(() => {
    const fetchExistingOrder = async () => {
      if (!tableId) return;
      try {
        const res = await api.get(`/orders/by-table/${tableId}`);
        setExistingOrder(res.data?.data || null);
      } catch (error) {
        console.error("Error fetching existing order:", error);
      }
    };
    fetchExistingOrder();
  }, [tableId]);

  // 🔍 Search + Category filter
  useEffect(() => {
    let filtered = products;

    if (activeCategory) {
      filtered = filtered.filter(
        (p) => p.category?.id === Number(activeCategory)
      );
    }

    if (searchText.trim()) {
      filtered = filtered.filter((p) =>
        // Tìm kiếm theo nhiều trường có thể có
        (p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
         p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
         p.productName?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFiltered(filtered);
    setCurrentPage(1);
  }, [activeCategory, searchText, products]);

  // Pagination data slice
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 🏷 Validate promotion
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) return setPromotionError("⚠️ Nhập mã trước!");

    try {
      const res = await api.post("/promotions/validate", { code: promotionCode });

      if (res.success && res.data) {
        const promo = res.data;
        setAppliedPromotion(promo);
        setPromotionError("");

        setProducts((prev) =>
          prev.map((p) => {
            let newPrice = p.price;
            if (promo.discountType === "PERCENTAGE") {
              newPrice = p.price * (1 - promo.discountPercentage / 100);
            } else {
              newPrice -= promo.discountAmount / prev.length;
            }
            return { ...p, discountedPrice: Math.max(newPrice, 0) };
          })
        );

        toast.success(`✔ Mã "${promotionCode}" đã áp dụng!`);
      } else {
        throw new Error();
      }
    } catch {
      setPromotionError("❌ Mã không hợp lệ!");
      setAppliedPromotion(null);

      setProducts((prev) => prev.map((p) => ({ ...p, discountedPrice: null })));
    }
  };

  // 🚀 Order food
  const handleOrderNow = async (product) => {
    if (!tableId) return toast.warning("⚠️ Chưa chọn bàn!");
    if (ordering) return toast.info("⏳ Đang xử lý...");

    setOrdering(true);

    const userData = JSON.parse(localStorage.getItem("user")) || { id: 1 };

    // 🔥 Đây là format backend hiểu được
    const orderPayload = {
      items: [
        {
          productId: product.id,
          quantity: 1,
        },
      ],
      promotionId: appliedPromotion?.id || null
    };

    try {
      let res;

      // 👇 Điều kiện xác định có tạo đơn mới hay chỉ thêm món
      const isClosedOrder =
        !existingOrder ||
        existingOrder.status === "PAID" ||
        existingOrder.status === "CANCELLED";

      if (isClosedOrder) {
        // 🆕 Tạo hóa đơn
        res = await orderService.createOrder({
          tableId: Number(tableId),
          userId: userData.id,
          notes: `Đặt nhanh: ${product.title || product.name || product.productName}`,
          ...orderPayload,
        });

        const created =
          res.data?.data ||
          res.data ||
          res;

        setExistingOrder(created);

        // 🔔 Gửi realtime đến nhân viên
        stompClient?.publish({
          destination: "/app/order",
          body: JSON.stringify(created),
        });

        const productName = product.title || product.name || product.productName;
        toast.success(`☕ Đã tạo hóa đơn & thêm "${productName}"`);
      } else {
        // ➕ Thêm sản phẩm vào hóa đơn đã tồn tại
        res = await api.post(`/orders/${existingOrder.id}/add-item`, orderPayload);

        stompClient?.publish({
          destination: "/app/order",
          body: JSON.stringify({
            id: existingOrder.id,
            action: "ADD_ITEM",
            product: product.title || product.name || product.productName,
          }),
        });

        const productName = product.title || product.name || product.productName;
        toast.success(`➕ Đã thêm "${productName}" vào hóa đơn #${existingOrder.id}`);
      }
    } catch (err) {
      console.error("❌ Lỗi order:", err);
      toast.error("❌ Lỗi xử lý đơn hàng!");
    } finally {
      setOrdering(false);
    }
  };

  // Hàm lấy tên sản phẩm
  const getProductName = (product) => {
    return product.title || product.name || product.productName || "Sản phẩm không có tên";
  };

  // Hàm lấy giá sản phẩm
  const getProductPrice = (product) => {
    return product.discountedPrice || product.price || 0;
  };

  // Hàm lấy ảnh sản phẩm
  const getProductImage = (product) => {
    if (product.photo) {
      return `http://localhost:8081/uploads/${product.photo}`;
    }
    if (product.image) {
      return `http://localhost:8081/uploads/${product.image}`;
    }
    // Ảnh mặc định nếu không có ảnh
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Đang tải menu...</p>
      </div>
    );

  return (
    <>
      <section className="ftco-section">
        <div className="container">
          <h2 className="text-center text-primary mb-4">🍽️ Menu - Bàn {tableId}</h2>

          {/* 🔍 Search */}
          <div className="row mb-4">
            <div className="col-md-8 mx-auto">
              <input
                type="text"
                placeholder="🔍 Tìm món..."
                className="form-control"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* 🏷 Promotion Input */}
          <div className="row mb-4">
            <div className="col-md-6 mx-auto">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control text-center"
                  placeholder="Nhập mã khuyến mãi"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                />
                <button className="btn btn-warning" onClick={handleApplyPromotion}>
                  Áp dụng
                </button>
              </div>
              {promotionError && (
                <p className="text-danger text-center mt-2">{promotionError}</p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <button
                  className={`btn ${!activeCategory ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveCategory(null)}
                >
                  Tất cả
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`btn ${activeCategory === c.id ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setActiveCategory(c.id)}
                  >
                    {c.title || c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {displayedProducts.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">Không tìm thấy sản phẩm nào</h4>
              <p className="text-muted">Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
            </div>
          ) : (
            <>
              <div className="row">
                {displayedProducts.map((product) => (
                  <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card product-card shadow h-100">
                      <img
                        src={getProductImage(product)}
                        className="card-img-top"
                        alt={getProductName(product)}
                        style={{ 
                          height: "200px", 
                          objectFit: "cover",
                          width: "100%"
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                      
                      <div className="card-body d-flex flex-column">
                        {/* TÊN SẢN PHẨM - QUAN TRỌNG */}
                        <h5 className="card-title text-primary mb-3">
                          {getProductName(product)}
                        </h5>
                        
                        {/* Mô tả sản phẩm nếu có */}
                        {product.description && (
                          <p className="card-text text-muted small mb-3">
                            {product.description.length > 80 
                              ? `${product.description.substring(0, 80)}...` 
                              : product.description}
                          </p>
                        )}

                        {/* GIÁ SẢN PHẨM */}
                        <div className="mt-auto">
                          <div className="price-section mb-3">
                            <strong className="text-success h5">
                              {getProductPrice(product).toLocaleString("vi-VN")}₫
                            </strong>
                            {product.discountedPrice && product.discountedPrice !== product.price && (
                              <p className="text-muted text-decoration-line-through small mb-0">
                                {product.price.toLocaleString("vi-VN")}₫
                              </p>
                            )}
                          </div>

                          <button
                            className="btn btn-primary w-100"
                            onClick={() => handleOrderNow(product)}
                            disabled={ordering}
                          >
                            {ordering ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang xử lý...
                              </>
                            ) : (
                              "🧾 Order ngay"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="text-center mt-4">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn mx-1 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <ToastContainer />
    </>
  );
};

export default MenuOrder;
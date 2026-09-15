import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

const EmployeeOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data || res);
    } catch (error) {
      console.error("Loi tai chi tiet don hang:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const formatMoney = (num) =>
    num ? num.toLocaleString("vi-VN") + " ₫" : "0 ₫";

  const getDiscountedPrice = (item) => {
    if (!order.promotion || !order.finalAmount) return item.price;

    const totalItems = order.orderDetails.length;
    const dividedDiscount = order.finalAmount / totalItems;

    return dividedDiscount;
  };

  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Dang tai chi tiet don hang...</p>
      </div>
    );

  if (!order)
    return <p className="text-center text-danger">Khong tim thay don hang!</p>;

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary mb-4">
        Chi Tiet Don Hang #{order.id}
      </h2>

      {/* Thong tin chung */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Thong tin chung</h5>
          <p><strong>Ban:</strong> {order.table?.name || `Ban ${order.tableId}`}</p>

          <p><strong>Trang thai don:</strong>
            <span className="badge bg-success ms-2">{order.status}</span>
          </p>

          <p><strong>Ghi chu:</strong> {order.notes || "Khong co"}</p>
          <p><strong>Ngay tao:</strong> {new Date(order.createdAt).toLocaleString("vi-VN")}</p>

          <p>
            <strong>Tong tien: </strong>
            {order.finalAmount && order.finalAmount !== order.totalAmount ? (
              <>
                <span className="text-decoration-line-through text-danger me-2">
                  {formatMoney(order.totalAmount)}
                </span>
                <span className="fw-bold text-success">
                  {formatMoney(order.finalAmount)}
                </span>
              </>
            ) : (
              <span className="fw-bold">{formatMoney(order.totalAmount)}</span>
            )}
          </p>
        </div>
      </div>

      {/* Danh sach mon */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Danh sach mon</h5>

          <table className="table table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Ten mon</th>
                <th>So luong</th>
                <th>Don gia</th>
                <th>Thanh tien</th>
              </tr>
            </thead>
            <tbody>
              {order.orderDetails.map((item, i) => {
                const discountedPrice = getDiscountedPrice(item);

                return (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>{item.product?.title}</td>
                    <td>{item.quantity}</td>

                    {/* Hien thi gia giam */}
                    <td>
                      {order.finalAmount && order.promotion ? (
                        <>
                          <span className="text-decoration-line-through text-danger">
                            {formatMoney(item.price)}
                          </span>
                          <br />
                          <span className="fw-bold text-success">
                            {formatMoney(discountedPrice)}
                          </span>
                        </>
                      ) : (
                        formatMoney(item.price)
                      )}
                    </td>

                    <td>
                      {order.finalAmount && order.promotion ? (
                        <>
                          <span className="text-decoration-line-through text-danger">
                            {formatMoney(item.price * item.quantity)}
                          </span>
                          <br />
                          <span className="fw-bold text-success">
                            {formatMoney(discountedPrice * item.quantity)}
                          </span>
                        </>
                      ) : (
                        formatMoney(item.price * item.quantity)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thong tin thanh toan */}
      {order.payment && (
        <div className="card shadow mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Thong tin thanh toan</h5>
            <p><strong>Phuong thuc:</strong> {order.payment.method}</p>
            <p><strong>Trang thai:</strong>
              <span className="badge bg-warning text-dark ms-2">
                {order.payment.status}
              </span>
            </p>
            {order.promotion && (
              <p><strong>Khuyen mai:</strong> {order.promotion.code}</p>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="text-center">
        <Link to="/employee" className="btn btn-secondary">
          Quay lai danh sach don hang
        </Link>

        {order.status !== "PAID" && (
          <button className="btn btn-outline-dark ms-3" onClick={() => window.print()}>
            Phieu tam tinh
          </button>
        )}

        {order.status === "PAID" && (
          <button className="btn btn-dark ms-3" onClick={() => window.print()}>
            In hoa don
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeOrderDetail;
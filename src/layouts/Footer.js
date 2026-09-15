import React from 'react';

const Footer = () => (
  <footer className="ftco-footer ftco-section bg-dark text-light py-5 mt-5">
    <div className="container">
      <div className="row mb-4">
        {/* Giới thiệu */}
        <div className="col-lg-4 col-md-6 mb-4">
          <h5 className="fw-bold text-warning mb-3">
            ☕ CÀ PHÊ CỬA HÀNG
          </h5>
          <p className="small">
            Tận hưởng hương vị cà phê nguyên chất, không gian ấm áp và dịch vụ thân thiện.
            Chúng tôi luôn mang đến trải nghiệm tốt nhất cho bạn mỗi ngày.
          </p>
          <div className="d-flex gap-3 mt-3">
            <a href="#" className="text-light"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-light"><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-light"><i className="fab fa-tiktok"></i></a>
          </div>
        </div>

        {/* Liên kết nhanh */}
        <div className="col-lg-2 col-md-6 mb-4">
          <h5 className="fw-bold text-warning mb-3">Liên kết</h5>
          <ul className="list-unstyled small">
            <li><a href="/" className="text-light text-decoration-none">Trang chủ</a></li>
            <li><a href="/tables" className="text-light text-decoration-none">Đặt bàn</a></li>
            <li><a href="/order" className="text-light text-decoration-none">Sản phẩm</a></li>
            <li><a href="/about" className="text-light text-decoration-none">Giới thiệu</a></li>
            <li><a href="/contact" className="text-light text-decoration-none">Liên hệ</a></li>
          </ul>
        </div>

        {/* Dịch vụ */}
        <div className="col-lg-3 col-md-6 mb-4">
          <h5 className="fw-bold text-warning mb-3">Dịch vụ</h5>
          <ul className="list-unstyled small">
            <li>☕ Pha chế tại chỗ</li>
            <li>🚚 Giao hàng tận nơi</li>
            <li>🎉 Đặt tiệc - sự kiện</li>
            <li>🏠 Không gian làm việc</li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="col-lg-3 col-md-6 mb-4">
          <h5 className="fw-bold text-warning mb-3">Liên hệ</h5>
          <ul className="list-unstyled small">
            <li><i className="fas fa-map-marker-alt me-2 text-warning"></i> 203 Nguyễn Văn Linh, Quận 7, TP.HCM</li>
            <li><i className="fas fa-phone-alt me-2 text-warning"></i> 0909 999 888</li>
            <li><i className="fas fa-envelope me-2 text-warning"></i> coffee@cuahang.vn</li>
          </ul>
        </div>
      </div>

      <hr className="border-secondary" />
      <div className="text-center small text-muted">
        © {new Date().getFullYear()} <span className="text-warning">Cà Phê Cửa Hàng</span> — Hương vị Việt trong từng giọt ☕
      </div>
    </div>
  </footer>
);

export default Footer;

// pages/customer/HomePage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
    const [homeData, setHomeData] = useState({
        tableStats: {},
        featuredProducts: [],
        bestSellers: [],
        popularCategories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/home");
                if (response.data.success) {
                    setHomeData(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    if (loading) {
        return <div className="text-center py-5">Đang tải...</div>;
    }

    return (
        <div className="homepage">
            {/* HERO BANNER */}
            <section className="hero-banner text-center text-white py-5 bg-dark">
                <div className="container">
                    <h1 className="display-4 fw-bold">Cà Phê Thơm</h1>
                    <p className="lead">
                        Hiện có <strong>{homeData.tableStats.availableTables}</strong> bàn trống
                        ({homeData.tableStats.availabilityRate}%)
                    </p>
                    <Link to="/tables" className="btn btn-warning btn-lg">
                        Đặt Bàn Ngay
                    </Link>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-4">Sản Phẩm Nổi Bật</h2>
                    <div className="row">
                        {homeData.featuredProducts.map(product => (
                            <div key={product.id} className="col-md-4 mb-4">
                                <div className="card h-100">
                                    <img
                                        src={product.photo ? `http://localhost:8081/uploads/${product.photo}` : '/default-product.jpg'}
                                        className="card-img-top"
                                        alt={product.title}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{product.title}</h5>
                                        <p className="card-text text-muted">{product.description}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="h5 text-warning mb-0">
                                                {product.price.toLocaleString()}đ
                                            </span>
                                            <Link to="/tables" className="btn btn-outline-warning btn-sm">
                                                Order
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR CATEGORIES */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-4">Danh Mục Phổ Biến</h2>
                    <div className="row">
                        {homeData.popularCategories.map(category => (
                            <div key={category.id} className="col-md-3 mb-3">
                                {/* ✅ THAY ĐỔI: Dùng Link thay vì div */}
                                <Link
                                    to={`/menu?category=${category.id}`}
                                    className="card text-center text-decoration-none text-dark"
                                    style={{ cursor: "pointer" }}
                                >
                                    <img
                                        src={category.photo ? `http://localhost:8081/uploads/${category.photo}` : '/default-category.jpg'}
                                        className="card-img-top"
                                        alt={category.title}
                                        style={{ height: "150px", objectFit: "cover" }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{category.title}</h5>
                                        <p className="card-text small text-muted">{category.description}</p>
                                        <span className="badge bg-warning">
                                            {category.products?.length} sản phẩm
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
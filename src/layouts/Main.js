import React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "../pages/Home";
import TableSelection from "../pages/customer/TableSelection";
import MenuOrder from "../pages/customer/MenuOrder";
import CartPage from "../pages/customer/CartPage";
import Login from './pages/Login';
const Main = () => {
  return (
    <main>
      <Switch>
        {/* Chỉ giữ các routes hệ thống Coffee Shop mới */}
        <Route exact path="/" component={Home} />
        <Route path="/tables" component={TableSelection} />
        <Route path="/order/:tableId" component={MenuOrder} />
        <Route path="/cart/:tableId" component={CartPage} />
        <Route path="/login" component={Login} />
        {/* Redirect các trang cũ về trang chính */}
        <Route path="/menu" component={TableSelection} />
        <Route path="/shop" component={TableSelection} />
        <Route path="/about" component={Home} />
        <Route path="/blog" component={Home} />
        <Route path="/contact" component={Home} />
        <Route path="/services" component={Home} />
      </Switch>
    </main>
  );
};

export default Main;
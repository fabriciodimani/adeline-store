import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

function parseUser() {
  try {
    return JSON.parse(localStorage.getItem("adeline_user") || "null");
  } catch {
    return null;
  }
}

function AdminOnly({ children }) {
  const user = parseUser();
  return user?.role === "admin" ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Producto público */}
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* Compra */}
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmed />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin/productos"
          element={
            <AdminOnly>
              <AdminProducts />
            </AdminOnly>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <AdminOnly>
              <AdminOrders />
            </AdminOnly>
          }
        />

        <Route path="/admin" element={<Navigate to="/admin/productos" replace />} />

        {/* Cualquier ruta rara vuelve al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
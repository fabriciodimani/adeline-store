import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import Login from "./pages/Login.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

function parseUser() {
  try {
    return JSON.parse(localStorage.getItem("adeline_user") || "null");
  } catch {
    return null;
  }
}

function isAdminUser(user) {
  const role = String(user?.role || user?.rol || "").toLowerCase();

  return (
    role === "admin" ||
    role === "admin_role" ||
    role === "administrator"
  );
}

function AdminOnly({ children }) {
  const user = parseUser();
  const token = localStorage.getItem("adeline_token");

  if (!token || !isAdminUser(user)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* Compra */}
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmed />} />

        {/* Login admin */}
        <Route path="/login" element={<Login />} />

        {/* Admin protegido */}
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

        <Route
          path="/admin"
          element={<Navigate to="/admin/productos" replace />}
        />

        {/* Ruta inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
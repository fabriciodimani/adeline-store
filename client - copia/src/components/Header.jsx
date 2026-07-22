import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cartCount } from "../cart.js";

function parseUser() {
  try {
    return JSON.parse(localStorage.getItem("adeline_user") || "null");
  } catch {
    return null;
  }
}

export default function Header() {
  const [count, setCount] = useState(cartCount());
  const [user, setUser] = useState(parseUser());

  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const refresh = () => {
      setCount(cartCount());
      setUser(parseUser());
    };

    window.addEventListener("adeline-cart", refresh);
    window.addEventListener("adeline-cart-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("adeline-cart", refresh);
      window.removeEventListener("adeline-cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("adeline_token");
    localStorage.removeItem("adeline_user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Adeline inicio">
        <img
          src="/brand/adeline-logo-transparent.png"
          alt="Adeline"
          className="adeline-logo"
        />
      </Link>

      <nav className="main-nav">
        <NavLink to="/">Inicio</NavLink>
        <a href="/#novedades">Novedades</a>
        <a href="/#tienda">Tienda</a>
        <a href="/#coleccion">Colección</a>
        <a href="/#contacto">Contacto</a>

        {isAdmin && (
          <>
            <NavLink to="/admin/productos" className="admin-header-link">
              Productos
            </NavLink>

            <NavLink to="/admin/pedidos" className="admin-header-link">
              Pedidos
            </NavLink>
          </>
        )}
      </nav>

      <div className="header-actions">
        <button className="icon-btn" title="Buscar" type="button">
          ⌕
        </button>

        <Link className="bag-link" to="/carrito" title="Carrito">
          ♡
          <span className="bag-count">{count}</span>
        </Link>

        <span className="header-sep" />

        {user ? (
          <>
            {isAdmin && (
              <Link className="admin-link" to="/admin/productos">
                Admin
              </Link>
            )}

            <span className="user-pill">
              {user.nombre || "Admin"} · {user.role}
            </span>

            <button className="logout-btn" type="button" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <Link className="admin-link" to="/login">
            Admin 🔒
          </Link>
        )}
      </div>
    </header>
  );
}
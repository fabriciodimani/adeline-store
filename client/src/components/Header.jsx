import { Link, useNavigate } from "react-router-dom";
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
    <header className="ad-header-clean">
      <div className="ad-header-left">
        <button className="ad-menu-btn" type="button" aria-label="Menú">
          ☰
        </button>

        <button className="ad-search-icon" type="button" aria-label="Buscar">
          ⌕
        </button>
      </div>

      <Link to="/" className="ad-logo-link" aria-label="Adeline inicio">
        <img
          src="/brand/adeline-logo-transparent.png"
          alt="Adeline"
          className="ad-header-logo"
        />
      </Link>

      <div className="ad-header-right">
        {isAdmin && (
          <>
            <Link className="ad-admin-mini" to="/admin/productos">
              Productos
            </Link>

            <Link className="ad-admin-mini" to="/admin/pedidos">
              Pedidos
            </Link>
          </>
        )}

        {user ? (
          <button className="ad-user-icon" type="button" onClick={logout} title="Salir">
            ♙
          </button>
        ) : (
          <Link className="ad-user-icon" to="/login" title="Admin">
            ♙
          </Link>
        )}

        <Link className="ad-cart-icon" to="/carrito" title="Carrito">
          ♡
          <span>{count}</span>
        </Link>
      </div>
    </header>
  );
}
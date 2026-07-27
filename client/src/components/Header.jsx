import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cartCount } from "../cart.js";

const COLLECTION_CATEGORIES = [
  "BEST SELLERS",
  "Tops",
  "DENIM & PANTS",
  "Camperas & Blazers",
  "Sweaters & Buzos",
  "EVERYDAY LOOKS",
  "NIGHT OUT",
  "Vestidos",
];

function parseUser() {
  try {
    return JSON.parse(localStorage.getItem("adeline_user") || "null");
  } catch {
    return null;
  }
}

function categoryUrl(category) {
  return `/tienda?categoria=${encodeURIComponent(category)}`;
}

function UserSvgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-icon-svg">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.87 0-7 2.24-7 5v1h14v-1c0-2.76-3.13-5-7-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartSvgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-icon-svg">
      <path
        d="M3 5h2l2.1 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.6" fill="currentColor" />
      <circle cx="17" cy="19" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const [count, setCount] = useState(cartCount());
  const [user, setUser] = useState(parseUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("ad-menu-open-body");
    } else {
      document.body.classList.remove("ad-menu-open-body");
    }

    return () => document.body.classList.remove("ad-menu-open-body");
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setCollectionOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("adeline_token");
    localStorage.removeItem("adeline_user");
    setUser(null);
    closeMenu();
    navigate("/");
  };

  const submitSearch = (e) => {
    e.preventDefault();

    const q = searchText.trim();

    if (!q) {
      navigate("/tienda");
      closeMenu();
      return;
    }

    navigate(`/tienda?q=${encodeURIComponent(q)}`);
    closeMenu();
  };

  return (
    <>
      <header className="ad-header-clean">
        <div className="ad-header-left">
          <button
            className="ad-menu-btn"
            type="button"
            aria-label="Menú"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>

          <button
            className="ad-search-icon"
            type="button"
            aria-label="Buscar"
            onClick={() => setMenuOpen(true)}
          >
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
            <Link className="ad-user-icon" to="/admin/productos" title="Admin">
              <UserSvgIcon />
            </Link>
          ) : (
            <Link className="ad-user-icon" to="/login" title="Acceso admin">
              <UserSvgIcon />
            </Link>
          )}

          <Link className="ad-cart-icon" to="/carrito" title="Carrito">
            <CartSvgIcon />
            <span>{count}</span>
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="ad-mobile-menu-overlay" onClick={closeMenu}>
          <aside
            className="ad-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ad-menu-close"
              onClick={closeMenu}
              aria-label="Cerrar menú"
            >
              ×
            </button>

            <form className="ad-menu-search" onSubmit={submitSearch}>
              <input
                type="search"
                placeholder="Buscar"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />

              <button type="submit" aria-label="Buscar">
                ⌕
              </button>
            </form>

            <nav className="ad-menu-nav">
              <Link to={categoryUrl("NEW IN")} onClick={closeMenu}>
                NEW IN
              </Link>

              <button
                type="button"
                className="ad-menu-collection-btn"
                onClick={() => setCollectionOpen((v) => !v)}
              >
                <span>COLECCIÓN</span>
                <span>{collectionOpen ? "↑" : "↓"}</span>
              </button>

              {collectionOpen && (
                <div className="ad-menu-subnav">
                  <Link to="/tienda" onClick={closeMenu}>
                    VER TODO
                  </Link>

                  {COLLECTION_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={categoryUrl(cat)}
                      onClick={closeMenu}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            <div className="ad-menu-bottom">
              {user ? (
                <button type="button" onClick={logout}>
                  Cerrar sesión
                </button>
              ) : (
                <Link to="/login" onClick={closeMenu}>
                  Acceso admin
                </Link>
              )}
          </div>
          </aside>
        </div>
      )}
    </>
  );
}
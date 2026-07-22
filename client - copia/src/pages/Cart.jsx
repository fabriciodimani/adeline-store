import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("adeline_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem("adeline_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("adeline-cart-updated"));
}

function getItemName(item) {
  return item.name || item.nombre || "Producto";
}

function getItemPrice(item) {
  return Number(item.price || item.precioVenta || 0);
}

function getItemImage(item) {
  return item.image || item.imagen || item.foto || "/brand/adeline-logo-transparent.png";
}

function getItemKey(item, idx) {
  return `${item.productId || item._id || "p"}-${item.sku || "sku"}-${item.size || ""}-${item.color || ""}-${idx}`;
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + getItemPrice(item) * Number(item.qty || 1);
    }, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.qty || 1), 0);
  }, [items]);

  const updateQty = (idx, nextQty) => {
    const next = [...items];
    const stock = Number(next[idx].stock || 9999);
    const safeQty = Math.max(1, Math.min(Number(nextQty || 1), stock));

    next[idx] = {
      ...next[idx],
      qty: safeQty,
    };

    setItems(next);
    saveCart(next);
  };

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    saveCart(next);
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
  };

  if (!items.length) {
    return (
      <main className="cart-page premium-cart-page">
        <section className="container cart-empty">
          <p className="cart-eyebrow">ADELINE</p>
          <h1>Tu carrito está vacío</h1>
          <p>
            Todavía no agregaste prendas. Explorá la colección y elegí tus favoritas.
          </p>

          <Link to="/" className="cart-black-btn">
            Ver colección →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page premium-cart-page">
      <section className="container cart-header">
        <div>
          <p className="cart-eyebrow">TU SELECCIÓN</p>
          <h1>Carrito de compras</h1>
        </div>

        <Link to="/" className="cart-soft-link">
          Seguir comprando →
        </Link>
      </section>

      <section className="container cart-layout">
        <div className="cart-items-panel">
          <div className="cart-list-head">
            <span>Producto</span>
            <span>Subtotal</span>
          </div>

          <div className="cart-items-list">
            {items.map((item, idx) => {
              const price = getItemPrice(item);
              const qty = Number(item.qty || 1);
              const stock = Number(item.stock || 9999);
              const reachedStock = qty >= stock;

              return (
                <article className="cart-item" key={getItemKey(item, idx)}>
                  <div className="cart-item-media">
                    <img
                      src={getItemImage(item)}
                      alt={getItemName(item)}
                      onError={(e) => {
                        e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <p className="cart-item-category">
                      {item.category || item.tipo || "ADELINE"}
                    </p>

                    <h2>{getItemName(item)}</h2>

                    <div className="cart-item-meta">
                      <span>
                        Talle: <b>{item.size || "-"}</b>
                      </span>
                      <span>
                        Color: <b>{item.color || "-"}</b>
                      </span>
                    </div>

                    <p className={stock <= 3 ? "cart-stock low" : "cart-stock"}>
                      {stock <= 0
                        ? "Sin stock"
                        : stock <= 3
                        ? `Últimas ${stock} unidades`
                        : "Stock disponible"}
                    </p>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeItem(idx)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button
                        type="button"
                        onClick={() => updateQty(idx, qty - 1)}
                        disabled={qty <= 1}
                      >
                        −
                      </button>

                      <b>{qty}</b>

                      <button
                        type="button"
                        onClick={() => updateQty(idx, qty + 1)}
                        disabled={reachedStock}
                      >
                        +
                      </button>
                    </div>

                    <strong>ARS {money(price * qty)}</strong>
                  </div>
                </article>
              );
            })}
          </div>

          <button type="button" className="cart-clear" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        <aside className="cart-summary">
          <p className="summary-eyebrow">RESUMEN</p>
          <h2>Tu compra</h2>

          <div className="summary-row">
            <span>Prendas</span>
            <b>{totalItems}</b>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <b>ARS {money(subtotal)}</b>
          </div>

          <div className="summary-row muted">
            <span>Envío</span>
            <b>A coordinar</b>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>ARS {money(subtotal)}</strong>
          </div>

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Finalizar compra →
          </button>

          <div className="cart-payment-note">
            <b>Medios de pago</b>
            <span>Transferencia bancaria, tarjetas y pago online.</span>
          </div>

          <div className="cart-security">
            <span>Compra segura</span>
            <small>El stock se valida antes de confirmar el pedido.</small>
          </div>
        </aside>
      </section>
    </main>
  );
}
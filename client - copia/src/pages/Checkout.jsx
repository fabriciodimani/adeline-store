import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

function getItemName(item) {
  return item.name || item.nombre || "Producto";
}

function getItemPrice(item) {
  return Number(item.price || item.precioVenta || 0);
}

function getItemImage(item) {
  return item.image || item.imagen || item.foto || "/brand/adeline-logo-transparent.png";
}

export default function Checkout() {
  const navigate = useNavigate();
  const [items] = useState(readCart());
  const [paymentMethod, setPaymentMethod] = useState("TRANSFERENCIA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    nota: "",
  });

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + getItemPrice(item) * Number(item.qty || 1);
    }, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.qty || 1), 0);
  }, [items]);

  const setField = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!items.length) return "El carrito está vacío.";
    if (!customer.nombre.trim()) return "Ingresá el nombre.";
    if (!customer.telefono.trim()) return "Ingresá el teléfono.";
    if (!customer.email.trim()) return "Ingresá el email.";
    if (!customer.direccion.trim()) return "Ingresá dirección o forma de entrega.";
    return "";
  };

  const confirmOrder = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customer,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          name: getItemName(item),
          nombre: getItemName(item),
          size: item.size,
          color: item.color,
          qty: Number(item.qty || 1),
          price: getItemPrice(item),
          precioVenta: getItemPrice(item),
          image: getItemImage(item),
        })),
      };

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(text || "Respuesta inválida del servidor");
      }

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo confirmar el pedido.");
      }

      localStorage.removeItem("adeline_cart");
      window.dispatchEvent(new Event("adeline-cart-updated"));

      navigate("/pedido-confirmado", {
        state: {
          order: data?.item || data?.order || data,
          paymentMethod,
        },
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Error confirmando pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="checkout-page">
        <section className="container cart-empty">
          <p className="cart-eyebrow">ADELINE</p>
          <h1>No hay prendas para confirmar</h1>
          <p>Volvé a la colección y agregá una prenda al carrito.</p>
          <Link to="/" className="cart-black-btn">
            Ver colección →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="container checkout-header">
        <div>
          <p className="cart-eyebrow">CHECKOUT</p>
          <h1>Finalizar compra</h1>
        </div>

        <Link to="/carrito" className="cart-soft-link">
          Volver al carrito
        </Link>
      </section>

      <section className="container checkout-layout">
        <section className="checkout-form-panel">
          <h2>Datos de contacto</h2>
          <p>
            Completá tus datos para coordinar el pago, la entrega o el retiro de tu compra.
          </p>

          {error && <div className="checkout-error">{error}</div>}

          <div className="checkout-fields">
            <label>
              Nombre completo
              <input
                value={customer.nombre}
                onChange={(e) => setField("nombre", e.target.value)}
                placeholder="Ej: Pía Dimani"
              />
            </label>

            <label>
              Teléfono / WhatsApp
              <input
                value={customer.telefono}
                onChange={(e) => setField("telefono", e.target.value)}
                placeholder="Ej: 381..."
              />
            </label>

            <label>
              Email
              <input
                value={customer.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="tuemail@email.com"
              />
            </label>

            <label>
              Dirección / forma de entrega
              <input
                value={customer.direccion}
                onChange={(e) => setField("direccion", e.target.value)}
                placeholder="Domicilio, retiro o zona de entrega"
              />
            </label>

            <label className="wide">
              Nota opcional
              <textarea
                value={customer.nota}
                onChange={(e) => setField("nota", e.target.value)}
                placeholder="Horario preferido, referencias, observaciones..."
              />
            </label>
          </div>

          <div className="payment-methods">
            <h3>Medio de pago</h3>

            <div className="payment-grid">
              <button
                type="button"
                className={paymentMethod === "TRANSFERENCIA" ? "active" : ""}
                onClick={() => setPaymentMethod("TRANSFERENCIA")}
              >
                <b>Transferencia</b>
                <span>Coordinación por WhatsApp</span>
              </button>

              <button
                type="button"
                className={paymentMethod === "TARJETA" ? "active" : ""}
                onClick={() => setPaymentMethod("TARJETA")}
              >
                <b>Tarjeta / online</b>
                <span>Preparado para checkout</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="checkout-summary">
          <p className="summary-eyebrow">RESUMEN</p>
          <h2>Pedido</h2>

          <div className="checkout-products">
            {items.map((item, idx) => (
              <article className="checkout-product" key={`${item.sku}-${idx}`}>
                <img
                  src={getItemImage(item)}
                  alt={getItemName(item)}
                  onError={(e) => {
                    e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                  }}
                />

                <div>
                  <b>{getItemName(item)}</b>
                  <span>
                    {item.size || "-"} · {item.color || "-"} · x{item.qty || 1}
                  </span>
                </div>

                <strong>ARS {money(getItemPrice(item) * Number(item.qty || 1))}</strong>
              </article>
            ))}
          </div>

          <div className="summary-divider" />

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
            disabled={loading}
            onClick={confirmOrder}
          >
            {loading ? "Confirmando..." : "Confirmar pedido →"}
          </button>

          <div className="cart-security">
            <span>Stock protegido</span>
            <small>Antes de confirmar se valida la disponibilidad de cada prenda.</small>
          </div>
        </aside>
      </section>
    </main>
  );
}
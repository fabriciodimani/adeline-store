import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function tokenHeaders(extra = {}) {
  const token = localStorage.getItem("adeline_token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function statusLabel(status) {
  const s = String(status || "PENDIENTE").toUpperCase();
  if (s === "PAGADO") return "Pagado";
  if (s === "CANCELADO") return "Cancelado";
  if (s === "ENTREGADO") return "Entregado";
  return "Pendiente";
}

function openMaps(address) {
  if (!address) return;

  const query = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
}

function openWhatsapp(phone, order) {
  const clean = String(phone || "").replace(/\D/g, "");

  if (!clean) return;

  const code = order?.code || "pedido";
  const msg = encodeURIComponent(
    `Hola, te contactamos de ADELINE por tu pedido ${code}.`
  );

  window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const filtered = useMemo(() => {
    if (statusFilter === "TODOS") return orders;
    return orders.filter((o) => String(o.status || "PENDIENTE") === statusFilter);
  }, [orders, statusFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, o) => {
        acc.count += 1;
        acc.total += Number(o.total || 0);
        return acc;
      },
      { count: 0, total: 0 }
    );
  }, [filtered]);

  async function loadOrders() {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`${API}/api/admin/orders`, {
        headers: tokenHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudieron obtener los pedidos");
      }

      const list = Array.isArray(data?.items) ? data.items : [];
      setOrders(list);

      if (!selected && list.length) {
        setSelected(list[0]);
      } else if (selected) {
        const refreshed = list.find((x) => x._id === selected._id);
        setSelected(refreshed || list[0] || null);
      }
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error cargando pedidos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setErr("");

      const res = await fetch(`${API}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: tokenHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el pedido");
      }

      await loadOrders();
      setSelected(data.item);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error actualizando estado");
    }
  }

  return (
    <main className="admin-orders-page">
      <section className="container admin-orders-header">
        <div>
          <p className="cart-eyebrow">ADMIN</p>
          <h1>Pedidos</h1>
        </div>

        <button type="button" className="admin-refresh-btn" onClick={loadOrders}>
          Recargar
        </button>
      </section>

      <section className="container admin-orders-metrics">
        <article>
          <span>Pedidos</span>
          <b>{totals.count}</b>
        </article>

        <article>
          <span>Total listado</span>
          <b>ARS {money(totals.total)}</b>
        </article>

        <article>
          <span>Filtro</span>
          <b>{statusFilter === "TODOS" ? "Todos" : statusLabel(statusFilter)}</b>
        </article>
      </section>

      <section className="container admin-orders-toolbar">
        {["TODOS", "PENDIENTE", "PAGADO", "ENTREGADO", "CANCELADO"].map((s) => (
          <button
            key={s}
            type="button"
            className={statusFilter === s ? "active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {s === "TODOS" ? "Todos" : statusLabel(s)}
          </button>
        ))}
      </section>

      {err && (
        <section className="container">
          <div className="checkout-error">{err}</div>
        </section>
      )}

      <section className="container admin-orders-layout">
        <div className="admin-orders-list">
          {loading ? (
            <div className="admin-orders-empty">Cargando pedidos...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-orders-empty">No hay pedidos para este filtro.</div>
          ) : (
            filtered.map((order) => (
              <button
                type="button"
                key={order._id}
                className={`admin-order-row ${selected?._id === order._id ? "selected" : ""}`}
                onClick={() => setSelected(order)}
              >
                <div>
                  <b>{order.code || order._id}</b>
                  <span>{fmtDate(order.createdAt)}</span>
                </div>

                <div>
                  <strong>{order.customer?.nombre || "-"}</strong>
                  <span>{order.customer?.telefono || "-"}</span>
                </div>

                <div>
                  <strong>ARS {money(order.total)}</strong>
                  <span className={`order-status status-${String(order.status || "PENDIENTE").toLowerCase()}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <aside className="admin-order-detail">
          {!selected ? (
            <div className="admin-orders-empty">Seleccioná un pedido.</div>
          ) : (
            <>
              <div className="admin-order-detail-head">
                <p className="summary-eyebrow">DETALLE</p>
                <h2>{selected.code || "Pedido"}</h2>
                <span className={`order-status status-${String(selected.status || "PENDIENTE").toLowerCase()}`}>
                  {statusLabel(selected.status)}
                </span>
              </div>

            <div className="admin-detail-block">
            <h3>Cliente</h3>

            <p><b>{selected.customer?.nombre}</b></p>
            <p>{selected.customer?.telefono}</p>
            <p>{selected.customer?.email}</p>

            <div className="admin-customer-actions">
                <button
                type="button"
                onClick={() => openWhatsapp(selected.customer?.telefono, selected)}
                >
                WhatsApp
                </button>

                <button
                type="button"
                onClick={() => openMaps(selected.customer?.direccion)}
                >
                Ver dirección
                </button>

                <button
                type="button"
                onClick={() => copyToClipboard(selected.customer?.direccion)}
                >
                Copiar dirección
                </button>
            </div>

            <p className="admin-address-text">
                {selected.customer?.direccion || "Sin dirección"}
            </p>

            {selected.customer?.nota && <p>Nota: {selected.customer.nota}</p>}
            </div>

              <div className="admin-detail-block">
                <h3>Prendas</h3>

                <div className="admin-order-items">
                  {(selected.items || []).map((item, idx) => (
                    <article key={`${item.sku}-${idx}`}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                          }}
                        />
                      )}

                      <div>
                        <b>{item.name}</b>
                        <span>
                          {item.size || "-"} · {item.color || "-"} · x{item.qty}
                        </span>
                      </div>

                      <strong>ARS {money(Number(item.price || 0) * Number(item.qty || 1))}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className="admin-detail-block admin-order-total">
                <span>Medio de pago</span>
                <b>{selected.paymentMethod}</b>

                <span>Total</span>
                <strong>ARS {money(selected.total)}</strong>
              </div>

              <div className="admin-order-actions">
                <button type="button" onClick={() => updateStatus(selected._id, "PAGADO")}>
                  Marcar pagado
                </button>

                <button type="button" onClick={() => updateStatus(selected._id, "ENTREGADO")}>
                  Marcar entregado
                </button>

                <button type="button" className="danger" onClick={() => updateStatus(selected._id, "CANCELADO")}>
                  Cancelar
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
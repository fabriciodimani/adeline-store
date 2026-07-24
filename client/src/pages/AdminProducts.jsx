import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import { getProductMainImage } from "../utils/productImages.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const empty = {
  codigo: "",
  nombre: "",
  tipo: "",
  descripcion: "",
  precioCompra: 0,
  precioVenta: 0,
  badge: "",
  publicado: true,
  variants: [{ size: "S", color: "Negro", sku: "", stock: 1 }],
};

const money = (n) => Number(n || 0).toLocaleString("es-AR");

function tokenHeaders(extra = {}) {
  const token = localStorage.getItem("adeline_token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function stockTotal(p) {
  return (p.variants || []).reduce((acc, v) => acc + Number(v.stock || 0), 0);
}

function productImage(p) {
  return getProductMainImage(p);
}

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([null, null, null, null, null]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const title = editId ? "Editar producto" : "Nuevo producto";

  const visibleCount = useMemo(
    () => items.filter((p) => p.publicado !== false).length,
    [items]
  );

  const totalStock = useMemo(
    () => items.reduce((acc, p) => acc + stockTotal(p), 0),
    [items]
  );

  const load = async () => {
    try {
      setErr("");
      const data = await apiGet("/api/admin/products", true);
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message || "No se pudieron cargar productos");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(empty);
    setFiles([null, null, null, null, null]);
    setErr("");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setV = (i, patch) => {
    setForm((s) => {
      const variants = [...s.variants];
      variants[i] = { ...variants[i], ...patch };
      return { ...s, variants };
    });
  };

  const addVariant = () => {
    setForm((s) => ({
      ...s,
      variants: [...s.variants, { size: "", color: "", sku: "", stock: 0 }],
    }));
  };

  const removeVariant = (i) => {
    setForm((s) => {
      const variants = s.variants.filter((_, idx) => idx !== i);
      return {
        ...s,
        variants: variants.length
          ? variants
          : [{ size: "", color: "", sku: "", stock: 0 }],
      };
    });
  };

  const edit = (p) => {
    setEditId(p._id);
    setFiles([null, null, null, null, null]);
    setErr("");
    setMsg("");

    setForm({
      ...empty,
      ...p,
      precioCompra: Number(p.precioCompra || 0),
      precioVenta: Number(p.precioVenta || 0),
      publicado: p.publicado !== false,
      variants: p.variants?.length ? p.variants : empty.variants,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      setLoading(true);

      const payload = {
        ...form,
        codigo: String(form.codigo || "").trim().toUpperCase(),
        nombre: String(form.nombre || "").trim(),
        precioCompra: Number(form.precioCompra || 0),
        precioVenta: Number(form.precioVenta || 0),
        publicado: form.publicado !== false,
        variants: form.variants.map((v) => ({
          size: String(v.size || "").trim(),
          color: String(v.color || "").trim(),
          stock: Number(v.stock || 0),
          sku:
            String(v.sku || "")
              .trim()
              .toUpperCase() ||
            `${form.codigo}-${v.size}-${v.color}`
              .toUpperCase()
              .replace(/\s+/g, ""),
        })),
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

      files.forEach((file) => {
        if (file) fd.append("images", file);
      });

      const url = editId
        ? `${API}/api/admin/products/${editId}`
        : `${API}/api/admin/products`;

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: tokenHeaders(),
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo guardar el producto");
      }

      setMsg(editId ? "Producto actualizado correctamente" : "Producto creado correctamente");
      resetForm();
      await load();
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-products-page">
      <section className="container admin-products-header">
        <div>
          <p className="cart-eyebrow">ADMIN</p>
          <h1>Productos</h1>
        </div>

        <div className="admin-products-actions">
          <Link to="/admin/pedidos" className="admin-top-btn">
            Ver pedidos
          </Link>

          <button type="button" className="admin-top-btn dark" onClick={resetForm}>
            Nuevo producto
          </button>
        </div>
      </section>

      <section className="container admin-products-metrics">
        <article>
          <span>Productos</span>
          <b>{items.length}</b>
        </article>

        <article>
          <span>Publicados</span>
          <b>{visibleCount}</b>
        </article>

        <article>
          <span>Stock total</span>
          <b>{totalStock}</b>
        </article>
      </section>

      {(err || msg) && (
        <section className="container">
          {err && <div className="checkout-error">{err}</div>}
          {msg && <div className="admin-success-msg">{msg}</div>}
        </section>
      )}

      <section className="container admin-products-layout">
        <form className="admin-product-form" onSubmit={save}>
          <h2>{title}</h2>

          <div className="admin-form-grid">
            <label>
              Código
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                placeholder="AD-0004"
              />
            </label>

            <label>
              Categoría / tipo
              <input
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                placeholder="Tops, Jeans, Remeras..."
              />
            </label>
          </div>

          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre de la prenda"
            />
          </label>

          <label>
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción visible para el cliente"
            />
          </label>

          <div className="admin-form-grid">
            <label>
              Precio compra
              <input
                type="number"
                value={form.precioCompra}
                onChange={(e) =>
                  setForm({ ...form, precioCompra: e.target.value })
                }
              />
            </label>

            <label>
              Precio venta
              <input
                type="number"
                value={form.precioVenta}
                onChange={(e) =>
                  setForm({ ...form, precioVenta: e.target.value })
                }
              />
            </label>
          </div>

          <div className="admin-form-grid">
            <label>
              Badge
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Nuevo, Últimas unidades..."
              />
            </label>

            <label className="admin-check-label">
              Publicado
              <input
                type="checkbox"
                checked={form.publicado !== false}
                onChange={(e) =>
                  setForm({ ...form, publicado: e.target.checked })
                }
              />
            </label>
          </div>

          <div className="admin-form-section-head">
            <h3>Variantes</h3>
            <button type="button" onClick={addVariant}>
              Agregar variante
            </button>
          </div>

          <div className="admin-variants-list">
            {form.variants.map((v, i) => (
              <div className="admin-variant-row" key={i}>
                <input
                  placeholder="Talle"
                  value={v.size}
                  onChange={(e) => setV(i, { size: e.target.value })}
                />

                <input
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => setV(i, { color: e.target.value })}
                />

                <input
                  placeholder="Stock"
                  type="number"
                  value={v.stock}
                  onChange={(e) => setV(i, { stock: e.target.value })}
                />

                <button type="button" onClick={() => removeVariant(i)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="admin-images-box">
            <h3>Imágenes</h3>
            <p>Podés cargar hasta 5 imágenes por prenda.</p>

            <div className="admin-product-images-grid">
              {files.map((file, index) => (
                <label className="admin-file-box" key={index}>
                  <span>Foto {index + 1}</span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;

                      setFiles((prev) => {
                        const next = [...prev];
                        next[index] = selected;
                        return next;
                      });
                    }}
                  />

                  {file && <small>{file.name}</small>}
                </label>
              ))}
            </div>

            {editId && (
              <small>
                Si cargás imágenes nuevas, reemplazan las imágenes actuales.
              </small>
            )}
          </div>

          <button className="black-cta full" disabled={loading}>
            {loading ? "GUARDANDO..." : "GUARDAR PRODUCTO"}
          </button>
        </form>

        <section className="admin-products-list">
          <div className="admin-products-list-head">
            <h2>Productos cargados</h2>
            <span>{items.length} productos</span>
          </div>

          {items.map((p) => (
            <article className="admin-product-row" key={p._id}>
              <img
                src={productImage(p)}
                alt={p.nombre}
                onError={(e) => {
                  e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                }}
              />

              <div>
                <b>{p.codigo}</b>
                <strong>{p.nombre}</strong>
                <span>{p.tipo || "Sin categoría"}</span>
              </div>

              <div>
                <small>Precio</small>
                <b>ARS {money(p.precioVenta)}</b>
              </div>

              <div>
                <small>Stock</small>
                <b>{stockTotal(p)}</b>
              </div>

              <div>
                <small>Estado</small>
                <span
                  className={
                    p.publicado !== false
                      ? "product-state published"
                      : "product-state hidden"
                  }
                >
                  {p.publicado !== false ? "Publicado" : "Oculto"}
                </span>
              </div>

              <button type="button" onClick={() => edit(p)}>
                Editar
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
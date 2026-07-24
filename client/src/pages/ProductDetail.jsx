import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api.js";
import { addToCart } from "../cart.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import { getProductImages } from "../utils/productImages.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");

function findVariant(product, size, color) {
  return (product?.variants || []).find(
    (v) => v.size === size && v.color === color
  );
}

function hasProductImage(product) {
  const hasImageIds =
    Array.isArray(product?.imageIds) && product.imageIds.length > 0;

  const hasImages =
    Array.isArray(product?.images) && product.images.length > 0;

  return Boolean(
    hasImageIds ||
      hasImages ||
      product?.imageId ||
      product?.image ||
      product?.imageUrl
  );
}

function getRandomRelatedProducts(products, currentProductId, count = 4) {
  if (!Array.isArray(products)) return [];

  const candidates = products.filter((p) => {
    const sameProduct = String(p?._id) === String(currentProductId);
    return !sameProduct && hasProductImage(p);
  });

  return [...candidates].sort(() => Math.random() - 0.5).slice(0, count);
}

function normalizeColorName(color) {
  return String(color || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSwatchColor(color) {
  const c = normalizeColorName(color);

  if (c.includes("blanco")) return "#ffffff";
  if (c.includes("negro")) return "#111111";

  if (c.includes("beige")) return "#d8c7b3";
  if (c.includes("crudo")) return "#eee4d5";
  if (c.includes("natural")) return "#e8dcc8";
  if (c.includes("camel")) return "#b8864f";
  if (c.includes("vison")) return "#9b8f84";
  if (c.includes("cemento")) return "#a7a7a0";

  if (c.includes("gris")) return "#b9b9b9";
  if (c.includes("azul")) return "#24476b";
  if (c.includes("celeste")) return "#9fc7df";

  if (c.includes("bordo")) return "#5b0f2e";
  if (c.includes("malbec")) return "#4b1028";
  if (c.includes("uva")) return "#5e2a73";

  if (c.includes("rojo")) return "#b51f1f";
  if (c.includes("rosa")) return "#e8b8c2";
  if (c.includes("verde")) return "#496b4a";
  if (c.includes("amarillo")) return "#f2d34f";

  if (c.includes("marron")) return "#6b4a35";
  if (c.includes("chocolate")) return "#4b2f24";

  return "#dddddd";
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedPool, setRelatedPool] = useState([]);

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("descripcion");

  useEffect(() => {
    const fallback =
      mockProducts.find((p) => String(p._id) === String(id)) || mockProducts[0];

    apiGet(`/api/products/${id}`)
      .then((data) => setProduct(data.item || data))
      .catch(() => setProduct(fallback));
  }, [id]);

  useEffect(() => {
    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;

        if (Array.isArray(list)) {
          setRelatedPool(list);
        }
      })
      .catch(() => {
        setRelatedPool(mockProducts);
      });
  }, []);

  useEffect(() => {
    const first = product?.variants?.[0];

    if (first) {
      setSize(first.size);
      setColor(first.color);
      setQty(1);
    }

    setActiveImg(0);
  }, [product?._id, product?.imageIds?.join("|"), product?.images?.join("|")]);

  const images = useMemo(() => getProductImages(product), [product]);

  const sizes = useMemo(
    () => [...new Set((product?.variants || []).map((v) => v.size))],
    [product]
  );

  const colors = useMemo(
    () => [
      ...new Set(
        (product?.variants || [])
          .filter((v) => v.size === size)
          .map((v) => v.color)
      ),
    ],
    [product, size]
  );

  const relatedProducts = useMemo(() => {
    return getRandomRelatedProducts(relatedPool, product?._id, 4);
  }, [relatedPool, product?._id]);

  const variant = findVariant(product, size, color);
  const stock = Number(variant?.stock || 0);
  const canBuy = stock > 0 && qty <= stock;

  const handleAdd = () => {
    if (!canBuy) return;

    addToCart({
      productId: product._id,
      codigo: product.codigo,
      nombre: product.nombre,
      precioVenta: product.precioVenta,
      precioCompra: product.precioCompra,
      image: images[0],
      sku: variant.sku,
      size,
      color,
      qty,
      stock,
    });

    setMsg("Producto agregado al carrito");
    setTimeout(() => setMsg(""), 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();

    if (!canBuy) return;

    handleAdd();
    navigate("/carrito");
  };

  if (!product) {
    return <main className="container loading-page">Cargando producto…</main>;
  }

  return (
    <main className="container detail-page">
      <div className="detail-top-row">
        <div className="breadcrumb">
          <Link to="/">Inicio</Link> / <Link to="/tienda">Tienda</Link> /{" "}
          {product.tipo} / {product.nombre}
        </div>

        <Link to="/tienda" className="detail-back-shop">
          Volver a la tienda →
        </Link>
      </div>

      <section className="detail-layout">
        <aside className="thumbs">
          {images.map((img, i) => (
            <button
              key={img + i}
              className={i === activeImg ? "active" : ""}
              onClick={() => setActiveImg(i)}
              type="button"
            >
              <img
                src={img}
                alt="miniatura"
                onError={(e) => {
                  e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                }}
              />
            </button>
          ))}
        </aside>

        <section className="main-photo">
          {product.badge && (
            <span className="product-badge">{product.badge}</span>
          )}

          <span className="heart big">♡</span>

          <img
            src={images[activeImg] || images[0]}
            alt={product.nombre}
            onError={(e) => {
              e.currentTarget.src = "/brand/adeline-logo-transparent.png";
            }}
          />
        </section>

        <section className="detail-info">
          <p className="type-label">{product.tipo}</p>

          <h1>{product.nombre}</h1>

          <h2>ARS {money(product.precioVenta)}</h2>
{/* 
          <p className="installments">
            hasta 6 cuotas sin interés de ARS {money(product.precioVenta / 6)}
          </p> */}

          <div className="divider" />

          <div className="selector-head">
            <b>TALLE</b>

            <button
              type="button"
              className="guide-link-btn"
              onClick={() => {
                setActiveTab("talles");

                setTimeout(() => {
                  document
                    .querySelector(".detail-tabs")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }}
            >
              GUÍA DE TALLES
            </button>
          </div>

          <div className="option-row">
            {sizes.map((s) => (
              <button
                key={s}
                className={s === size ? "selected" : ""}
                onClick={() => {
                  setSize(s);

                  const c =
                    (product.variants || []).find((v) => v.size === s)
                      ?.color || "";

                  setColor(c);
                  setQty(1);
                }}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>

          <p className="color-label">
            <b>COLOR:</b> {color || "-"}
          </p>

          <div className="option-row color-options">
            {colors.map((c, i) => (
              <button
                key={c}
                className={c === color ? "selected color" : "color"}
                onClick={() => setColor(c)}
                type="button"
              >
                <span
                  className="swatch"
                  title={c}
                  style={{ "--swatch-color": getSwatchColor(c) }}
                />
              </button>
            ))}
          </div>

          <p
            className={
              stock > 2 ? "stock ok" : stock > 0 ? "stock low" : "stock none"
            }
          >
            <span />
            {stock > 0
              ? `${stock} disponible${stock === 1 ? "" : "s"}`
              : "Sin stock"}
          </p>

          <div className="purchase-row">
            <div className="qty-control">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                type="button"
              >
                −
              </button>

              <b>{qty}</b>

              <button
                onClick={() => setQty(Math.min(stock, qty + 1))}
                type="button"
                disabled={stock <= 0 || qty >= stock}
              >
                +
              </button>
            </div>

            <button
              className="add-cart"
              disabled={!canBuy}
              onClick={handleAdd}
              type="button"
            >
              ▣ AGREGAR AL CARRITO
            </button>
          </div>

          <Link className="buy-now" to="/carrito" onClick={handleBuyNow}>
            COMPRAR AHORA →
          </Link>

          {msg && <div className="success-msg">{msg}</div>}

          <div className="mini-trust">
            <div>
              <b>COMPRA SEGURA</b>
              <p>Datos protegidos.</p>
            </div>

            <div>
              <b>TARJETAS Y DÉBITO</b>
              <p>Checkout online.</p>
            </div>

            <div>
              <b>TRANSFERENCIA</b>
              <p>Confirmación rápida.</p>
            </div>
          </div>
        </section>
      </section>

      <section className="detail-tabs">
        <button
          type="button"
          className={activeTab === "descripcion" ? "active" : ""}
          onClick={() => setActiveTab("descripcion")}
        >
          DESCRIPCIÓN
        </button>

        <button
          type="button"
          className={activeTab === "talles" ? "active" : ""}
          onClick={() => setActiveTab("talles")}
        >
          GUÍA DE TALLES
        </button>

        <button
          type="button"
          className={activeTab === "envios" ? "active" : ""}
          onClick={() => setActiveTab("envios")}
        >
          ENVÍOS Y CAMBIOS
        </button>
      </section>

      <section className="description-block">
        {activeTab === "descripcion" && (
          <p>
            {product.descripcion ||
              "P"}
          </p>
        )}

        {activeTab === "talles" && (
          <p className="size-guide-text">
            {product.tablaTalles ||
              ""}
          </p>
        )}

        {activeTab === "envios" && (
          <div className="shipping-text">
            <p>
              Realizamos envíos a todo el país. El costo y el plazo de entrega se
              coordinan al momento de confirmar la compra.
            </p>

            <p>
              Los cambios pueden solicitarse dentro de los 10 días posteriores a la
              recepción del pedido, siempre que la prenda se encuentre sin uso, en
              perfecto estado y con sus etiquetas correspondientes.
            </p>

            <p>
              Ante cualquier duda, podés contactarnos por WhatsApp antes de finalizar
              tu compra.
            </p>
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <>
          <h3 className="related-title">También te puede interesar</h3>

          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.codigo} product={p} compact />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
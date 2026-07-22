import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function getImageUrl(img) {
  if (!img) return "/brand/adeline-logo-transparent.png";

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return img;
    return `${API}/api/files/${img}`;
  }

  if (img.url) return img.url;
  if (img.path) return img.path;
  if (img.fileId) return `${API}/api/files/${img.fileId}`;
  if (img._id) return `${API}/api/files/${img._id}`;

  return "/brand/adeline-logo-transparent.png";
}

function getProductId(p) {
  return p?._id || p?.id || p?.slug || "";
}

function getProductName(p) {
  return p?.name || p?.nombre || "Producto";
}

function getProductCategory(p) {
  return p?.category || p?.categoria || p?.tipo || "ADELINE";
}

function getProductPrice(p) {
  return p?.price || p?.precioVenta || p?.salePrice || 0;
}

function getProductDescription(p) {
  return (
    p?.description ||
    p?.descripcion ||
    "Prenda seleccionada de la colección ADELINE. Diseño atemporal, terminaciones cuidadas y una silueta pensada para acompañarte con estilo."
  );
}

function getVariants(p) {
  const variants = p?.variants || p?.variantes || [];
  if (Array.isArray(variants) && variants.length) return variants;

  return [{ size: "Único", color: "Negro", stock: 0, sku: `${getProductId(p)}-UNICO-NEGRO` }];
}

function getVariantSize(v) {
  return v?.size || v?.talle || "Único";
}

function getVariantColor(v) {
  return v?.color || "Negro";
}

function getVariantStock(v) {
  return Number(v?.stock || v?.existencias || 0);
}

function getVariantSku(v, p) {
  return v?.sku || `${getProductId(p)}-${getVariantSize(v)}-${getVariantColor(v)}`;
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("descripcion");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setError("");

      try {
        const data = await apiGet(`/api/products/${id}`);
        const p = data?.item || data?.product || data;

        if (!alive) return;

        setProduct(p);
        const first = getVariants(p)[0];
        setSize(getVariantSize(first));
        setColor(getVariantColor(first));
      } catch (e) {
        const fallback =
          mockProducts.find((p) => String(p._id) === String(id)) ||
          mockProducts.find((p) => String(p.id) === String(id)) ||
          mockProducts.find((p) => String(p.slug) === String(id));

        if (!alive) return;

        if (fallback) {
          setProduct(fallback);
          const first = getVariants(fallback)[0];
          setSize(getVariantSize(first));
          setColor(getVariantColor(first));
        } else {
          setError("No pudimos encontrar este producto.");
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [id]);

  const variants = useMemo(() => getVariants(product), [product]);

  const sizes = useMemo(() => {
    return Array.from(new Set(variants.map((v) => getVariantSize(v))));
  }, [variants]);

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .filter((v) => getVariantSize(v) === size)
          .map((v) => getVariantColor(v))
      )
    );
  }, [variants, size]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (v) => getVariantSize(v) === size && getVariantColor(v) === color
      ) || null
    );
  }, [variants, size, color]);

  const stock = selectedVariant ? getVariantStock(selectedVariant) : 0;
  const canBuy = stock > 0;
  const availableQty = Math.max(1, Math.min(qty, stock || 1));

  const images = useMemo(() => {
    // ✅ Prioridad 1: imágenes subidas desde Admin/GridFS
    if (Array.isArray(product?.imageIds) && product.imageIds.length) {
      return product.imageIds.map((id) => `${API}/api/files/${id}`);
    }

    // ✅ Prioridad 2: imageId viejo, por compatibilidad
    if (product?.imageId) {
      return [`${API}/api/files/${product.imageId}`];
    }

    // ✅ Prioridad 3: imágenes por URL/demo
    const list = product?.images || product?.imagenes || product?.fotos || [];
    if (Array.isArray(list) && list.length) {
      return list.map(getImageUrl);
    }

    if (product?.image) {
      return [getImageUrl(product.image)];
    }

    return ["/brand/adeline-logo-transparent.png"];
  }, [product]);

  useEffect(() => {
    setActiveImg(0);
  }, [product?._id, product?.imageIds?.length]);

  useEffect(() => {
    if (stock > 0 && qty > stock) setQty(stock);
  }, [stock, qty]);

  if (error) {
    return (
      <main className="container product-detail-error">
        <h1>{error}</h1>
        <Link to="/" className="outline-btn">Volver al inicio</Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container product-detail-loading">
        <p>Cargando producto...</p>
      </main>
    );
  }

  const productName = getProductName(product);
  const productCategory = getProductCategory(product);
  const productPrice = getProductPrice(product);
  const productDescription = getProductDescription(product);

  const addToCart = () => {
    if (!canBuy || !selectedVariant) return;

    const cart = JSON.parse(localStorage.getItem("adeline_cart") || "[]");

    const item = {
      productId: getProductId(product),
      codigo: product.codigo || product.code || "",
      name: productName,
      nombre: productName,
      category: productCategory,
      tipo: productCategory,
      price: productPrice,
      precioVenta: productPrice,
      image: images[0],
      size,
      color,
      sku: getVariantSku(selectedVariant, product),
      qty: availableQty,
      stock,
    };

    const key = `${item.productId}-${item.sku}-${item.size}-${item.color}`;

    const idx = cart.findIndex(
      (x) => `${x.productId}-${x.sku}-${x.size}-${x.color}` === key
    );

    if (idx >= 0) {
      const nextQty = Number(cart[idx].qty || 0) + availableQty;
      cart[idx].qty = Math.min(nextQty, stock);
    } else {
      cart.push(item);
    }

    localStorage.setItem("adeline_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("adeline-cart-updated"));
  };

  const buyNow = () => {
    addToCart();
    navigate("/carrito");
  };

  const related = mockProducts
    .filter((p) => String(getProductId(p)) !== String(getProductId(product)))
    .slice(0, 4);

  return (
    <main className="product-detail-page">
      <section className="container product-breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/">Tienda</Link>
        <span>/</span>
        <span>{productCategory}</span>
        <span>/</span>
        <b>{productName}</b>
      </section>

      <section className="container product-detail-premium">
        <aside className="product-thumbs">
          {images.map((src, idx) => (
            <button
              type="button"
              key={`${src}-${idx}`}
              className={activeImg === idx ? "active" : ""}
              onClick={() => setActiveImg(idx)}
            >
              <img src={src} alt={`${productName} ${idx + 1}`} />
            </button>
          ))}

          {images.length < 2 && (
            <button type="button" className="muted-thumb">
              <span>+</span>
            </button>
          )}
        </aside>

        <section className="product-gallery-main">
          <span className="product-badge">NUEVO</span>
          <button type="button" className="favorite-btn">♡</button>

          <img
            src={images[activeImg] || images[0]}
            alt={productName}
            onError={(e) => {
              e.currentTarget.src = "/brand/adeline-logo-transparent.png";
            }}
          />

          <button type="button" className="gallery-arrow left">‹</button>
          <button type="button" className="gallery-arrow right">›</button>
          <button type="button" className="zoom-btn">⌕</button>
        </section>

        <aside className="product-buy-panel">
          <p className="product-category">{productCategory}</p>

          <h1>{productName}</h1>

          <div className="product-price-box">
            <strong>ARS {money(productPrice)}</strong>
            <small>hasta 6 cuotas sin interés de ARS {money(productPrice / 6)}</small>
          </div>

          <p className="product-short-description">{productDescription}</p>

          <div className="product-option-block">
            <div className="option-head">
              <span>TALLE</span>
              <button type="button">GUÍA DE TALLES</button>
            </div>

            <div className="size-list">
              {sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={size === s ? "selected" : ""}
                  onClick={() => {
                    setSize(s);
                    const firstColor = variants.find((v) => getVariantSize(v) === s);
                    setColor(firstColor ? getVariantColor(firstColor) : "");
                    setQty(1);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="product-option-block">
            <span className="option-label">COLOR: {color || "-"}</span>

            <div className="color-list">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  title={c}
                  className={color === c ? "selected" : ""}
                  onClick={() => {
                    setColor(c);
                    setQty(1);
                  }}
                >
                  <span style={{ background: colorToCss(c) }} />
                </button>
              ))}
            </div>
          </div>

          <div className={`stock-status ${canBuy ? "in-stock" : "out-stock"}`}>
            <span />
            {canBuy ? (
              stock <= 3 ? `Últimas ${stock} unidades` : "Stock disponible"
            ) : (
              "Sin stock"
            )}
          </div>

          <div className="purchase-row">
            <div className="qty-box">
              <span>Cantidad</span>
              <div>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, Number(n) - 1))}
                  disabled={!canBuy}
                >
                  −
                </button>
                <b>{availableQty}</b>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.min(stock, Number(n) + 1))}
                  disabled={!canBuy || availableQty >= stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="buy-buttons">
              <button
                type="button"
                className="add-cart-btn"
                disabled={!canBuy}
                onClick={addToCart}
              >
                🛍 Agregar al carrito
              </button>

              <button
                type="button"
                className="buy-now-btn"
                disabled={!canBuy}
                onClick={buyNow}
              >
                Comprar ahora →
              </button>
            </div>
          </div>

          {!canBuy && (
            <p className="stock-warning">
              Esta combinación de talle y color no está disponible.
            </p>
          )}

          <div className="detail-trust">
            <div>
              <b>Compra segura</b>
              <small>Sitio protegido y datos encriptados.</small>
            </div>
            <div>
              <b>Tarjetas y débito</b>
              <small>Checkout preparado para pago online.</small>
            </div>
            <div>
              <b>Transferencia</b>
              <small>Confirmación rápida de pagos.</small>
            </div>
          </div>

          <div className="detail-tabs">
            <button
              type="button"
              className={tab === "descripcion" ? "active" : ""}
              onClick={() => setTab("descripcion")}
            >
              Descripción
            </button>
            <button
              type="button"
              className={tab === "talles" ? "active" : ""}
              onClick={() => setTab("talles")}
            >
              Guía de talles
            </button>
            <button
              type="button"
              className={tab === "envios" ? "active" : ""}
              onClick={() => setTab("envios")}
            >
              Envíos y cambios
            </button>
          </div>

          <div className="tab-content">
            {tab === "descripcion" && (
              <>
                <p>{productDescription}</p>
                <ul>
                  <li>Diseño atemporal</li>
                  <li>Terminaciones cuidadas</li>
                  <li>Ideal para combinar con básicos o prendas de temporada</li>
                </ul>
              </>
            )}

            {tab === "talles" && (
              <p>
                Te recomendamos elegir tu talle habitual. Si estás entre dos talles,
                elegí el mayor para un calce más relajado.
              </p>
            )}

            {tab === "envios" && (
              <p>
                Envíos a domicilio o punto de retiro. También podés coordinar entrega
                local según disponibilidad.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="container related-products">
        <h2>También te puede interesar</h2>
        <div className="related-grid">
          {related.map((p) => (
            <ProductCard key={getProductId(p)} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

function colorToCss(color) {
  const c = String(color || "").toLowerCase();

  if (c.includes("negro")) return "#111";
  if (c.includes("blanco")) return "#f7f5f0";
  if (c.includes("beige") || c.includes("natural")) return "#d5c0a7";
  if (c.includes("azul") || c.includes("celeste") || c.includes("jean")) return "#8fb0c7";
  if (c.includes("rojo")) return "#9f2e2e";
  if (c.includes("rosa")) return "#dfb6b8";
  if (c.includes("verde")) return "#6f8060";
  if (c.includes("gris")) return "#9b9b9b";

  return "#cfc6bc";
}
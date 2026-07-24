import { Link } from "react-router-dom";
import { getProductImages } from "../utils/productImages.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");

export default function ProductCard({ product }) {
  const stock = (product.variants || []).reduce(
    (acc, v) => acc + Number(v.stock || 0),
    0
  );

  const images = getProductImages(product);
  const mainImg = images[0];
  const hoverImg = images[1] || images[0];

  return (
    <article className="ad-product-card">
      <Link to={`/producto/${product._id}`} className="ad-product-img-wrap">
        {stock <= 0 && (
          <span className="ad-product-tag dark">
            SIN STOCK
          </span>
        )}

        <img
          className="ad-product-img main"
          src={mainImg}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/brand/adeline-logo-transparent.png";
          }}
        />

        <img
          className="ad-product-img hover"
          src={hoverImg}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              mainImg || "/brand/adeline-logo-transparent.png";
          }}
        />
      </Link>

      <div className="ad-product-info">
        <p className="ad-product-name">{product.nombre}</p>
        <p className="ad-product-price">${money(product.precioVenta)}</p>
      </div>
    </article>
  );
}
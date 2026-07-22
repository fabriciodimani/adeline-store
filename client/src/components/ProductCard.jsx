import { Link } from "react-router-dom";
import { getProductImages } from "../utils/productImages.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");
const FALLBACK = "/brand/adeline-logo-transparent.png";

function hasRealImage(product) {
  const hasImageIds = Array.isArray(product?.imageIds) && product.imageIds.length > 0;
  const hasImages = Array.isArray(product?.images) && product.images.length > 0;
  return Boolean(hasImageIds || hasImages || product?.imageId || product?.image || product?.imageUrl);
}

export default function ProductCard({ product, imageOnly = false }) {
  const stock = (product?.variants || []).reduce(
    (acc, v) => acc + Number(v.stock || 0),
    0
  );

  const images = getProductImages(product);
  const mainImg = images[0] || FALLBACK;
  const hoverImg = images[1] || mainImg;
  const hasImage = hasRealImage(product);

  if (imageOnly) {
    return (
      <Link to={`/producto/${product._id}`} className="adeline-image-only-card">
        <img
          src={mainImg}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
        />
      </Link>
    );
  }

  return (
    <article className="ad-product-card">
      <Link to={`/producto/${product._id}`} className="ad-product-img-wrap">
        {hasImage && (
          <span className={stock > 0 ? "ad-product-tag dark" : "ad-product-tag red"}>
            {stock > 0 ? "NUEVO" : "SIN STOCK"}
          </span>
        )}

        <img
          className="ad-product-img main"
          src={mainImg}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
        />

        <img
          className="ad-product-img hover"
          src={hoverImg}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = mainImg || FALLBACK;
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

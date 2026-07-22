import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import AdelineFooter from "../components/AdelineFooter.jsx";

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

function sortProducts(products) {
  const source =
    Array.isArray(products) && products.length ? products : mockProducts;

  const withImages = source.filter(hasProductImage);
  const withoutImages = source.filter((p) => !hasProductImage(p));

  return [...withImages, ...withoutImages];
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;
        if (Array.isArray(list)) setProducts(list);
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const visibleProducts = useMemo(() => {
    const ordered = sortProducts(products);
    const q = search.trim().toLowerCase();

    if (!q) return ordered;

    return ordered.filter((p) => {
      return (
        String(p.nombre || "").toLowerCase().includes(q) ||
        String(p.codigo || "").toLowerCase().includes(q) ||
        String(p.tipo || "").toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  return (
    <>
      <main className="adeline-shop-page">
        <section className="adeline-shop-header">
          <div>
            <p>TIENDA</p>
            <h1>Todos los productos</h1>
            <span>{visibleProducts.length} artículos disponibles</span>
          </div>

          <Link to="/" className="adeline-shop-back">
            ← VOLVER AL INICIO
          </Link>
        </section>

        <section className="adeline-shop-toolbar">
          <input
            type="search"
            placeholder="Buscar producto, código o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        <section className="adeline-shop-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id || product.codigo}
              product={product}
              compact
            />
          ))}
        </section>
      </main>

      <AdelineFooter />
    </>
  );
}
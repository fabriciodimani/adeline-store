import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import TrustBar from "../components/TrustBar.jsx";

const categories = [
  {
    name: "VESTIDOS",
    subtitle: "Siluetas fluidas",
    image: mockProducts[5]?.images?.[0],
  },
  {
    name: "TOPS",
    subtitle: "Básicos elevados",
    image: mockProducts[1]?.images?.[0],
  },
  {
    name: "JEANS",
    subtitle: "Denim esencial",
    image: mockProducts[0]?.images?.[0],
  },
  {
    name: "REMERAS",
    subtitle: "Algodón premium",
    image: mockProducts[2]?.images?.[0],
  },
  {
    name: "FALDAS",
    subtitle: "Elegancia diaria",
    image: mockProducts[3]?.images?.[0],
  },
  {
    name: "CONJUNTOS",
    subtitle: "Looks completos",
    image: mockProducts[4]?.images?.[0],
  },
];

export default function Home() {
  const [products, setProducts] = useState(mockProducts);

  useEffect(() => {
    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;
        if (Array.isArray(list) && list.length) setProducts(list);
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const featured = useMemo(() => products.slice(0, 8), [products]);

  return (
    <main className="home-premium">
      <section className="hero-premium" id="inicio">
        <div className="hero-premium-copy">
          <p className="eyebrow premium-eyebrow">
            OTOÑO / INVIERNO 2024 <span />
          </p>

          <h1>Nueva colección</h1>

          <p className="hero-lead">
            Diseños atemporales. Calidad que se siente.
            <br />
            Estilo que perdura.
          </p>

          <div className="hero-actions">
            <a href="#tienda" className="black-cta premium-cta">
              COMPRAR AHORA <span>→</span>
            </a>

            <a href="#coleccion" className="soft-link">
              Ver colección
            </a>
          </div>
        </div>

        <div className="hero-premium-media">
          <div className="hero-season-card">
            <small>NUEVA TEMPORADA</small>
            <b>Prendas seleccionadas</b>
          </div>
        </div>
      </section>

      <section className="container premium-category-wrap" id="coleccion">
        <div className="premium-category-strip">
          {categories.map((c) => (
            <a className="premium-category-tile" key={c.name} href="#tienda">
              <img src={c.image} alt={c.name} />
              <div>
                <b>{c.name}</b>
                <small>{c.subtitle}</small>
                <span>Ver más →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="container product-section premium-products" id="tienda">
        <div className="section-head premium-section-head">
          <div>
            <p className="section-kicker">SELECCIÓN ADELINE</p>
            <h2>Productos destacados</h2>
          </div>

          <a href="#tienda">VER TODOS LOS PRODUCTOS →</a>
        </div>

        <div className="premium-product-grid">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      <section className="container premium-trust-section">
        <TrustBar />
      </section>
    </main>
  );
}
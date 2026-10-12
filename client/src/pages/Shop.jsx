import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import AdelineFooter from "../components/AdelineFooter.jsx";

const PAGE_SIZE = 28;

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sortProducts(products) {
  const source = Array.isArray(products) ? products : [];

  const published = source.filter((p) => p.publicado !== false);

  return [...published].sort((a, b) => {
    const da = new Date(a?.createdAt || 0).getTime();
    const db = new Date(b?.createdAt || 0).getTime();
    return db - da;
  });
}

function productMatchesCategory(product, categoria) {
  if (!categoria) return true;

  const wanted = normalizeText(categoria);

  const categorias = Array.isArray(product?.categorias)
    ? product.categorias
    : [];

  const allCategories = [...categorias, product?.tipo, product?.badge].filter(
    Boolean
  );

  return allCategories.some((cat) => normalizeText(cat) === wanted);
}

function productMatchesSearch(product, q) {
  if (!q) return true;

  const text = [
    product?.nombre,
    product?.codigo,
    product?.tipo,
    product?.descripcion,
    ...(Array.isArray(product?.categorias) ? product.categorias : []),
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(text).includes(normalizeText(q));
}

function getPageNumbers(totalPages, currentPage) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    const isFirst = i === 1;
    const isLast = i === totalPages;
    const isNearCurrent = Math.abs(i - currentPage) <= 2;

    if (isFirst || isLast || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}

export default function Shop() {
  const [searchParams] = useSearchParams();

  const categoria = searchParams.get("categoria") || "";
  const queryFromUrl = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(queryFromUrl);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setLoading(true);

    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [categoria, search]);

  const visibleProducts = useMemo(() => {
    const ordered = sortProducts(products);

    return ordered.filter((p) => {
      return (
        productMatchesCategory(p, categoria) &&
        productMatchesSearch(p, search)
      );
    });
  }, [products, categoria, search]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visibleProducts.slice(start, start + PAGE_SIZE);
  }, [visibleProducts, page]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);

    setTimeout(() => {
      document
        .querySelector(".adeline-shop-header")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const title = categoria || "Todos los productos";

  return (
    <>
      <main className="adeline-shop-page">
        <section className="adeline-shop-header">
          <div>
            <p>TIENDA</p>
            <h1>{title}</h1>
            <span>
              {loading
                ? "Cargando productos..."
                : `${visibleProducts.length} artículos disponibles`}
            </span>
          </div>

          <div className="adeline-shop-header-actions">
            {(categoria || search) && (
              <Link to="/tienda" className="adeline-shop-back">
                LIMPIAR FILTROS
              </Link>
            )}

            <Link to="/" className="adeline-shop-back">
              ← VOLVER AL INICIO
            </Link>
          </div>
        </section>

        <section className="adeline-shop-toolbar">
          <input
            type="search"
            placeholder="Buscar producto, código o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {!loading && visibleProducts.length > 0 && (
          <section className="adeline-shop-count-mobile">
            Página {page} de {totalPages}
          </section>
        )}

        {loading ? (
          <section className="adeline-shop-loading">
            Cargando colección...
          </section>
        ) : (
          <>
            <section className="adeline-shop-grid">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.codigo}
                  product={product}
                  compact
                />
              ))}
            </section>

            {visibleProducts.length > PAGE_SIZE && (
              <section className="adeline-pagination">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>

                <div>
                  {getPageNumbers(totalPages, page).map((p, index) =>
                    p === "..." ? (
                      <span key={`dots-${index}`}>...</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        className={p === page ? "active" : ""}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </section>
            )}

            {visibleProducts.length === 0 && (
              <section className="adeline-empty-shop">
                <h3>No encontramos productos</h3>
                <p>Probá con otra búsqueda o volvé a ver toda la colección.</p>
                <Link to="/tienda">VER TODO</Link>
              </section>
            )}
          </>
        )}
      </main>

      <AdelineFooter />
    </>
  );
}
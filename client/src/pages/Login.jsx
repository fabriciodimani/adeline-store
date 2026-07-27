import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email.trim()) {
      setErr("Ingresá el email.");
      return;
    }

    if (!password.trim()) {
      setErr("Ingresá la contraseña.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo iniciar sesión");
      }

      const token = data.token || data.accessToken;
      const user = data.user || data.usuario || null;

      if (!token) {
        throw new Error("El servidor no devolvió token.");
      }

      localStorage.setItem("adeline_token", token);

      if (user) {
        localStorage.setItem("adeline_user", JSON.stringify(user));
      }

      window.dispatchEvent(new Event("storage"));

      navigate("/admin/productos");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>
          Adeline
          <br />
          Administración
        </h1>

        <p>
          Acceso privado para cargar productos, fotos, stock y pedidos.
        </p>

        {err && <div className="checkout-error">{err}</div>}

        <form onSubmit={login} autoComplete="off">
          <label>
            Email
            <input
              type="email"
              name="adeline_admin_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="off"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="adeline_admin_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </section>
    </main>
  );
}
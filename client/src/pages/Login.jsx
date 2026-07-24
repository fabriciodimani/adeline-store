import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('pia@adeline.com');
  const [password, setPassword] = useState('Adeline123!');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const data = await apiPost('/api/auth/login', { email, password });
      localStorage.setItem('adeline_token', data.token);
      localStorage.setItem('adeline_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      navigate('/admin/productos');
    } catch (e) {
      setErr(e.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={login}>
        <img src="/logo-adeline.svg" alt="Adeline" />
        <h1>Administración</h1>
        <p>Acceso privado para cargar productos, fotos, stock y pedidos.</p>
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        {err && <div className="error-msg">{err}</div>}
        <button className="black-cta full">ENTRAR</button>
        {/* <small>Semilla: pia@adeline.com / Adeline123!</small> */}
      </form>
    </main>
  );
}

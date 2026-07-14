const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('adeline_token') || '';
}

async function parse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : (data?.error || data?.message || 'Error de API');
    throw new Error(msg);
  }
  return data;
}

export async function apiGet(path, auth = false) {
  const headers = {};
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, { headers });
  return parse(res);
}

export async function apiPost(path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST', headers, body: JSON.stringify(body || {})
  });
  return parse(res);
}

export async function apiPut(path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT', headers, body: JSON.stringify(body || {})
  });
  return parse(res);
}

export async function apiPostForm(path, formData, auth = true) {
  const headers = {};
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData });
  return parse(res);
}

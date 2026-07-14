const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || '').toLowerCase().trim(), activo: true });
  if (!user) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
  const ok = bcrypt.compareSync(String(password || ''), user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
  const token = jwt.sign({ sub: String(user._id), nombre: user.nombre, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
  res.json({ ok: true, token, user: { id: String(user._id), nombre: user.nombre, email: user.email, role: user.role } });
});

router.get('/me', requireAuth, (req, res) => res.json({ ok: true, user: req.user }));

module.exports = router;

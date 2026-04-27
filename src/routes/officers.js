const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: 'OFFICER' },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { violations: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(officers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const officer = await prisma.user.create({
      data: { name, email, password: hashed, phone, role: 'OFFICER' },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(officer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

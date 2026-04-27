const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(vehicles);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', auth, async (req, res) => {
  try {
    const { plate } = req.query;
    const vehicle = await prisma.vehicle.findFirst({
      where: { plateNumber: { contains: plate, mode: 'insensitive' } },
      include: {
        violations: {
          include: { violationType: true, officer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(vehicle);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        violations: {
          include: { violationType: true, officer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(vehicle);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.json(vehicle);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data: req.body });
    res.json(vehicle);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

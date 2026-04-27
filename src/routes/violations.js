const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { status, officerId } = req.query;
    const where = {};
    if (status) where.paymentStatus = status;
    if (officerId) where.officerId = officerId;
    const violations = await prisma.violation.findMany({
      where,
      include: {
        vehicle: true,
        violationType: true,
        officer: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(violations);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { plateNumber, ownerName, ownerPhone, brand, color, violationTypeId, location, notes } = req.body;

    let vehicle = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({ data: { plateNumber, ownerName: ownerName || 'غير معروف', ownerPhone, brand, color } });
    }

    const violationType = await prisma.violationType.findUnique({ where: { id: violationTypeId } });

    const violation = await prisma.violation.create({
      data: {
        vehicleId: vehicle.id,
        violationTypeId,
        officerId: req.user.id,
        location,
        notes,
        fine: violationType.fine
      },
      include: { vehicle: true, violationType: true, officer: { select: { name: true } } }
    });
    res.json(violation);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/pay', auth, async (req, res) => {
  try {
    const violation = await prisma.violation.update({
      where: { id: req.params.id },
      data: { paymentStatus: 'PAID', paidAt: new Date() }
    });
    res.json(violation);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const violation = await prisma.violation.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, violationType: true, officer: { select: { name: true } } }
    });
    res.json(violation);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

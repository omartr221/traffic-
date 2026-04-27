const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const [totalViolations, unpaid, paid, totalVehicles, totalOfficers, recentViolations] = await Promise.all([
      prisma.violation.count(),
      prisma.violation.count({ where: { paymentStatus: 'UNPAID' } }),
      prisma.violation.count({ where: { paymentStatus: 'PAID' } }),
      prisma.vehicle.count(),
      prisma.user.count({ where: { role: 'OFFICER' } }),
      prisma.violation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true, violationType: true, officer: { select: { name: true } } }
      })
    ]);

    const fineStats = await prisma.violation.aggregate({ _sum: { fine: true } });
    const paidFines = await prisma.violation.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { fine: true } });

    res.json({
      totalViolations,
      unpaid,
      paid,
      totalVehicles,
      totalOfficers,
      totalFines: fineStats._sum.fine || 0,
      collectedFines: paidFines._sum.fine || 0,
      recentViolations
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

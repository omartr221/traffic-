const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const officerPass = await bcrypt.hash('officer123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@traffic.com' },
    update: {},
    create: { name: 'مدير النظام', email: 'admin@traffic.com', password: adminPass, role: 'ADMIN' }
  });

  await prisma.user.upsert({
    where: { email: 'officer@traffic.com' },
    update: {},
    create: { name: 'أحمد المرور', email: 'officer@traffic.com', password: officerPass, role: 'OFFICER', phone: '0911234567' }
  });

  const types = [
    { name: 'تجاوز الإشارة الحمراء', fine: 5000, description: 'تجاوز إشارة المرور الحمراء' },
    { name: 'تجاوز السرعة المقررة', fine: 3000, description: 'قيادة بسرعة تتجاوز الحد المسموح' },
    { name: 'التوقف في مكان ممنوع', fine: 2000, description: 'إيقاف السيارة في منطقة محظورة' },
    { name: 'عدم ربط حزام الأمان', fine: 1000, description: 'قيادة بدون حزام أمان' },
    { name: 'استخدام الهاتف أثناء القيادة', fine: 2500, description: 'استخدام الجوال أثناء قيادة السيارة' },
    { name: 'عدم احترام أولوية المرور', fine: 1500, description: 'عدم إعطاء الأولوية للمركبات الأخرى' },
    { name: 'قيادة بدون رخصة', fine: 10000, description: 'قيادة السيارة بدون رخصة سارية' },
    { name: 'عدم وجود وثائق السيارة', fine: 3000, description: 'عدم حمل وثائق المركبة' },
  ];

  for (const t of types) {
    await prisma.violationType.upsert({ where: { name: t.name }, update: {}, create: t });
  }

  console.log('✅ Seed completed');
}

main().catch(console.error).finally(() => prisma.$disconnect());

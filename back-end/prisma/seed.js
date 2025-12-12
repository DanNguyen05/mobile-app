import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@healthycare.com' },
    update: {},
    create: {
      email: 'demo@healthycare.com',
      passwordHash,
      name: 'Demo User',
      age: 30,
      gender: 'male',
      heightCm: 175,
      weightKg: 70,
      goal: 'lose_weight',
      activityLevel: 'moderately_active',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample food log
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const foodLog = await prisma.foodLog.create({
    data: {
      userId: user.id,
      eatenAt: today,
      mealType: 'Lunch',
      foodName: 'Grilled Chicken with Rice',
      calories: 500,
      proteinGrams: 45,
      carbsGrams: 55,
      fatGrams: 12,
      amount: '300g',
    },
  });

  console.log('✅ Created sample food log');

  // Create sample workout log
  const workoutLog = await prisma.workoutLog.create({
    data: {
      userId: user.id,
      completedAt: today,
      exerciseName: 'Morning Jog',
      durationMinutes: 30,
      caloriesBurnedEstimated: 250,
      isAiSuggested: false,
    },
  });

  console.log('✅ Created sample workout log');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: demo@healthycare.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { db } from './connection';
import { projects, tasks } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await db.delete(tasks);
    await db.delete(projects);
    console.log('🧹 Cleared existing data');

    // Insert sample projects
    const sampleProjects = await db.insert(projects).values([
      {
        name: 'Website Redesign',
        startDate: '2025-01-01',
        displayOrder: 10
      },
      {
        name: 'Mobile App Development',
        startDate: '2025-02-01', 
        displayOrder: 20
      },
      {
        name: 'Data Migration',
        startDate: '2025-03-01',
        displayOrder: 30
      }
    ]).returning();

    console.log('📊 Created projects:', sampleProjects.length);

    // Insert sample tasks
    const sampleTasks = await db.insert(tasks).values([
      // Website Redesign tasks
      {
        projectId: sampleProjects[0].id,
        name: 'UI/UX Design',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        displayOrder: 10
      },
      {
        projectId: sampleProjects[0].id,
        name: 'Frontend Development',
        startDate: '2025-01-16',
        endDate: '2025-02-15',
        displayOrder: 20
      },
      {
        projectId: sampleProjects[0].id,
        name: 'Testing & QA',
        startDate: '2025-02-16',
        endDate: '2025-02-28',
        displayOrder: 30
      },
      // Mobile App tasks
      {
        projectId: sampleProjects[1].id,
        name: 'Requirements Analysis',
        startDate: '2025-02-01',
        endDate: '2025-02-07',
        displayOrder: 10
      },
      {
        projectId: sampleProjects[1].id,
        name: 'Native Development',
        startDate: '2025-02-08',
        endDate: '2025-04-30',
        displayOrder: 20
      },
      // Data Migration tasks
      {
        projectId: sampleProjects[2].id,
        name: 'Data Audit',
        startDate: '2025-03-01',
        endDate: '2025-03-14',
        displayOrder: 10
      },
      {
        projectId: sampleProjects[2].id,
        name: 'Migration Scripts',
        startDate: '2025-03-15',
        endDate: '2025-03-31',
        displayOrder: 20
      }
    ]).returning();

    console.log('📋 Created tasks:', sampleTasks.length);

    // Verify data
    const projectCount = await db.select().from(projects);
    const taskCount = await db.select().from(tasks);

    console.log(`✅ Seeding complete! ${projectCount.length} projects, ${taskCount.length} tasks`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
const { sequelize } = require('./src/models');

async function run() {
  try {
    // Create notifications table if not exists
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_notifications_type" AS ENUM (
          'TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'TASK_APPROVED', 'TASK_REVISION',
          'TASK_COMMENT', 'TASK_DEADLINE_SOON', 'MEMBER_ADDED', 'MEMBER_ROLE_CHANGED',
          'PROJECT_UPDATE', 'INTERVIEW_SCHEDULED', 'APPLICATION_STATUS'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type "enum_notifications_type" NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);`);
    console.log('✅ Notifications table ready');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();

const { sequelize } = require('./src/models');

async function run() {
  try {
    // Create the ENUM type for action
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_activity_logs_action" AS ENUM (
          'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'PASSWORD_CHANGED', 'USER_STATUS_CHANGED',
          'TASK_CREATED', 'TASK_UPDATED', 'TASK_STATUS_CHANGED', 'TASK_DELETED',
          'TASK_APPROVED', 'TASK_REVISION_REQUESTED', 'TASK_COMMENTED', 'SUBTASK_ADDED', 'SUBTASK_TOGGLED',
          'WORKSPACE_MEMBER_ADDED', 'WORKSPACE_MEMBER_REMOVED', 'WORKSPACE_MEMBER_ROLE_CHANGED',
          'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_MANAGER_ASSIGNED', 'PROJECT_CLOSED',
          'APPLICATION_SUBMITTED', 'APPLICATION_STATUS_CHANGED', 'INTERVIEW_SCHEDULED',
          'PAYMENT_CREATED', 'PAYMENT_PROCESSED',
          'MEMBER_EVALUATED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        action "enum_activity_logs_action" NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        entity_name VARCHAR(500),
        old_value TEXT,
        new_value TEXT,
        description TEXT,
        metadata JSONB DEFAULT '{}',
        ip_address VARCHAR(50),
        user_agent VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Indexes for fast querying
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);`);

    console.log('✅ activity_logs table ready');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();

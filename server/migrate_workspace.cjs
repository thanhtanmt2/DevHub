const { sequelize, Task, WorkspaceMember } = require('./src/models');

async function migrate() {
  try {
    console.log('Starting migration...');

    // Add new columns to tasks table
    const qi = sequelize.getQueryInterface();

    // Check and add labels column
    try {
      await qi.addColumn('tasks', 'labels', {
        type: require('sequelize').DataTypes.ARRAY(require('sequelize').DataTypes.STRING),
        defaultValue: []
      });
      console.log('✓ Added labels to tasks');
    } catch (e) { console.log('labels already exists or error:', e.message); }

    // Add priority URGENT value and update enum
    try {
      await sequelize.query(`ALTER TYPE "enum_tasks_priority" ADD VALUE IF NOT EXISTS 'URGENT'`);
      console.log('✓ Added URGENT to priority enum');
    } catch (e) { console.log('URGENT enum note:', e.message); }

    // Add CANCELLED status
    try {
      await sequelize.query(`ALTER TYPE "enum_tasks_status" ADD VALUE IF NOT EXISTS 'CANCELLED'`);
      console.log('✓ Added CANCELLED to status enum');
    } catch (e) { console.log('CANCELLED status note:', e.message); }

    // Add estimated_hours, actual_hours, position, review columns
    const taskCols = [
      { name: 'estimated_hours', type: 'DECIMAL(6,2)' },
      { name: 'actual_hours', type: 'DECIMAL(6,2)' },
      { name: 'position', type: 'INTEGER', default: 0 },
      { name: 'review_note', type: 'TEXT' },
      { name: 'reviewed_by', type: 'UUID' },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ' },
    ];

    for (const col of taskCols) {
      try {
        await sequelize.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} ${col.default !== undefined ? `DEFAULT ${col.default}` : ''}`);
        console.log(`✓ Added ${col.name} to tasks`);
      } catch (e) { console.log(`${col.name} note:`, e.message); }
    }

    // Add review_status enum and column
    try {
      await sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_tasks_review_status" AS ENUM ('PENDING', 'APPROVED', 'REVISION_REQUIRED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await sequelize.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_status "enum_tasks_review_status" DEFAULT 'PENDING'`);
      console.log('✓ Added review_status to tasks');
    } catch (e) { console.log('review_status note:', e.message); }

    // Remove old workspace_member_id from tasks (it's now many-to-many)
    try {
      await sequelize.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS workspace_member_id`);
      console.log('✓ Removed workspace_member_id from tasks');
    } catch (e) { console.log('drop workspace_member_id note:', e.message); }

    // Add role to workspace_members
    try {
      await sequelize.query(`DO $$ BEGIN CREATE TYPE "enum_workspace_members_role" AS ENUM ('MANAGER', 'LEAD', 'MEMBER', 'VIEWER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
      await sequelize.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS role "enum_workspace_members_role" DEFAULT 'MEMBER'`);
      console.log('✓ Added role to workspace_members');
    } catch (e) { console.log('role note:', e.message); }

    // Create task_assignees table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        workspace_member_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
        UNIQUE(task_id, workspace_member_id)
      )
    `);
    console.log('✓ Created task_assignees');

    // Create sub_tasks table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sub_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_done BOOLEAN DEFAULT false,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Created sub_tasks');

    // Create task_comments table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        workspace_member_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Created task_comments');

    // Create task_activities table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS task_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        workspace_member_id UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        description VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Created task_activities');

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

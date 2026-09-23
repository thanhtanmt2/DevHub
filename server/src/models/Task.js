module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Task', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: { 
      type: DataTypes.ENUM('URGENT', 'HIGH', 'MEDIUM', 'LOW'), 
      defaultValue: 'MEDIUM' 
    },
    status: { 
      type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'), 
      defaultValue: 'TODO' 
    },
    labels: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    deadline: { type: DataTypes.DATE },
    estimated_hours: { type: DataTypes.DECIMAL(6, 2) },
    actual_hours: { type: DataTypes.DECIMAL(6, 2) },
    completion_rate: { type: DataTypes.SMALLINT, defaultValue: 0 },
    position: { type: DataTypes.INTEGER, defaultValue: 0 }, // for ordering in kanban
    review_note: { type: DataTypes.TEXT }, // manager's feedback on approve/reject
    reviewed_by: { type: DataTypes.UUID }, // workspace_member_id of reviewer
    reviewed_at: { type: DataTypes.DATE },
    review_status: { 
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REVISION_REQUIRED'), 
      defaultValue: 'PENDING' 
    },
  }, { tableName: 'tasks', underscored: true });
};

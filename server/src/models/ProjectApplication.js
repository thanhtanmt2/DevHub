module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectApplication', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_job_id: { type: DataTypes.UUID, allowNull: false },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    cover_letter: { type: DataTypes.TEXT },
    cv_url: { type: DataTypes.STRING(500) },
    status: { 
      type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'), 
      defaultValue: 'PENDING' 
    },
    interview_time: { type: DataTypes.DATE },
    meet_url: { type: DataTypes.STRING(500) },
    interview_note: { type: DataTypes.TEXT },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { 
    tableName: 'project_applications', 
    underscored: true, 
    updatedAt: 'updated_at', 
    createdAt: 'applied_at' 
  });
};


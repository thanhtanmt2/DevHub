module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CandidateEvaluation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_member_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    score: { type: DataTypes.DECIMAL(4, 2), allowNull: false, validate: { min: 0, max: 10 } },
    comment: { type: DataTypes.TEXT },
    evaluated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'candidate_evaluations', underscored: true, timestamps: false });
};

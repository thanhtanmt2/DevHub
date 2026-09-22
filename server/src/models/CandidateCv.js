module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CandidateCv', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    file_url: { type: DataTypes.STRING(500), allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_size: { type: DataTypes.INTEGER },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { 
    tableName: 'candidate_cvs', 
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};

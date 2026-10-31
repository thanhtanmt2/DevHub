'use strict';

module.exports = (sequelize, DataTypes) => {
  const SavedCandidate = sequelize.define('SavedCandidate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    candidate_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'saved_candidates',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  return SavedCandidate;
};

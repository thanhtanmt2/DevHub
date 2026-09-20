module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PaymentInformation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    account_holder_name: { type: DataTypes.STRING(150), allowNull: false },
    bank_name: { type: DataTypes.STRING(150), allowNull: false },
    account_number: { type: DataTypes.STRING(50), allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
  }, { tableName: 'payment_information', underscored: true });
};

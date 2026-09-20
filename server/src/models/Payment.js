module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_member_id: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, validate: { min: 0.01 } },
    payment_method: { type: DataTypes.STRING(30) },
    transaction_code: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED'), defaultValue: 'PENDING' },
    paid_at: { type: DataTypes.DATE },
  }, { tableName: 'payments', underscored: true, updatedAt: false });
};

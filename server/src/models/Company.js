module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Company', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    tax_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    address: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), validate: { isEmail: true } },
    website: { type: DataTypes.STRING(500) },
    logo_url: { type: DataTypes.STRING(500) },
    description: { type: DataTypes.TEXT },
    verification_status: { type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'), defaultValue: 'PENDING' },
  }, { tableName: 'companies', underscored: true });
};

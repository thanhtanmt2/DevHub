module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Experience', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    // Loại mục: COMPANY (đi làm ở công ty), FREELANCE, PERSONAL (dự án cá nhân),
    // PROJECT (dự án con nằm trong một COMPANY, trỏ bằng parent_id)
    type: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'COMPANY', validate: { isIn: [['COMPANY', 'FREELANCE', 'PERSONAL', 'PROJECT']] } },
    parent_id: { type: DataTypes.UUID },
    // job_title = vai trò; company_name = tên công ty / tên dự án / tên khách hàng (tùy loại)
    job_title: { type: DataTypes.STRING(150), allowNull: false },
    company_name: { type: DataTypes.STRING(200), allowNull: false },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    description: { type: DataTypes.TEXT },
    // Danh sách việc cụ thể đã làm và công nghệ/kỹ năng đã dùng
    tasks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    technologies: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    link_url: { type: DataTypes.STRING(500) },
  }, { tableName: 'experiences', underscored: true });
};

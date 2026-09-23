const { ActivityLog, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/logs
exports.getLogs = async (req, res, next) => {
  try {
    const { action, entity_type, from_date, to_date, keyword, user_id, page = 1, limit = 50 } = req.query;
    
    const where = {};
    
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    if (user_id) where.user_id = user_id;
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) {
        where.created_at[Op.gte] = new Date(from_date);
      }
      if (to_date) {
        const endOfDay = new Date(to_date);
        endOfDay.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = endOfDay;
      }
    }

    if (keyword) {
      where[Op.or] = [
        { description: { [Op.iLike]: `%${keyword}%` } },
        { user_name: { [Op.iLike]: `%${keyword}%` } },
        { entity_name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) { next(error); }
};

// GET /api/workspaces/:id/logs (Manager/Lead only)
exports.getWorkspaceLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const offset = (page - 1) * limit;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: {
        metadata: {
          workspace_id: id
        }
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) { next(error); }
};

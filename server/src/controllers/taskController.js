const { Task, TaskSubmission, Workspace, WorkspaceMember, CandidateProfile } = require('../models');
const AppError = require('../utils/AppError');

// POST /api/workspaces/:workspaceId/tasks (Admin only via route config)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, workspace_member_id, deadline, estimated_hours } = req.body;
    const task = await Task.create({
      workspace_id: req.params.workspaceId,
      title, description, workspace_member_id, deadline, estimated_hours,
      status: 'TODO',
      completion_rate: 0
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
};

// GET /api/workspaces/:workspaceId/tasks (Admin & Members)
exports.getWorkspaceTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { workspace_id: req.params.workspaceId },
      include: [
        { 
          model: WorkspaceMember, 
          include: [{ model: CandidateProfile }] 
        },
        { model: TaskSubmission, order: [['submitted_at', 'DESC']], limit: 1 }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
};

// PUT /api/tasks/:id (Admin full edit, Member restricted edit)
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    if (req.user.role === 'ADMIN') {
      await task.update(req.body);
    } else {
      // Members can only update status and completion_rate
      const { status, completion_rate } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (completion_rate !== undefined) updateData.completion_rate = completion_rate;
      
      // Auto-set actual_start_date or actual_end_date based on status
      if (status === 'IN_PROGRESS' && !task.actual_start_date) updateData.actual_start_date = new Date();
      if (status === 'DONE') updateData.actual_end_date = new Date();
      
      await task.update(updateData);
    }

    res.json({ success: true, data: task });
  } catch (error) { next(error); }
};

// POST /api/tasks/:id/submissions (Member submits work)
exports.submitTask = async (req, res, next) => {
  try {
    const { submission_url, note } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    const submission = await TaskSubmission.create({
      task_id: task.id,
      submission_url,
      note,
      status: 'PENDING'
    });

    // Auto update task status
    await task.update({ status: 'REVIEW' });

    res.status(201).json({ success: true, data: submission });
  } catch (error) { next(error); }
};

// GET /api/tasks/:id/submissions (Admin & Members)
exports.getTaskSubmissions = async (req, res, next) => {
  try {
    const submissions = await TaskSubmission.findAll({
      where: { task_id: req.params.id },
      order: [['submitted_at', 'DESC']]
    });
    res.json({ success: true, data: submissions });
  } catch (error) { next(error); }
};

// PUT /api/submissions/:id/review (Admin reviews submission)
exports.reviewSubmission = async (req, res, next) => {
  try {
    const { status, feedback } = req.body; // status: APPROVED or REJECTED
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new AppError('Invalid status', 400);

    const submission = await TaskSubmission.findByPk(req.params.id);
    if (!submission) throw new AppError('Submission not found', 404);

    await submission.update({ status, feedback, reviewed_at: new Date() });

    // Auto update task status based on review
    const task = await Task.findByPk(submission.task_id);
    if (status === 'APPROVED') {
      await task.update({ status: 'DONE', completion_rate: 100, actual_end_date: new Date() });
    } else if (status === 'REJECTED') {
      await task.update({ status: 'IN_PROGRESS' });
    }

    res.json({ success: true, data: submission });
  } catch (error) { next(error); }
};

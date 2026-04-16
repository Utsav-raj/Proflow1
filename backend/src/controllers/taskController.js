const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project: projectId, status, priority, assignee, deadline, tags, subtasks } = req.body;

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m.toString() === req.user.id.toString()) ||
      project.owner.toString() === req.user.id.toString();
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status,
      priority,
      assignee: assignee || null,
      createdBy: req.user.id,
      deadline,
      tags: tags || [],
      subtasks: subtasks || [],
    });

    await task.populate('assignee', 'name email initials color');
    await task.populate('createdBy', 'name email initials color');

    res.status(201).json({
      success: true,
      message: 'Task created',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project: projectId, status, priority, assignee, search } = req.query;

    const filter = {};

    if (projectId) {
      filter.project = projectId;
    } else {
      // Get all projects user belongs to
      const userProjects = await Project.find({
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      }).select('_id');
      filter.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status && status !== 'all') filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email initials color')
      .populate('createdBy', 'name email initials color')
      .populate('project', 'name icon color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email initials color')
      .populate('createdBy', 'name email initials color')
      .populate('project', 'name icon color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignee', 'deadline', 'tags', 'subtasks'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    }

    await task.save();

    await task.populate('assignee', 'name email initials color');
    await task.populate('createdBy', 'name email initials color');
    await task.populate('project', 'name icon color');

    res.status(200).json({
      success: true,
      message: 'Task updated',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move task (update status) - lightweight endpoint for kanban
// @route   PATCH /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    await task.populate('assignee', 'name email initials color');
    await task.populate('project', 'name icon color');

    res.status(200).json({
      success: true,
      message: `Task moved to ${status}`,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle subtask completion
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
// @access  Private
exports.toggleSubtask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Subtask ${subtask.completed ? 'completed' : 'uncompleted'}`,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

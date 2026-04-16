const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, icon, color, category, deadline, members } = req.body;

    const project = await Project.create({
      name,
      description,
      icon,
      color,
      category,
      deadline,
      owner: req.user.id,
      members: members ? [req.user.id, ...members] : [req.user.id],
    });

    await project.populate('members', 'name email initials color role');

    const progress = await project.computeProgress();

    res.status(201).json({
      success: true,
      message: 'Project created',
      data: {
        project: {
          ...project.toObject(),
          ...progress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    const filter = {
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    };

    if (status && status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(filter)
      .populate('members', 'name email initials color role')
      .sort({ createdAt: -1 });

    // Compute progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const progress = await project.computeProgress();
        return {
          ...project.toObject(),
          ...progress,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithProgress.length,
      data: { projects: projectsWithProgress },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email initials color role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check membership
    const isMember = project.members.some((m) => m._id.toString() === req.user.id.toString()) ||
      project.owner.toString() === req.user.id.toString();

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    const progress = await project.computeProgress();
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email initials color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          ...progress,
          tasks,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can update it' });
    }

    const allowedUpdates = ['name', 'description', 'icon', 'color', 'status', 'category', 'deadline', 'members'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('members', 'name email initials color role');

    const progress = await project.computeProgress();

    res.status(200).json({
      success: true,
      message: 'Project updated',
      data: {
        project: { ...project.toObject(), ...progress },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete it' });
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted',
    });
  } catch (error) {
    next(error);
  }
};

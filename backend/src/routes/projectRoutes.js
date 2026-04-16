const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
} = require('../controllers/projectController');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .get(getProjects)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
      body('description').optional().isLength({ max: 500 }),
      body('category').optional().isIn(['Development', 'Design', 'Infrastructure', 'Analytics', 'Documentation', 'Marketing', 'Other']),
    ],
    validate,
    createProject
  );

router.route('/:id')
  .get(getProject)
  .put(
    [
      body('name').optional().trim().isLength({ min: 1, max: 100 }),
      body('status').optional().isIn(['active', 'on-hold', 'completed', 'archived']),
      body('category').optional().isIn(['Development', 'Design', 'Infrastructure', 'Analytics', 'Documentation', 'Marketing', 'Other']),
    ],
    validate,
    updateProject
  )
  .delete(deleteProject);

module.exports = router;

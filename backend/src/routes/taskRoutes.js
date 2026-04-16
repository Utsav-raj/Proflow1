const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const {
  createTask, getTasks, getTask, updateTask, deleteTask, moveTask, toggleSubtask,
} = require('../controllers/taskController');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .get(getTasks)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }),
      body('project').notEmpty().withMessage('Project ID is required').isMongoId(),
      body('status').optional().isIn(['todo', 'in-progress', 'done']),
      body('priority').optional().isIn(['low', 'medium', 'high']),
      body('assignee').optional({ values: 'null' }).isMongoId(),
    ],
    validate,
    createTask
  );

router.route('/:id')
  .get(getTask)
  .put(
    [
      body('title').optional().trim().isLength({ min: 1, max: 200 }),
      body('status').optional().isIn(['todo', 'in-progress', 'done']),
      body('priority').optional().isIn(['low', 'medium', 'high']),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

// Kanban move endpoint
router.patch(
  '/:id/move',
  [body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')],
  validate,
  moveTask
);

// Subtask toggle
router.patch('/:id/subtasks/:subtaskId', toggleSubtask);

module.exports = router;

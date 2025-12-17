import Issue from '../models/Issue.js';

// @desc    Create an issue
// @route   POST /api/issues
// @access  Private
export const createIssue = async (req, res) => {
  try {
    const { title, description, bookingId } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    const issue = await Issue.create({
      user: req.user._id,
      booking: bookingId || null,
      title,
      description,
      status: 'pending'
    });

    await issue.populate('user', 'name email');
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private/Admin
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('user', 'name email')
      .populate('booking')
      .populate('resolvedBy', 'name')
      .sort('-createdAt');

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user issues
// @route   GET /api/issues/user/:userId
// @access  Private
export const getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.params.userId })
      .populate('booking')
      .sort('-createdAt');

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve issue
// @route   PUT /api/issues/:id/resolve
// @access  Private/Admin
export const resolveIssue = async (req, res) => {
  try {
    const { resolution } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = 'resolved';
    issue.resolution = resolution;
    issue.resolvedBy = req.user._id;
    issue.resolvedAt = Date.now();

    await issue.save();
    await issue.populate('user', 'name email');
    await issue.populate('resolvedBy', 'name');

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

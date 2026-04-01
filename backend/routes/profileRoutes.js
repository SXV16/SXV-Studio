const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.uploadProfilePic.single('profile_pic'), profileController.updateProfile);

module.exports = router;

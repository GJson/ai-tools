const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用用户ID和时间戳生成唯一文件名
    const userId = req.user.id;
    const ext = path.extname(file.originalname);
    const filename = `avatar_${userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // 只允许图片文件
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
  
  const extname = allowedExtensions.test(path.extname(file.originalname));
  const mimetype = file.mimetype && allowedMimeTypes.test(file.mimetype);

  // 只要扩展名或MIME类型匹配即可（更宽松的检查）
  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// 上传头像
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件'
      });
    }

    // 生成文件URL（根据实际部署情况调整）
    const baseUrl = process.env.FRONTEND_URL || 'https://gjson.com';
    const fileUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传头像错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '上传头像失败'
    });
  }
});

// 删除头像
router.delete('/avatar/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    // 检查文件是否属于当前用户（通过文件名判断）
    if (!filename.startsWith(`avatar_${req.user.id}_`)) {
      return res.status(403).json({
        success: false,
        error: '无权删除此文件'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '头像删除成功'
    });
  } catch (error) {
    console.error('删除头像错误:', error);
    res.status(500).json({
      success: false,
      error: '删除头像失败'
    });
  }
});

module.exports = router;


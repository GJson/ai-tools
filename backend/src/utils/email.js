const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
const createTransporter = () => {
  // 如果没有配置SMTP，返回null
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP未配置，邮件功能将在开发模式下模拟');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qiye.aliyun.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('❌ 创建邮件传输器失败:', error);
    return null;
  }
};

// 生成6位数字验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码邮件
const sendVerificationCode = async (email, code) => {
  try {
    // 开发环境或未配置SMTP：直接输出到控制台
    const transporter = createTransporter();
    if (process.env.NODE_ENV === 'development' || !transporter) {
      console.log('📧 验证码邮件（开发/模拟模式）:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 收件人: ${email}`);
      console.log(`🔐 验证码: ${code}`);
      console.log('⏰ 有效期: 5分钟');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }
    
    const mailOptions = {
      from: `"AI工具集" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'AI工具集 - 邮箱验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI工具集</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">您的验证码</p>
          </div>
          
          <div style="padding: 40px 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">邮箱验证</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              您正在注册AI工具集账号，请使用以下验证码完成注册：
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0;">
              验证码有效期为 <strong>5分钟</strong>，请及时使用。
            </p>
            
            <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">
              如果您没有注册AI工具集账号，请忽略此邮件。
            </p>
          </div>
          
          <div style="background: #f1f3f4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 AI工具集. 此邮件由系统自动发送，请勿回复。
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 验证码邮件发送成功:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 验证码邮件发送失败:', error);
    return { success: false, error: error.message };
  }
};

// 发送欢迎邮件
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    // 如果没有配置SMTP，只在控制台输出
    if (!transporter) {
      console.log('📧 欢迎邮件（模拟模式）:');
      console.log(`📧 收件人: ${email}`);
      console.log(`👤 用户名: ${username}`);
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }
    
    const mailOptions = {
      from: `"AI工具集" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '欢迎加入AI工具集！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 欢迎加入AI工具集！</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hi, ${username}！</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              恭喜您成功注册AI工具集！现在您可以：
            </p>
            
            <ul style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
              <li>浏览和搜索各种AI工具</li>
              <li>收藏您喜欢的工具</li>
              <li>记录使用历史</li>
              <li>为工具评分和评论</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://47.95.118.57'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;">
                立即开始使用
              </a>
            </div>
          </div>
          
          <div style="background: #f1f3f4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 AI工具集. 此邮件由系统自动发送，请勿回复。
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 欢迎邮件发送成功:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 欢迎邮件发送失败:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationCode,
  sendWelcomeEmail
};

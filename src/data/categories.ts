import { Category } from '@/types'

export const categories: Category[] = [
  {
    id: 'writing',
    name: 'AI写作工具',
    description: '智能写作助手，提升写作效率',
    icon: 'PenTool',
    color: '#3b82f6',
    toolCount: 25,
    subcategories: [
      { id: 'article', name: '文章写作', description: '长文、博客、新闻写作', toolCount: 12 },
      { id: 'copywriting', name: '文案创作', description: '广告文案、营销内容', toolCount: 8 },
      { id: 'translation', name: '翻译工具', description: '多语言翻译服务', toolCount: 5 }
    ]
  },
  {
    id: 'image',
    name: 'AI图像工具',
    description: 'AI绘画、图像生成与编辑',
    icon: 'Image',
    color: '#8b5cf6',
    toolCount: 18,
    subcategories: [
      { id: 'generation', name: '图像生成', description: 'AI绘画、图片创作', toolCount: 10 },
      { id: 'editing', name: '图像编辑', description: '图片处理、美化', toolCount: 5 },
      { id: 'recognition', name: '图像识别', description: 'OCR、物体识别', toolCount: 3 }
    ]
  },
  {
    id: 'video',
    name: 'AI视频工具',
    description: '视频生成、编辑与处理',
    icon: 'Play',
    color: '#f59e0b',
    toolCount: 12,
    subcategories: [
      { id: 'generation', name: '视频生成', description: 'AI视频创作', toolCount: 6 },
      { id: 'editing', name: '视频编辑', description: '智能剪辑工具', toolCount: 4 },
      { id: 'processing', name: '视频处理', description: '格式转换、压缩', toolCount: 2 }
    ]
  },
  {
    id: 'office',
    name: 'AI办公工具',
    description: '提升办公效率的AI工具',
    icon: 'FileText',
    color: '#10b981',
    toolCount: 20,
    subcategories: [
      { id: 'presentation', name: '演示文稿', description: 'PPT制作、演示', toolCount: 8 },
      { id: 'spreadsheet', name: '表格处理', description: 'Excel、数据分析', toolCount: 6 },
      { id: 'document', name: '文档处理', description: 'PDF、文档管理', toolCount: 6 }
    ]
  },
  {
    id: 'agent',
    name: 'AI智能体',
    description: '智能助手和自动化工具',
    icon: 'Bot',
    color: '#ef4444',
    toolCount: 15,
    subcategories: [
      { id: 'assistant', name: '智能助手', description: '个人AI助手', toolCount: 8 },
      { id: 'automation', name: '自动化', description: '工作流程自动化', toolCount: 4 },
      { id: 'chatbot', name: '聊天机器人', description: '客服、对话机器人', toolCount: 3 }
    ]
  },
  {
    id: 'chat',
    name: 'AI聊天助手',
    description: '智能对话和聊天工具',
    icon: 'MessageCircle',
    color: '#06b6d4',
    toolCount: 22,
    subcategories: [
      { id: 'general', name: '通用聊天', description: '日常对话助手', toolCount: 12 },
      { id: 'professional', name: '专业助手', description: '专业领域助手', toolCount: 6 },
      { id: 'entertainment', name: '娱乐聊天', description: '趣味对话工具', toolCount: 4 }
    ]
  },
  {
    id: 'programming',
    name: 'AI编程工具',
    description: '代码生成和编程辅助',
    icon: 'Code',
    color: '#84cc16',
    toolCount: 16,
    subcategories: [
      { id: 'code-generation', name: '代码生成', description: 'AI代码编写', toolCount: 8 },
      { id: 'debugging', name: '调试工具', description: '代码调试助手', toolCount: 4 },
      { id: 'documentation', name: '文档生成', description: '技术文档编写', toolCount: 4 }
    ]
  },
  {
    id: 'design',
    name: 'AI设计工具',
    description: '智能设计和创意工具',
    icon: 'Palette',
    color: '#f97316',
    toolCount: 14,
    subcategories: [
      { id: 'ui-design', name: 'UI设计', description: '界面设计工具', toolCount: 6 },
      { id: 'graphic-design', name: '平面设计', description: '海报、logo设计', toolCount: 5 },
      { id: '3d-design', name: '3D设计', description: '三维建模工具', toolCount: 3 }
    ]
  },
  {
    id: 'audio',
    name: 'AI音频工具',
    description: '语音和音频处理',
    icon: 'Mic',
    color: '#ec4899',
    toolCount: 10,
    subcategories: [
      { id: 'speech', name: '语音处理', description: '语音识别、合成', toolCount: 5 },
      { id: 'music', name: '音乐创作', description: 'AI音乐生成', toolCount: 3 },
      { id: 'podcast', name: '播客制作', description: '音频编辑工具', toolCount: 2 }
    ]
  },
  {
    id: 'search',
    name: 'AI搜索引擎',
    description: '智能搜索和发现',
    icon: 'Globe',
    color: '#6366f1',
    toolCount: 8,
    subcategories: [
      { id: 'web-search', name: '网络搜索', description: '智能网络搜索', toolCount: 4 },
      { id: 'academic', name: '学术搜索', description: '学术文献搜索', toolCount: 2 },
      { id: 'image-search', name: '图像搜索', description: '以图搜图', toolCount: 2 }
    ]
  },
  {
    id: 'platform',
    name: 'AI开发平台',
    description: 'AI模型和API平台',
    icon: 'Settings',
    color: '#8b5cf6',
    toolCount: 12,
    subcategories: [
      { id: 'api', name: 'API平台', description: 'AI服务API', toolCount: 6 },
      { id: 'model', name: '模型平台', description: 'AI模型托管', toolCount: 4 },
      { id: 'training', name: '训练平台', description: '模型训练服务', toolCount: 2 }
    ]
  },
  {
    id: 'learning',
    name: 'AI学习网站',
    description: 'AI教育和学习资源',
    icon: 'BookOpen',
    color: '#06b6d4',
    toolCount: 15,
    subcategories: [
      { id: 'tutorials', name: '教程资源', description: 'AI学习教程', toolCount: 8 },
      { id: 'courses', name: '在线课程', description: 'AI专业课程', toolCount: 4 },
      { id: 'community', name: '学习社区', description: 'AI学习交流', toolCount: 3 }
    ]
  },
  {
    id: 'models',
    name: 'AI训练模型',
    description: '开源和预训练模型',
    icon: 'Cpu',
    color: '#10b981',
    toolCount: 20,
    subcategories: [
      { id: 'language', name: '语言模型', description: '大语言模型', toolCount: 8 },
      { id: 'vision', name: '视觉模型', description: '图像识别模型', toolCount: 6 },
      { id: 'multimodal', name: '多模态模型', description: '多模态AI模型', toolCount: 6 }
    ]
  },
  {
    id: 'evaluation',
    name: 'AI模型评测',
    description: '模型性能和基准测试',
    icon: 'BarChart',
    color: '#f59e0b',
    toolCount: 6,
    subcategories: [
      { id: 'benchmark', name: '基准测试', description: '模型性能测试', toolCount: 3 },
      { id: 'comparison', name: '模型对比', description: '模型性能对比', toolCount: 2 },
      { id: 'ranking', name: '排行榜', description: '模型排名', toolCount: 1 }
    ]
  },
  {
    id: 'detection',
    name: 'AI内容检测',
    description: 'AI生成内容识别',
    icon: 'Shield',
    color: '#ef4444',
    toolCount: 8,
    subcategories: [
      { id: 'text-detection', name: '文本检测', description: 'AI文本识别', toolCount: 4 },
      { id: 'image-detection', name: '图像检测', description: 'AI图像识别', toolCount: 3 },
      { id: 'video-detection', name: '视频检测', description: 'AI视频识别', toolCount: 1 }
    ]
  }
]

// AI工具分类数据
const categories = [
  {
    id: 'writing',
    name: '写作工具',
    description: 'AI写作助手、内容生成、文本编辑等工具',
    icon: '✍️',
    color: '#3B82F6'
  },
  {
    id: 'image',
    name: '图像处理',
    description: 'AI图像生成、编辑、优化等工具',
    icon: '🎨',
    color: '#10B981'
  },
  {
    id: 'video',
    name: '视频制作',
    description: 'AI视频生成、编辑、剪辑等工具',
    icon: '🎬',
    color: '#F59E0B'
  },
  {
    id: 'audio',
    name: '音频处理',
    description: 'AI语音合成、音频编辑、音乐生成等工具',
    icon: '🎵',
    color: '#8B5CF6'
  },
  {
    id: 'office',
    name: '办公效率',
    description: 'AI办公助手、文档处理、表格分析等工具',
    icon: '📊',
    color: '#EF4444'
  },
  {
    id: 'coding',
    name: '编程开发',
    description: 'AI代码生成、调试、优化等工具',
    icon: '💻',
    color: '#06B6D4'
  },
  {
    id: 'marketing',
    name: '营销推广',
    description: 'AI营销工具、广告生成、数据分析等',
    icon: '📈',
    color: '#84CC16'
  },
  {
    id: 'education',
    name: '教育培训',
    description: 'AI学习助手、课程生成、知识问答等',
    icon: '🎓',
    color: '#F97316'
  },
  {
    id: 'design',
    name: '设计创意',
    description: 'AI设计工具、创意生成、UI/UX等',
    icon: '🎨',
    color: '#EC4899'
  },
  {
    id: 'business',
    name: '商业智能',
    description: 'AI商业分析、决策支持、市场研究等',
    icon: '💼',
    color: '#6366F1'
  },
  {
    id: 'health',
    name: '健康医疗',
    description: 'AI健康助手、医疗诊断、健康管理等',
    icon: '🏥',
    color: '#14B8A6'
  },
  {
    id: 'finance',
    name: '金融投资',
    description: 'AI金融分析、投资建议、风险评估等',
    icon: '💰',
    color: '#F59E0B'
  },
  {
    id: 'social',
    name: '社交娱乐',
    description: 'AI社交工具、娱乐内容、聊天机器人等',
    icon: '😊',
    color: '#EC4899'
  },
  {
    id: 'productivity',
    name: '效率工具',
    description: 'AI效率助手、任务管理、时间规划等',
    icon: '⚡',
    color: '#10B981'
  },
  {
    id: 'research',
    name: '研究分析',
    description: 'AI研究工具、数据分析、学术助手等',
    icon: '🔬',
    color: '#3B82F6'
  },
  {
    id: 'translation',
    name: '翻译语言',
    description: 'AI翻译工具、语言学习、多语言支持等',
    icon: '🌐',
    color: '#8B5CF6'
  },
  {
    id: 'automation',
    name: '自动化',
    description: 'AI自动化工具、工作流程、智能调度等',
    icon: '🤖',
    color: '#6B7280'
  },
  {
    id: 'security',
    name: '安全防护',
    description: 'AI安全工具、威胁检测、隐私保护等',
    icon: '🔒',
    color: '#EF4444'
  },
  {
    id: 'gaming',
    name: '游戏娱乐',
    description: 'AI游戏工具、游戏开发、娱乐内容等',
    icon: '🎮',
    color: '#F59E0B'
  },
  {
    id: 'other',
    name: '其他工具',
    description: '其他AI工具和实用程序',
    icon: '🔧',
    color: '#6B7280'
  }
];

module.exports = { categories };
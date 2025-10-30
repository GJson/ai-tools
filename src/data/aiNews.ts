/* genAI_main_start */
export interface AINewsItem {
  id: string
  title: string
  content: string
  summary: string
  publishedAt: string
  source: string
  category: string
  tags: string[]
  readTime: number
  isHot: boolean
  imageUrl?: string
}

export const aiNewsData: AINewsItem[] = [
  {
    id: '1',
    title: 'OpenAI警告美国需加大能源投入，称"电力是新的石油"',
    content: 'OpenAI于2025年10月警告，美国若要在人工智能竞争中保持领先，必须大幅提升能源产能投资。该公司指出，AI基础设施消耗巨额电力，已对美国电网构成压力，并将电力称为"新的石油"。OpenAI向白宫提交建议，呼吁美国每年新增100吉瓦能源产能，这相当于约8000万户家庭年用电量，而去年美国仅新增51吉瓦电力。这一警告凸显了AI发展对能源基础设施的巨大需求，也引发了关于可持续AI发展的讨论。',
    summary: 'OpenAI警告美国需大幅提升能源产能投资，呼吁每年新增100吉瓦能源，将电力称为AI时代的"新石油"。',
    publishedAt: '2025-10-28T10:00:00Z',
    source: '新浪科技',
    category: '基础设施',
    tags: ['OpenAI', '能源', 'AI基础设施', '电力需求'],
    readTime: 3,
    isHot: true
  },
  {
    id: '2',
    title: '高通发布AI200和AI250芯片，正式进军数据中心市场挑战英伟达',
    content: '高通于2025年10月27日发布AI200与AI250两款数据中心AI推理芯片，正式进军数据中心市场，与英伟达和AMD展开竞争。新芯片基于其手机芯片的Hexagon NPU技术，主打AI推理任务，计划于2026至2027年上市。高通强调其液冷服务器系统在功耗、总拥有成本和内存容量方面具备优势，并已与沙特Humain公司达成合作。受此消息影响，高通股价盘中大涨近20%，标志着其战略从移动通信向高增长AI数据中心领域的重要转型。',
    summary: '高通发布AI200和AI250数据中心芯片，进军AI推理市场，股价大涨20%，正式挑战英伟达市场地位。',
    publishedAt: '2025-10-27T14:30:00Z',
    source: '新浪科技',
    category: '硬件技术',
    tags: ['高通', 'AI芯片', '数据中心', '英伟达'],
    readTime: 4,
    isHot: true
  },
  {
    id: '3',
    title: 'AMD再建两座超算，目标在5到8年内攻克癌症',
    content: '美国能源部与AMD达成10亿美元合作，将建设两套超算系统。首套超算Lux采用MI355X芯片，AI性能达当前三倍，预计6个月内上线；第二套Discovery使用下一代MI430芯片，2029年投入运行。这些超算主要用于核能研究，同时将助力癌症药物研发，目标在5到8年内将癌症转变为可控疾病。这一项目展示了AI和超级计算在医疗健康领域的巨大潜力，为人类健康事业带来新希望。',
    summary: 'AMD与美国能源部合作建设两套超算系统，总投资10亿美元，目标在5到8年内攻克癌症。',
    publishedAt: '2025-10-28T09:00:00Z',
    source: '新浪科技',
    category: '技术突破',
    tags: ['AMD', '超级计算', '医疗AI', '癌症研究'],
    readTime: 4,
    isHot: true
  },
  {
    id: '4',
    title: '微软Teams将于12月新增Wi-Fi定位打卡功能',
    content: '微软Teams将于12月推出基于Wi-Fi定位的打卡功能，通过连接公司Wi-Fi网络自动检测员工是否在办公室，并将在线状态更新为"我在办公室里"。该功能旨在提升团队协作效率，减少远程办公带来的沟通障碍，强化办公场所管理。这一功能的推出引发了关于员工隐私和远程办公灵活性的讨论，微软表示该功能可由企业管理员自主选择是否启用。',
    summary: '微软Teams将于12月推出Wi-Fi定位打卡功能，自动检测员工是否在办公室，强化办公场所管理。',
    publishedAt: '2025-10-28T08:30:00Z',
    source: '新浪科技',
    category: '企业动态',
    tags: ['微软', 'Teams', '办公协作', '员工管理'],
    readTime: 3,
    isHot: false
  },
  {
    id: '5',
    title: 'DeepSeek推出V3.5大模型，性能超越GPT-4',
    content: 'DeepSeek于2025年10月发布V3.5大模型，在多项基准测试中超越GPT-4。该模型采用创新的MoE架构，在保持高性能的同时大幅降低了推理成本。DeepSeek表示，V3.5模型在代码生成、数学推理和多语言理解方面都有显著提升。这一突破标志着中国AI技术在大语言模型领域取得重要进展，为全球AI发展注入新活力。',
    summary: 'DeepSeek发布V3.5大模型，性能超越GPT-4，在代码生成和数学推理方面表现突出。',
    publishedAt: '2025-10-26T10:00:00Z',
    source: 'DeepSeek官方',
    category: '技术突破',
    tags: ['DeepSeek', '大模型', 'GPT-4', 'MoE架构'],
    readTime: 4,
    isHot: true
  },
  {
    id: '6',
    title: 'Meta发布Llama 4系列模型，开源AI再进一步',
    content: 'Meta于2025年10月发布Llama 4系列开源大模型，包括基础版、指令微调版和代码专用版。新模型在保持开源特性的同时，性能大幅提升，在多项基准测试中接近闭源商业模型水平。Meta表示，Llama 4将继续秉承开源理念，推动AI技术的普及和创新。这一发布进一步巩固了Meta在开源AI领域的领导地位，为全球开发者提供了强大的AI工具。',
    summary: 'Meta发布Llama 4系列开源大模型，性能接近商业模型水平，继续推动AI技术普及。',
    publishedAt: '2025-10-25T14:00:00Z',
    source: 'Meta官方',
    category: '技术突破',
    tags: ['Meta', 'Llama 4', '开源AI', '大模型'],
    readTime: 3,
    isHot: false
  },
  {
    id: '7',
    title: '谷歌推出Gemini 2.0，多模态能力全面升级',
    content: '谷歌于2025年10月推出Gemini 2.0模型，多模态能力全面升级。新模型支持文本、图像、视频、音频的无缝理解和生成，在视觉问答、视频理解等任务上表现出色。谷歌表示，Gemini 2.0将集成到Google搜索、Gmail等产品中，为用户提供更智能的AI助手体验。这一发布标志着多模态AI进入新阶段，为AI应用场景拓展开辟了新可能。',
    summary: '谷歌推出Gemini 2.0模型，多模态能力全面升级，将集成到Google全系产品中。',
    publishedAt: '2025-10-24T10:30:00Z',
    source: 'Google官方',
    category: '技术突破',
    tags: ['谷歌', 'Gemini 2.0', '多模态AI', 'AI助手'],
    readTime: 4,
    isHot: false
  },
  {
    id: '8',
    title: '苹果因iPhone营销问题被法国罚款4800万欧元',
    content: '法国法院因苹果iPhone营销策略对移动运营商不公，对其处以4800万欧元罚款。法院认定苹果合同强制运营商承担广告费用、承诺固定采购量并无偿使用其品牌专利等条款违法。此案由法国反欺诈总局于2013年提起，处罚包括对Bouygues、Iliad和SFR三家运营商的赔偿，总额超过3800万欧元。这一判决提醒科技巨头需要遵守公平竞争原则，维护市场秩序。',
    summary: '法国法院因苹果iPhone营销策略不公，对其处以4800万欧元罚款，并赔偿运营商损失。',
    publishedAt: '2025-10-28T07:00:00Z',
    source: '新浪科技',
    category: '行业动态',
    tags: ['苹果', '法国', '反垄断', '罚款'],
    readTime: 3,
    isHot: false
  }
]

export const getLatestAINews = async (): Promise<AINewsItem[]> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 按发布时间排序，返回最新的新闻
  return aiNewsData.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export const getAINewsById = async (id: string): Promise<AINewsItem | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return aiNewsData.find(news => news.id === id) || null
}

export const getAINewsByCategory = async (category: string): Promise<AINewsItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return aiNewsData.filter(news => news.category === category)
}

export const searchAINews = async (query: string): Promise<AINewsItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const lowercaseQuery = query.toLowerCase()
  return aiNewsData.filter(news => 
    news.title.toLowerCase().includes(lowercaseQuery) ||
    news.content.toLowerCase().includes(lowercaseQuery) ||
    news.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
/* genAI_main_end */
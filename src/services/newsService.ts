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

interface NewsCache {
  data: AINewsItem[]
  timestamp: number
  expiresIn: number
}

class NewsService {
  private cache: NewsCache | null = null
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存
  private readonly API_ENDPOINTS = [
    'https://api.example.com/ai-news', // 示例API端点
    'https://newsapi.org/v2/everything?q=artificial+intelligence&apiKey=YOUR_API_KEY',
    'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/oreilly/radar'
  ]

  /**
   * 获取最新AI快讯
   */
  async getLatestAINews(): Promise<AINewsItem[]> {
    // 检查缓存是否有效
    if (this.isCacheValid()) {
      console.log('使用缓存数据')
      return this.cache!.data
    }

    try {
      console.log('从API获取最新数据')
      const newsData = await this.fetchFromAPI()
      this.updateCache(newsData)
      return newsData
    } catch (error) {
      console.error('API请求失败，使用备用数据:', error)
      return this.getFallbackData()
    }
  }

  /**
   * 根据ID获取特定新闻
   */
  async getAINewsById(id: string): Promise<AINewsItem | null> {
    const newsList = await this.getLatestAINews()
    return newsList.find(news => news.id === id) || null
  }

  /**
   * 按分类获取新闻
   */
  async getAINewsByCategory(category: string): Promise<AINewsItem[]> {
    const newsList = await this.getLatestAINews()
    return newsList.filter(news => news.category === category)
  }

  /**
   * 搜索新闻
   */
  async searchAINews(query: string): Promise<AINewsItem[]> {
    const newsList = await this.getLatestAINews()
    const lowercaseQuery = query.toLowerCase()
    return newsList.filter(news => 
      news.title.toLowerCase().includes(lowercaseQuery) ||
      news.content.toLowerCase().includes(lowercaseQuery) ||
      news.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  /**
   * 从API获取数据
   */
  private async fetchFromAPI(): Promise<AINewsItem[]> {
    // 模拟API调用，实际项目中替换为真实API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以调用真实的新闻API
    // const response = await fetch(this.API_ENDPOINTS[0])
    // const data = await response.json()
    
    // 目前返回模拟的最新数据
    return this.generateLatestNews()
  }

  /**
   * 生成最新的AI新闻数据
   */
  private generateLatestNews(): AINewsItem[] {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return [
      {
        id: `news-${Date.now()}-1`,
        title: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
        content: 'OpenAI于今日发布GPT-5预览版，新模型在文本、图像、音频和视频理解方面都有显著提升。GPT-5采用了全新的架构设计，推理速度比GPT-4快3倍，同时保持了更高的准确性。该模型在数学推理、代码生成和创意写作等任务上表现突出，预计将在未来几个月内正式发布。',
        summary: 'OpenAI发布GPT-5预览版，多模态能力大幅提升，推理速度比GPT-4快3倍。',
        publishedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
        source: 'OpenAI官方',
        category: '技术突破',
        tags: ['OpenAI', 'GPT-5', '多模态AI', '技术突破'],
        readTime: 4,
        isHot: true
      },
      {
        id: `news-${Date.now()}-2`,
        title: '英伟达发布H200 AI芯片，性能提升40%',
        content: '英伟达今日发布H200 AI芯片，相比H100性能提升40%，内存带宽增加1.4倍。新芯片专为大型语言模型训练和推理优化，支持更大的模型参数和更快的计算速度。H200预计将于2025年第一季度开始发货，主要面向数据中心和云服务提供商。',
        summary: '英伟达发布H200 AI芯片，性能比H100提升40%，内存带宽增加1.4倍。',
        publishedAt: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
        source: '英伟达官方',
        category: '硬件技术',
        tags: ['英伟达', 'H200', 'AI芯片', '数据中心'],
        readTime: 3,
        isHot: true
      },
      {
        id: `news-${Date.now()}-3`,
        title: '谷歌DeepMind突破蛋白质折叠难题',
        content: '谷歌DeepMind团队在蛋白质折叠预测方面取得重大突破，新算法AlphaFold 3能够准确预测蛋白质与DNA、RNA等分子的相互作用。这一突破将加速药物发现和疾病治疗研究，为精准医疗提供重要工具。',
        summary: '谷歌DeepMind突破蛋白质折叠难题，AlphaFold 3能预测蛋白质与DNA、RNA相互作用。',
        publishedAt: new Date(today.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
        source: 'DeepMind官方',
        category: '技术突破',
        tags: ['DeepMind', '蛋白质折叠', '生物AI', '药物发现'],
        readTime: 5,
        isHot: false
      },
      {
        id: `news-${Date.now()}-4`,
        title: '特斯拉FSD Beta 12.0开始推送，接近L5自动驾驶',
        content: '特斯拉开始向部分用户推送FSD Beta 12.0版本，新版本在复杂城市道路和恶劣天气条件下的表现显著改善。马斯克表示，FSD Beta 12.0已经非常接近L5级别的完全自动驾驶，预计在2025年实现真正的无人驾驶。',
        summary: '特斯拉FSD Beta 12.0开始推送，接近L5自动驾驶，预计2025年实现完全无人驾驶。',
        publishedAt: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前
        source: '特斯拉官方',
        category: '技术突破',
        tags: ['特斯拉', 'FSD', '自动驾驶', 'L5'],
        readTime: 4,
        isHot: true
      },
      {
        id: `news-${Date.now()}-5`,
        title: '微软Copilot Pro新增代码审查功能',
        content: '微软为Copilot Pro用户新增了智能代码审查功能，能够自动检测代码中的潜在问题、安全漏洞和性能瓶颈。该功能支持多种编程语言，并提供详细的改进建议，帮助开发者提高代码质量。',
        summary: '微软Copilot Pro新增代码审查功能，自动检测代码问题并提供改进建议。',
        publishedAt: new Date(today.getTime() - 10 * 60 * 60 * 1000).toISOString(), // 10小时前
        source: '微软官方',
        category: '企业动态',
        tags: ['微软', 'Copilot', '代码审查', '开发者工具'],
        readTime: 3,
        isHot: false
      },
      {
        id: `news-${Date.now()}-6`,
        title: 'Meta发布开源大模型Llama 3.2',
        content: 'Meta发布开源大模型Llama 3.2，新模型在保持开源特性的同时，性能大幅提升。Llama 3.2支持多种语言，在代码生成、数学推理和创意写作方面表现优异。Meta表示将继续推动开源AI的发展，为全球开发者提供免费的高质量AI工具。',
        summary: 'Meta发布开源大模型Llama 3.2，性能大幅提升，继续推动开源AI发展。',
        publishedAt: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12小时前
        source: 'Meta官方',
        category: '技术突破',
        tags: ['Meta', 'Llama 3.2', '开源AI', '大模型'],
        readTime: 4,
        isHot: false
      },
      {
        id: `news-${Date.now()}-7`,
        title: '百度文心大模型4.0正式发布',
        content: '百度正式发布文心大模型4.0，新模型在中文理解和生成方面有显著提升，同时支持多模态交互。文心4.0集成了最新的知识图谱和常识推理能力，在问答、创作、分析等任务上表现突出。百度表示将继续深耕中文AI领域，为中文用户提供更好的AI体验。',
        summary: '百度文心大模型4.0正式发布，中文理解和多模态能力显著提升。',
        publishedAt: new Date(today.getTime() - 14 * 60 * 60 * 1000).toISOString(), // 14小时前
        source: '百度官方',
        category: '技术突破',
        tags: ['百度', '文心大模型', '中文AI', '多模态'],
        readTime: 4,
        isHot: true
      },
      {
        id: `news-${Date.now()}-8`,
        title: 'AI芯片初创公司获得2亿美元融资',
        content: '专注于AI推理芯片的初创公司NeuralCore宣布完成2亿美元C轮融资，由红杉资本领投。该公司开发的专用AI芯片在能效比方面比传统GPU提升5倍，主要面向边缘计算和移动设备市场。本轮融资将用于扩大生产规模和加速产品研发。',
        summary: 'AI芯片初创公司NeuralCore获得2亿美元融资，专用芯片能效比提升5倍。',
        publishedAt: new Date(today.getTime() - 16 * 60 * 60 * 1000).toISOString(), // 16小时前
        source: 'TechCrunch',
        category: '创业投资',
        tags: ['AI芯片', '创业融资', '边缘计算', 'NeuralCore'],
        readTime: 3,
        isHot: false
      }
    ]
  }

  /**
   * 获取备用数据
   */
  private getFallbackData(): AINewsItem[] {
    console.log('使用备用数据')
    return this.generateLatestNews()
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false
    
    const now = Date.now()
    const cacheAge = now - this.cache.timestamp
    return cacheAge < this.cache.expiresIn
  }

  /**
   * 更新缓存
   */
  private updateCache(data: AINewsItem[]): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      expiresIn: this.CACHE_DURATION
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache = null
  }

  /**
   * 强制刷新数据
   */
  async forceRefresh(): Promise<AINewsItem[]> {
    this.clearCache()
    return this.getLatestAINews()
  }
}

// 创建单例实例
export const newsService = new NewsService()

// 导出类型和实例
export type { AINewsItem }
export default newsService
/* genAI_main_end */
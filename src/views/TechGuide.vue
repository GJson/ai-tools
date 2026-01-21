<template>
  <div class="tech-guide-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">技术选型与架构手册</h1>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="tech-guide-container">
        <blockquote class="intro">
          <p><strong>面向产品经理的技术选型指南</strong><br />
          帮助产品经理快速理解各种技术栈，做出合理的项目技术选型决策</p>
        </blockquote>
        <hr />

        <h2 id="_2">📋 目录</h2>
        <ol class="toc">
          <li><a href="#前端技术选型">前端技术选型</a></li>
          <li><a href="#后端技术选型">后端技术选型</a></li>
          <li><a href="#数据库选型">数据库选型</a></li>
          <li><a href="#缓存技术">缓存技术</a></li>
          <li><a href="#登录鉴权方案">登录鉴权方案</a></li>
          <li><a href="#项目架构设计">项目架构设计</a></li>
          <li><a href="#技术选型决策树">技术选型决策树</a></li>
          <li><a href="#推荐技术栈组合">推荐技术栈组合</a></li>
          <li><a href="#架构设计原则">架构设计原则</a></li>
        </ol>
        <hr />

        <h2 id="_3">📱 前端技术选型</h2>
        <h3 id="1">1. 移动端原生开发</h3>
        <h4 id="androidjavakotlin">Android（Java/Kotlin）</h4>
        <p><strong>简单理解</strong>：就像盖房子，用最原始的材料，完全按照自己的需求来。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能最好，可以调用所有系统功能</li>
          <li>✅ 生态成熟，文档完善</li>
          <li>✅ 适合复杂交互和性能要求高的场景</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 需要单独维护 Android 代码</li>
          <li>❌ 开发成本高（多端需要多套代码）</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>对性能要求极高的应用（如游戏、视频处理）</li>
          <li>需要深度系统集成的功能</li>
          <li>预算充足，有专门的 Android 团队</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐⭐（最高）</p>
        <hr />

        <h4 id="iosswiftobjective-c">iOS（Swift/Objective-C）</h4>
        <p><strong>简单理解</strong>：专门为苹果设备打造的，就像苹果专卖店里的定制产品。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能优秀，系统集成度高</li>
          <li>✅ 用户体验统一</li>
          <li>✅ 适合复杂动画和交互</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 只能支持 iOS 系统</li>
          <li>❌ 开发成本高</li>
          <li>❌ 审核周期较长</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>主要面向 iOS 用户</li>
          <li>需要深度系统功能（如健康数据、支付）</li>
          <li>预算充足，有专门的 iOS 团队</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐⭐（最高）</p>
        <hr />

        <h3 id="2">2. 跨平台框架</h3>
        <h4 id="flutter">Flutter（推荐用于移动端）⭐</h4>
        <p><strong>简单理解</strong>：写一套代码，可以在 Android 和 iOS 上同时运行，就像通用钥匙。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 一套代码支持 Android 和 iOS</li>
          <li>✅ 性能接近原生（90%以上）</li>
          <li>✅ UI 渲染一致，体验好</li>
          <li>✅ 开发效率高，成本低</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 包体积相对较大</li>
          <li>❌ 第三方库相对较少</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>需要同时支持 Android 和 iOS</li>
          <li>追求开发效率</li>
          <li>对性能有一定要求</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h4 id="react-native">React Native</h4>
        <p><strong>简单理解</strong>：用网页技术（JavaScript）来开发手机 App。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 使用 JavaScript，学习成本低</li>
          <li>✅ 生态丰富，组件多</li>
          <li>✅ 热更新支持好</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 性能略低于原生和 Flutter</li>
          <li>❌ 部分功能需要原生开发</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>团队熟悉 JavaScript</li>
          <li>需要快速迭代</li>
          <li>对性能要求不是极致</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="3-web">3. Web 前端</h3>
        <h4 id="vuejs">Vue.js ⭐</h4>
        <p><strong>简单理解</strong>：简单易学的前端框架，就像搭积木一样简单。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 学习曲线平缓，上手快</li>
          <li>✅ 文档清晰，中文支持好</li>
          <li>✅ 适合中小型项目</li>
          <li>✅ 组件化开发，代码复用</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 大型项目生态相对较小</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>中小型 Web 应用</li>
          <li>团队规模较小</li>
          <li>需要快速开发</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <p><strong>学习难度</strong>：⭐⭐（较低）</p>
        <hr />

        <h4 id="react">React</h4>
        <p><strong>简单理解</strong>：功能强大的前端框架，适合大型项目。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 生态丰富，组件库多</li>
          <li>✅ 社区活跃，问题容易解决</li>
          <li>✅ 适合大型项目</li>
          <li>✅ 组件复用性好</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 学习曲线较陡</li>
          <li>❌ 需要额外学习状态管理</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大型 Web 应用</li>
          <li>需要复杂交互</li>
          <li>团队有 React 经验</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h3 id="4">4. 小程序</h3>
        <h4 id="_4">微信小程序</h4>
        <p><strong>简单理解</strong>：在微信里运行的小程序，不需要下载安装。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 用户基数大（微信用户）</li>
          <li>✅ 开发成本低</li>
          <li>✅ 无需安装，即用即走</li>
          <li>✅ 微信生态支持好</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 功能受限</li>
          <li>❌ 审核较严格</li>
          <li>❌ 依赖微信平台</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>面向微信用户</li>
          <li>功能相对简单</li>
          <li>需要快速上线</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <hr />

        <h4 id="_5">支付宝小程序</h4>
        <p><strong>简单理解</strong>：在支付宝里运行的小程序。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 支付场景支持好</li>
          <li>✅ 电商生态完善</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 用户基数小于微信</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>电商、支付相关业务</li>
          <li>需要支付宝生态支持</li>
        </ul>
        <hr />

        <h2 id="_6">🔧 后端技术选型</h2>
        <h3 id="1-nodejs">1. Node.js ⭐</h3>
        <p><strong>简单理解</strong>：用 JavaScript 写后端，前后端用同一种语言。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ JavaScript 全栈，学习成本低</li>
          <li>✅ 开发效率高</li>
          <li>✅ 异步 I/O，适合高并发</li>
          <li>✅ 生态丰富（npm 包多）</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 不适合 CPU 密集型任务</li>
          <li>❌ 单线程，需要注意错误处理</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>前后端统一语言</li>
          <li>I/O 密集型应用（API、实时通信）</li>
          <li>快速迭代</li>
        </ul>
        <p><strong>推荐框架</strong>：</p>
        <ul>
          <li>Express.js（轻量级）</li>
          <li>Koa.js（现代化）</li>
          <li>Nest.js（企业级）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="2-java">2. Java</h3>
        <p><strong>简单理解</strong>：企业级应用的首选，稳定可靠。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 企业级应用成熟</li>
          <li>✅ 性能稳定</li>
          <li>✅ 生态完善</li>
          <li>✅ 适合大型项目</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 开发效率相对较低</li>
          <li>❌ 内存占用较大</li>
          <li>❌ 学习成本高</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大型企业应用</li>
          <li>高并发、高可用需求</li>
          <li>团队有 Java 经验</li>
        </ul>
        <p><strong>推荐框架</strong>：</p>
        <ul>
          <li>Spring Boot（主流）</li>
          <li>Spring Cloud（微服务）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐（较高）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h3 id="3-python">3. Python</h3>
        <p><strong>简单理解</strong>：简单易学，适合数据处理和 AI。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 语法简洁，易学</li>
          <li>✅ 适合数据处理和 AI</li>
          <li>✅ 开发效率高</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 性能相对较低</li>
          <li>❌ 不适合高并发</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>数据处理、AI/ML 项目</li>
          <li>快速原型开发</li>
          <li>中小型项目</li>
        </ul>
        <p><strong>推荐框架</strong>：</p>
        <ul>
          <li>Django（全功能框架）</li>
          <li>Flask（轻量级框架）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="4-go">4. Go</h3>
        <p><strong>简单理解</strong>：性能优秀，适合高并发服务。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能好</li>
          <li>✅ 并发能力强</li>
          <li>✅ 编译型语言</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 生态相对较小</li>
          <li>❌ 学习曲线较陡</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>高并发服务</li>
          <li>微服务架构</li>
          <li>性能要求高</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐（较高）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h2 id="_7">💾 数据库选型</h2>
        <h3 id="1-sql">1. 关系型数据库（SQL）</h3>
        <h4 id="mysql">MySQL ⭐</h4>
        <p><strong>简单理解</strong>：最常用的数据库，就像 Excel 表格，数据有固定的结构。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 成熟稳定，使用广泛</li>
          <li>✅ 社区活跃，问题容易解决</li>
          <li>✅ 成本低（开源）</li>
          <li>✅ 适合大多数业务场景</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 大数据量性能需要优化</li>
          <li>❌ 复杂查询性能一般</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大多数 Web 应用</li>
          <li>需要事务支持</li>
          <li>结构化数据存储</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h4 id="postgresql">PostgreSQL</h4>
        <p><strong>简单理解</strong>：功能更强大的数据库，支持更复杂的数据类型。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 功能强大</li>
          <li>✅ 支持复杂查询</li>
          <li>✅ 数据类型丰富</li>
          <li>✅ 扩展性好</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 学习成本较高</li>
          <li>❌ 配置相对复杂</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>复杂业务逻辑</li>
          <li>需要高级特性</li>
          <li>数据分析需求</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h3 id="2-nosql">2. 非关系型数据库（NoSQL）</h3>
        <h4 id="mongodb">MongoDB</h4>
        <p><strong>简单理解</strong>：灵活的数据库，数据格式可以随意变化。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 灵活的数据模型</li>
          <li>✅ 适合文档存储</li>
          <li>✅ 水平扩展容易</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 不支持事务（早期版本）</li>
          <li>❌ 内存占用较大</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>内容管理系统</li>
          <li>日志存储</li>
          <li>非结构化数据</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h4 id="redis">Redis ⭐</h4>
        <p><strong>简单理解</strong>：超快的缓存数据库，数据存在内存里。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能极高（内存存储）</li>
          <li>✅ 支持多种数据结构</li>
          <li>✅ 适合缓存和会话存储</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 数据持久化需要配置</li>
          <li>❌ 内存成本较高</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>缓存热点数据</li>
          <li>会话存储</li>
          <li>实时排行榜</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <p><strong>学习难度</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h2 id="_8">🚀 缓存技术</h2>
        <h3 id="redis_1">Redis（推荐）⭐</h3>
        <p><strong>用途</strong>：</p>
        <ul>
          <li>热点数据缓存（如商品列表、用户信息）</li>
          <li>会话存储（用户登录状态）</li>
          <li>分布式锁</li>
          <li>消息队列</li>
        </ul>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能极高（内存存储）</li>
          <li>✅ 支持多种数据结构</li>
          <li>✅ 持久化支持</li>
        </ul>
        <p><strong>使用场景示例</strong>：</p>
        <ul>
          <li>用户登录信息缓存（避免频繁查数据库）</li>
          <li>商品列表缓存（提高查询速度）</li>
          <li>热门内容缓存（减少数据库压力）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h3 id="memcached">Memcached</h3>
        <p><strong>用途</strong>：</p>
        <ul>
          <li>简单的键值缓存</li>
        </ul>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 简单易用</li>
          <li>✅ 性能好</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 功能相对简单</li>
          <li>❌ 不支持持久化</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>简单的缓存需求</li>
          <li>不需要复杂数据结构</li>
        </ul>
        <hr />

        <h2 id="_9">🔐 登录鉴权方案</h2>
        <h3 id="1-jwtjson-web-token">1. JWT（JSON Web Token）⭐</h3>
        <p><strong>简单理解</strong>：用户登录后，服务器给一个"通行证"，以后每次请求都带着这个通行证。</p>
        <p><strong>原理</strong>：</p>
        <ol>
          <li>用户登录，服务器验证用户名密码</li>
          <li>验证通过后，服务器生成 Token（包含用户信息）</li>
          <li>客户端保存 Token</li>
          <li>每次请求都携带 Token</li>
          <li>服务器验证 Token 有效性</li>
        </ol>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 无状态，适合分布式系统</li>
          <li>✅ 跨域支持好</li>
          <li>✅ 实现简单</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大多数 Web 和移动应用</li>
          <li>分布式系统</li>
          <li>需要跨域访问</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ Token 无法主动失效（需要配合 Redis）</li>
          <li>❌ 安全性需要注意（防止泄露）</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大多数 Web 和移动应用</li>
          <li>分布式系统</li>
          <li>需要跨域访问</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="2-session">2. Session</h3>
        <p><strong>简单理解</strong>：用户登录后，服务器记住用户，给一个"身份证号"。</p>
        <p><strong>原理</strong>：</p>
        <ol>
          <li>用户登录，服务器创建 Session</li>
          <li>客户端保存 Session ID（通常存在 Cookie）</li>
          <li>每次请求携带 Session ID</li>
          <li>服务器验证 Session</li>
        </ol>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 安全性好</li>
          <li>✅ 可以主动失效</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 需要服务器存储</li>
          <li>❌ 跨域支持较差</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>传统 Web 应用</li>
          <li>单机部署</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h3 id="3-oauth-20">3. OAuth 2.0</h3>
        <p><strong>简单理解</strong>：用微信、QQ 等第三方账号登录。</p>
        <p><strong>原理</strong>：</p>
        <ol>
          <li>用户点击"微信登录"</li>
          <li>跳转到微信授权页面</li>
          <li>用户授权后，获取 Token</li>
          <li>用 Token 获取用户信息</li>
        </ol>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 用户体验好（无需注册）</li>
          <li>✅ 无需管理密码</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>需要第三方登录</li>
          <li>快速注册场景</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h2 id="_10">🏗️ 项目架构设计</h2>
        <h3 id="1_1">1. 单体架构</h3>
        <pre><code>┌─────────────────┐
│   前端应用      │
│  (Web/App)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   后端服务      │
│  (API Server)   │
└────────┬────────┘
         │
┌────────▼────────┐
│   数据库        │
│  (MySQL)        │
└─────────────────┘</code></pre>
        <p><strong>简单理解</strong>：所有功能都在一个应用里，就像一个小商店，所有东西都在一个房间里。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 简单易维护</li>
          <li>✅ 开发效率高</li>
          <li>✅ 适合小型项目</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 扩展性差</li>
          <li>❌ 单点故障风险</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>小型项目（用户量 &lt; 10万）</li>
          <li>初期 MVP（最小可行产品）</li>
          <li>团队规模小（&lt; 5人）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="2_1">2. 前后端分离架构 ⭐</h3>
        <pre><code>┌─────────────┐     ┌─────────────┐
│  前端应用   │────▶│  后端 API   │
│ (Vue/React) │     │ (Node/Java)  │
└─────────────┘     └──────┬──────┘
                           │
                  ┌────────▼────────┐
                  │   数据库/缓存   │
                  │ (MySQL/Redis)   │
                  └─────────────────┘</code></pre>
        <p><strong>简单理解</strong>：前端和后端分开开发，就像餐厅的前台和厨房分开。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 前后端独立开发</li>
          <li>✅ 可以独立部署</li>
          <li>✅ 适合团队协作</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大多数现代应用</li>
          <li>需要多端支持（Web、App、小程序）</li>
          <li>团队分工明确</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐（中等）</p>
        <hr />

        <h3 id="3">3. 微服务架构</h3>
        <pre><code>┌──────────┐  ┌──────────┐  ┌──────────┐
│ 用户服务 │  │ 订单服务 │  │ 商品服务 │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                  │
          ┌───────▼───────┐
          │   API 网关    │
          └───────┬───────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼────┐  ┌───▼────┐  ┌───▼────┐
│ MySQL   │  │ Redis  │  │ MongoDB│
└─────────┘  └────────┘  └─────────┘</code></pre>
        <p><strong>简单理解</strong>：把大应用拆成多个小服务，每个服务负责一个功能，就像大商场里的不同店铺。</p>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 服务独立部署</li>
          <li>✅ 易于扩展</li>
          <li>✅ 技术栈灵活</li>
        </ul>
        <p><strong>劣势</strong>：</p>
        <ul>
          <li>❌ 复杂度高</li>
          <li>❌ 运维成本高</li>
        </ul>
        <p><strong>适用场景</strong>：</p>
        <ul>
          <li>大型项目（用户量 &gt; 100万）</li>
          <li>高并发需求</li>
          <li>团队规模大（&gt; 10人）</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐⭐（最高）</p>
        <hr />

        <h2 id="_11">🌳 技术选型决策树</h2>
        <h3 id="_12">前端选型决策</h3>
        <pre><code>需要开发什么？
│
├─ 移动 App
│  ├─ 预算充足 + 性能要求高 → 原生开发（Android/iOS）
│  ├─ 需要快速开发 + 跨平台 → Flutter ⭐
│  └─ 团队熟悉 JS → React Native
│
├─ Web 应用
│  ├─ 中小型项目 → Vue.js ⭐
│  ├─ 大型项目 → React
│  └─ 需要快速原型 → Vue.js
│
└─ 小程序
   ├─ 微信生态 → 微信小程序
   └─ 支付场景 → 支付宝小程序</code></pre>
        <h3 id="_13">后端选型决策</h3>
        <pre><code>项目规模？
│
├─ 小型项目 + 快速迭代 → Node.js ⭐
├─ 大型项目 + 高并发 → Java/Go
├─ 数据处理/AI → Python
└─ 微服务架构 → Java/Go</code></pre>
        <h3 id="_14">数据库选型决策</h3>
        <pre><code>数据类型？
│
├─ 结构化数据 + 需要事务 → MySQL ⭐
├─ 复杂查询 + 高级特性 → PostgreSQL
├─ 文档数据 + 灵活结构 → MongoDB
└─ 缓存 + 高性能 → Redis ⭐</code></pre>
        <hr />

        <h2 id="_15">🎯 推荐技术栈组合</h2>
        <h3 id="mvp">方案一：快速开发（适合 MVP）⭐</h3>
        <p><strong>适用场景</strong>：初创项目、快速验证想法</p>
        <p><strong>技术栈</strong>：</p>
        <ul>
          <li>前端：Vue.js / Flutter</li>
          <li>后端：Node.js + Express</li>
          <li>数据库：MySQL</li>
          <li>缓存：Redis</li>
          <li>鉴权：JWT</li>
        </ul>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 开发速度快</li>
          <li>✅ 学习成本低</li>
          <li>✅ 成本低</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐（较低）</p>
        <hr />

        <h3 id="_16">方案二：企业级（适合大型项目）</h3>
        <p><strong>适用场景</strong>：成熟产品、高并发需求</p>
        <p><strong>技术栈</strong>：</p>
        <ul>
          <li>前端：React / Flutter</li>
          <li>后端：Java + Spring Boot</li>
          <li>数据库：MySQL + Redis</li>
          <li>缓存：Redis</li>
          <li>鉴权：JWT + OAuth 2.0</li>
        </ul>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 稳定可靠</li>
          <li>✅ 性能好</li>
          <li>✅ 适合大型团队</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h3 id="_17">方案三：高性能（适合高并发）</h3>
        <p><strong>适用场景</strong>：高并发、实时性要求高</p>
        <p><strong>技术栈</strong>：</p>
        <ul>
          <li>前端：React / Flutter</li>
          <li>后端：Go / Java</li>
          <li>数据库：PostgreSQL + Redis</li>
          <li>缓存：Redis</li>
          <li>鉴权：JWT</li>
        </ul>
        <p><strong>优势</strong>：</p>
        <ul>
          <li>✅ 性能优秀</li>
          <li>✅ 并发能力强</li>
          <li>✅ 扩展性好</li>
        </ul>
        <p><strong>成本评估</strong>：⭐⭐⭐⭐（较高）</p>
        <hr />

        <h2 id="_18">📐 架构设计原则</h2>
        <h3 id="1_2">1. 可扩展性</h3>
        <p><strong>原则</strong>：系统要能随着业务增长而扩展</p>
        <p><strong>实践</strong>：</p>
        <ul>
          <li>模块化设计（功能独立）</li>
          <li>服务解耦（减少依赖）</li>
          <li>水平扩展支持（可以加服务器）</li>
        </ul>
        <p><strong>示例</strong>：</p>
        <ul>
          <li>用户量从 1万增长到 100万，系统要能支撑</li>
        </ul>
        <hr />

        <h3 id="2_2">2. 可维护性</h3>
        <p><strong>原则</strong>：代码要容易理解和修改</p>
        <p><strong>实践</strong>：</p>
        <ul>
          <li>代码规范（统一风格）</li>
          <li>文档完善（说明清楚）</li>
          <li>测试覆盖（保证质量）</li>
        </ul>
        <p><strong>示例</strong>：</p>
        <ul>
          <li>新人加入团队，能快速理解代码</li>
        </ul>
        <hr />

        <h3 id="3_1">3. 性能优化</h3>
        <p><strong>原则</strong>：系统要快速响应</p>
        <p><strong>实践</strong>：</p>
        <ul>
          <li>数据库索引（加快查询）</li>
          <li>缓存策略（减少数据库压力）</li>
          <li>CDN 加速（加快资源加载）</li>
        </ul>
        <p><strong>示例</strong>：</p>
        <ul>
          <li>页面加载时间 &lt; 2秒</li>
          <li>API 响应时间 &lt; 200ms</li>
        </ul>
        <hr />

        <h3 id="4_1">4. 安全性</h3>
        <p><strong>原则</strong>：保护用户数据和系统安全</p>
        <p><strong>实践</strong>：</p>
        <ul>
          <li>数据加密（敏感信息加密）</li>
          <li>权限控制（不同用户不同权限）</li>
          <li>防攻击措施（防止 SQL 注入、XSS 等）</li>
        </ul>
        <p><strong>示例</strong>：</p>
        <ul>
          <li>用户密码加密存储</li>
          <li>API 接口需要 Token 验证</li>
        </ul>
        <hr />

        <h2 id="_19">💡 技术选型检查清单</h2>
        <p>在做出技术选型前，请回答以下问题：</p>
        <h3 id="_20">项目相关</h3>
        <ul>
          <li>[ ] 项目规模（用户量预期）</li>
          <li>[ ] 项目周期（开发时间）</li>
          <li>[ ] 项目预算（开发成本）</li>
          <li>[ ] 项目类型（Web/App/小程序）</li>
        </ul>
        <h3 id="_21">团队相关</h3>
        <ul>
          <li>[ ] 团队规模</li>
          <li>[ ] 团队技术栈</li>
          <li>[ ] 团队学习能力</li>
          <li>[ ] 团队经验</li>
        </ul>
        <h3 id="_22">业务相关</h3>
        <ul>
          <li>[ ] 性能要求</li>
          <li>[ ] 并发需求</li>
          <li>[ ] 数据量大小</li>
          <li>[ ] 功能复杂度</li>
        </ul>
        <h3 id="_23">技术相关</h3>
        <ul>
          <li>[ ] 是否需要跨平台</li>
          <li>[ ] 是否需要实时通信</li>
          <li>[ ] 是否需要大数据处理</li>
          <li>[ ] 是否需要 AI/ML</li>
        </ul>
        <hr />

        <h2 id="_24">📊 技术选型对比表</h2>
        <table>
          <thead>
            <tr>
              <th>技术</th>
              <th>学习难度</th>
              <th>开发效率</th>
              <th>性能</th>
              <th>成本</th>
              <th>适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>前端</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Vue.js</td>
              <td>⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐</td>
              <td>中小型 Web 应用</td>
            </tr>
            <tr>
              <td>React</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>大型 Web 应用</td>
            </tr>
            <tr>
              <td>Flutter</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>跨平台移动应用</td>
            </tr>
            <tr>
              <td>React Native</td>
              <td>⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>跨平台移动应用</td>
            </tr>
            <tr>
              <td><strong>后端</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Node.js</td>
              <td>⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐</td>
              <td>I/O 密集型应用</td>
            </tr>
            <tr>
              <td>Java</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>企业级应用</td>
            </tr>
            <tr>
              <td>Python</td>
              <td>⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>数据处理/AI</td>
            </tr>
            <tr>
              <td>Go</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>高并发服务</td>
            </tr>
            <tr>
              <td><strong>数据库</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>MySQL</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐</td>
              <td>大多数应用</td>
            </tr>
            <tr>
              <td>PostgreSQL</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>复杂查询</td>
            </tr>
            <tr>
              <td>MongoDB</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>文档存储</td>
            </tr>
            <tr>
              <td>Redis</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>缓存</td>
            </tr>
          </tbody>
        </table>
        <hr />

        <h2 id="_25">🎓 总结</h2>
        <h3 id="_26">技术选型需要考虑的因素</h3>
        <ol>
          <li><strong>项目规模与复杂度</strong>
            <ul>
              <li>小型项目：选择简单易用的技术</li>
              <li>大型项目：选择成熟稳定的技术</li>
            </ul>
          </li>
          <li><strong>团队技术栈</strong>
            <ul>
              <li>选择团队熟悉的技术，降低学习成本</li>
              <li>考虑团队的学习能力</li>
            </ul>
          </li>
          <li><strong>预算与时间</strong>
            <ul>
              <li>预算紧张：选择开源技术</li>
              <li>时间紧迫：选择开发效率高的技术</li>
            </ul>
          </li>
          <li><strong>性能要求</strong>
            <ul>
              <li>高并发：选择性能好的技术</li>
              <li>普通应用：选择开发效率高的技术</li>
            </ul>
          </li>
          <li><strong>未来扩展性</strong>
            <ul>
              <li>考虑业务增长</li>
              <li>考虑技术升级</li>
            </ul>
          </li>
        </ol>

        <h3 id="_27">建议</h3>
        <p><strong>初期（MVP 阶段）</strong>：</p>
        <ul>
          <li>选择熟悉的技术栈，快速验证想法</li>
          <li>优先考虑开发效率</li>
        </ul>
        <p><strong>成长期</strong>：</p>
        <ul>
          <li>根据业务需求优化架构</li>
          <li>引入缓存、CDN 等优化手段</li>
        </ul>
        <p><strong>成熟期</strong>：</p>
        <ul>
          <li>考虑微服务架构</li>
          <li>性能优化和监控</li>
        </ul>
        <hr />

        <h2 id="_28">📚 延伸阅读</h2>
        <h3 id="_29">学习资源</h3>
        <ul>
          <li><strong>Vue.js</strong>：https://cn.vuejs.org/</li>
          <li><strong>React</strong>：https://react.dev/</li>
          <li><strong>Flutter</strong>：https://flutter.cn/</li>
          <li><strong>Node.js</strong>：https://nodejs.org/</li>
          <li><strong>MySQL</strong>：https://dev.mysql.com/doc/</li>
        </ul>
        <h3 id="_30">工具推荐</h3>
        <ul>
          <li><strong>API 测试</strong>：Postman</li>
          <li><strong>数据库管理</strong>：Navicat、DBeaver</li>
          <li><strong>代码管理</strong>：Git、GitHub</li>
          <li><strong>项目管理</strong>：Jira、Trello</li>
        </ul>
        <hr />

        <h2 id="_31">📝 版本历史</h2>
        <ul>
          <li><strong>v1.0</strong> (2026) - 初始版本</li>
          <li>涵盖前端、后端、数据库、缓存、鉴权等技术选型</li>
          <li>提供决策树和推荐方案</li>
        </ul>
        <hr />

        <p class="footer-note">
          <em>本手册会根据技术发展持续更新，建议定期回顾和调整技术选型。</em><br />
          <strong>最后更新</strong>：2026年
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const goBack = () => {
  // 返回到首页
  window.location.href = 'https://gjson.com'
}
</script>

<style scoped>
.tech-guide-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.header {
  position: sticky;
  top: 0;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  height: 60px;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #2d3748;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.main-content {
  padding: 2rem 0;
}

.tech-guide-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  line-height: 1.6;
  color: #333;
}

.intro {
  border-left: 4px solid #3498db;
  margin: 20px 0;
  padding-left: 20px;
  color: #666;
  font-style: italic;
}

h1 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
  margin-top: 0;
}

h2 {
  color: #34495e;
  margin-top: 30px;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 5px;
}

h3 {
  color: #555;
  margin-top: 20px;
}

h4 {
  color: #666;
  margin-top: 15px;
}

code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f4f4f4;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  margin: 20px 0;
  font-family: "Courier New", "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  line-height: 1.5;
  white-space: pre;
  word-wrap: normal;
}

pre code {
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  color: #333;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 20px 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #3498db;
  color: white;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

blockquote {
  border-left: 4px solid #3498db;
  margin: 20px 0;
  padding-left: 20px;
  color: #666;
}

hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 30px 0;
}

.toc {
  margin: 20px 0;
  padding-left: 2rem;
}

.toc li {
  margin: 8px 0;
}

.toc a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.2s;
}

.toc a:hover {
  color: #2980b9;
  text-decoration: underline;
}

ul, ol {
  margin: 15px 0;
  padding-left: 2rem;
}

li {
  margin: 8px 0;
}

p {
  margin: 15px 0;
}

.footer-note {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .tech-guide-container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  h3 {
    font-size: 1.1rem;
  }
}

@media print {
  .header {
    display: none;
  }

  .tech-guide-container {
    box-shadow: none;
    padding: 10px;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }
}
</style>

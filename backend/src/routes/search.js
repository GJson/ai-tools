const express = require('express');
const { body, validationResult } = require('express-validator');
const Tool = require('../models/Tool');
const Comment = require('../models/Comment');
const { getConnection } = require('../config/database');
const { categories } = require('../../data/categories');

const router = express.Router();

// 搜索建议
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }
    
    const query = q.trim().toLowerCase();
    const suggestions = [];
    
    // 搜索工具
    const tools = await searchTools(query, 5);
    tools.forEach(tool => {
      suggestions.push({
        id: tool.id,
        type: 'tool',
        title: tool.name,
        description: tool.description,
        category: getCategoryName(tool.category),
        rating: tool.averageRating,
        url: `/tool/${tool.id}`
      });
    });
    
    // 搜索分类
    const matchingCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query)
    ).slice(0, 3);
    
    matchingCategories.forEach(cat => {
      suggestions.push({
        id: cat.id,
        type: 'category',
        title: cat.name,
        description: cat.description,
        url: `/category/${cat.id}`
      });
    });
    
    // 搜索标签
    const tags = await searchTags(query, 3);
    tags.forEach(tag => {
      suggestions.push({
        id: tag,
        type: 'tag',
        title: tag,
        description: `包含 "${tag}" 标签的工具`,
        url: `/search?q=${encodeURIComponent(tag)}&type=tag`
      });
    });
    
    // 按相关度排序
    suggestions.sort((a, b) => {
      const aScore = calculateRelevanceScore(a.title, query);
      const bScore = calculateRelevanceScore(b.title, query);
      return bScore - aScore;
    });
    
    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('搜索建议错误:', error);
    res.status(500).json({
      success: false,
      error: '获取搜索建议失败'
    });
  }
});

// 综合搜索
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      type = '', 
      category = '', 
      sortBy = 'relevance', 
      pricing = '',
      limit = 20, 
      offset = 0 
    } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: {
          results: [],
          total: 0,
          facets: {}
        }
      });
    }
    
    const query = q.trim();
    const results = [];
    const facets = {
      tools: 0,
      categories: 0,
      tags: 0,
      comments: 0
    };
    
    // 搜索工具
    if (!type || type === 'tools') {
      const tools = await searchTools(query, parseInt(limit), parseInt(offset), {
        category,
        sortBy,
        pricing
      });
      
      tools.forEach(tool => {
        results.push({
          id: tool.id,
          type: 'tool',
          title: tool.name,
          description: tool.description,
          category: getCategoryName(tool.category),
          rating: tool.averageRating,
          pricing: tool.pricing,
          tags: tool.tags,
          url: `/tool/${tool.id}`,
          relevanceScore: calculateRelevanceScore(tool.name, query)
        });
      });
      
      facets.tools = tools.length;
    }
    
    // 搜索分类
    if (!type || type === 'categories') {
      const matchingCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase()) ||
        cat.description.toLowerCase().includes(query.toLowerCase())
      );
      
      matchingCategories.forEach(cat => {
        results.push({
          id: cat.id,
          type: 'category',
          title: cat.name,
          description: cat.description,
          url: `/category/${cat.id}`,
          relevanceScore: calculateRelevanceScore(cat.name, query)
        });
      });
      
      facets.categories = matchingCategories.length;
    }
    
    // 搜索标签
    if (!type || type === 'tags') {
      const tags = await searchTags(query, 10);
      tags.forEach(tag => {
        results.push({
          id: tag,
          type: 'tag',
          title: tag,
          description: `包含 "${tag}" 标签的工具`,
          url: `/search?q=${encodeURIComponent(tag)}&type=tag`,
          relevanceScore: calculateRelevanceScore(tag, query)
        });
      });
      
      facets.tags = tags.length;
    }
    
    // 搜索评论
    if (!type || type === 'comments') {
      const comments = await Comment.searchComments(query, 10, 0);
      
      comments.forEach(comment => {
        results.push({
          id: comment.id,
          type: 'comment',
          title: comment.content.substring(0, 50) + '...',
          description: `来自 ${comment.username} 的评论`,
          toolName: comment.toolName,
          url: `/tool/${comment.toolId}#comment-${comment.id}`,
          relevanceScore: calculateRelevanceScore(comment.content, query)
        });
      });
      
      facets.comments = comments.length;
    }
    
    // 按相关度排序
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    
    res.json({
      success: true,
      data: {
        results: results.slice(0, parseInt(limit)),
        total: results.length,
        facets
      }
    });

  } catch (error) {
    console.error('综合搜索错误:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败'
    });
  }
});

// 搜索工具
async function searchTools(query, limit = 20, offset = 0, filters = {}) {
  const connection = await getConnection();
  const searchTerm = `%${query}%`;
  
  let sql = `
    SELECT t.*, 
           AVG(c.rating) as averageRating,
           COUNT(c.id) as reviewCount
    FROM tools t
    LEFT JOIN comments c ON t.id = c.toolId AND c.isActive = TRUE AND c.isApproved = TRUE
    WHERE t.isActive = TRUE AND t.status = 'approved'
    AND (
      t.name LIKE ? OR 
      t.description LIKE ? OR 
      t.tags LIKE ? OR
      t.features LIKE ?
    )
  `;
  
  const params = [searchTerm, searchTerm, searchTerm, searchTerm];
  
  // 添加分类筛选
  if (filters.category) {
    sql += ' AND t.category = ?';
    params.push(filters.category);
  }
  
  // 添加价格筛选
  if (filters.pricing) {
    if (filters.pricing === 'free') {
      sql += ' AND t.pricing = "free"';
    } else if (filters.pricing === 'paid') {
      sql += ' AND t.pricing IN ("paid", "freemium")';
    }
  }
  
  sql += ' GROUP BY t.id';
  
  // 添加排序
  if (filters.sortBy === 'rating') {
    sql += ' ORDER BY averageRating DESC, t.createdAt DESC';
  } else if (filters.sortBy === 'popularity') {
    sql += ' ORDER BY t.viewCount DESC, t.favoriteCount DESC';
  } else if (filters.sortBy === 'newest') {
    sql += ' ORDER BY t.createdAt DESC';
  } else {
    // 相关度排序
    sql += ` ORDER BY 
      CASE 
        WHEN t.name LIKE ? THEN 3
        WHEN t.description LIKE ? THEN 2
        WHEN t.tags LIKE ? THEN 1
        ELSE 0
      END DESC,
      averageRating DESC,
      t.createdAt DESC`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  const [rows] = await connection.execute(sql, params);
  return rows.map(row => new Tool(row));
}

// 搜索标签 (兼容MariaDB 5.5)
async function searchTags(query, limit = 10) {
  const connection = await getConnection();
  
  const sql = `
    SELECT DISTINCT tags
    FROM tools 
    WHERE isActive = TRUE AND status = 'approved'
    AND tags IS NOT NULL
    LIMIT ?
  `;
  
  const [rows] = await connection.execute(sql, [parseInt(limit) * 5]); // 获取更多行以便过滤
  
  // 手动解析JSON并提取匹配的标签
  const matchedTags = new Set();
  for (const row of rows) {
    try {
      const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
      if (Array.isArray(tags)) {
        tags.forEach(tag => {
          if (tag && tag.toLowerCase().includes(query.toLowerCase())) {
            matchedTags.add(tag);
          }
        });
      }
    } catch (error) {
      // 忽略解析错误
    }
    if (matchedTags.size >= limit) break;
  }
  
  return Array.from(matchedTags).slice(0, limit);
}

// 计算相关度分数
function calculateRelevanceScore(text, query) {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let score = 0;
  
  // 完全匹配
  if (textLower === queryLower) {
    score += 100;
  }
  // 开头匹配
  else if (textLower.startsWith(queryLower)) {
    score += 80;
  }
  // 包含匹配
  else if (textLower.includes(queryLower)) {
    score += 60;
  }
  // 单词匹配
  else {
    const words = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    words.forEach(word => {
      if (textWords.some(textWord => textWord.includes(word))) {
        score += 20;
      }
    });
  }
  
  return score;
}

// 获取分类名称
function getCategoryName(categoryId) {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.name || categoryId;
}

// 搜索统计
router.get('/stats', async (req, res) => {
  try {
    const connection = await getConnection();
    
    // 获取搜索统计
    const statsSql = `
      SELECT 
        COUNT(*) as totalSearches,
        COUNT(DISTINCT query) as uniqueQueries,
        AVG(results_count) as avgResultsPerSearch
      FROM search_logs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const [statsRows] = await connection.execute(statsSql);
    
    // 获取热门搜索词
    const popularSql = `
      SELECT query, COUNT(*) as searchCount
      FROM search_logs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY query
      ORDER BY searchCount DESC
      LIMIT 10
    `;
    
    const [popularRows] = await connection.execute(popularSql);
    
    res.json({
      success: true,
      data: {
        stats: statsRows[0] || { totalSearches: 0, uniqueQueries: 0, avgResultsPerSearch: 0 },
        popularQueries: popularRows
      }
    });

  } catch (error) {
    console.error('搜索统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取搜索统计失败'
    });
  }
});

// 记录搜索日志
router.post('/log', async (req, res) => {
  try {
    const { query, resultsCount, filters } = req.body;
    
    const connection = await getConnection();
    const sql = `
      INSERT INTO search_logs (query, results_count, filters, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    await connection.execute(sql, [
      query,
      resultsCount || 0,
      JSON.stringify(filters || {})
    ]);
    
    res.json({
      success: true,
      message: '搜索日志记录成功'
    });

  } catch (error) {
    console.error('记录搜索日志错误:', error);
    res.status(500).json({
      success: false,
      error: '记录搜索日志失败'
    });
  }
});

module.exports = router;
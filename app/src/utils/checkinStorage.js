/**
 * 听歌打卡日记数据存储工具
 * 使用 localStorage 存储打卡记录
 */

const STORAGE_KEY = 'listening_checkin_records'

/**
 * 获取所有打卡记录
 * @returns {Array} 打卡记录数组
 */
export function getCheckinRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取打卡记录失败:', error)
    return []
  }
}

/**
 * 保存打卡记录
 * @param {Object} record 打卡记录对象
 * @returns {boolean} 是否保存成功
 */
export function saveCheckinRecord(record) {
  try {
    const records = getCheckinRecords()
    const existingIndex = records.findIndex(r => r.id === record.id)
    
    if (existingIndex >= 0) {
      // 更新已有记录
      records[existingIndex] = record
    } else {
      // 添加新记录
      records.push(record)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    return true
  } catch (error) {
    console.error('保存打卡记录失败:', error)
    return false
  }
}

/**
 * 删除打卡记录
 * @param {string} id 记录ID
 * @returns {boolean} 是否删除成功
 */
export function deleteCheckinRecord(id) {
  try {
    const records = getCheckinRecords()
    const filteredRecords = records.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords))
    return true
  } catch (error) {
    console.error('删除打卡记录失败:', error)
    return false
  }
}

/**
 * 根据日期获取打卡记录
 * @param {string} date 日期字符串 (YYYY-MM-DD)
 * @returns {Object|null} 打卡记录或null
 */
export function getCheckinByDate(date) {
  const records = getCheckinRecords()
  return records.find(r => r.date === date) || null
}

/**
 * 检查某日期是否已打卡
 * @param {string} date 日期字符串 (YYYY-MM-DD)
 * @returns {boolean} 是否已打卡
 */
export function isDateChecked(date) {
  const records = getCheckinRecords()
  return records.some(r => r.date === date)
}

/**
 * 获取指定月份的打卡记录
 * @param {number} year 年份
 * @param {number} month 月份 (1-12)
 * @returns {Array} 该月的打卡记录
 */
export function getMonthCheckins(year, month) {
  const records = getCheckinRecords()
  return records.filter(r => {
    const date = new Date(r.date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
}

/**
 * 获取打卡统计数据
 * @returns {Object} 统计数据对象
 */
export function getCheckinStats() {
  const records = getCheckinRecords()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 总打卡天数
  const totalDays = records.length
  
  // 总记录歌曲数
  const totalSongs = records.reduce((sum, r) => sum + (r.songs?.length || 0), 0)
  
  // 本月打卡数
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const thisMonthDays = records.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
  }).length
  
  // 连续打卡天数
  let currentStreak = 0
  const sortedDates = [...records]
    .map(r => new Date(r.date))
    .sort((a, b) => b - a)
  
  let checkDate = new Date(today)
  
  for (const date of sortedDates) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    
    if (d.getTime() === checkDate.getTime()) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (d.getTime() < checkDate.getTime()) {
      break
    }
  }
  
  // 最长连续打卡
  let longestStreak = 0
  let tempStreak = 0
  let prevDate = null
  
  const sortedAllDates = [...records]
    .map(r => new Date(r.date))
    .sort((a, b) => a - b)
  
  for (const date of sortedAllDates) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    
    if (!prevDate) {
      tempStreak = 1
    } else {
      const diffTime = d.getTime() - prevDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    prevDate = d
  }
  longestStreak = Math.max(longestStreak, tempStreak)
  
  return {
    totalDays,
    totalSongs,
    thisMonthDays,
    currentStreak,
    longestStreak
  }
}

/**
 * 导出打卡记录为JSON
 * @returns {string} JSON字符串
 */
export function exportCheckinData() {
  const records = getCheckinRecords()
  return JSON.stringify(records, null, 2)
}

/**
 * 从JSON导入打卡记录
 * @param {string} jsonData JSON字符串
 * @returns {boolean} 是否导入成功
 */
export function importCheckinData(jsonData) {
  try {
    const records = JSON.parse(jsonData)
    if (Array.isArray(records)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      return true
    }
    return false
  } catch (error) {
    console.error('导入打卡记录失败:', error)
    return false
  }
}

/**
 * 清空所有打卡记录
 * @returns {boolean} 是否清空成功
 */
export function clearAllCheckins() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清空打卡记录失败:', error)
    return false
  }
}

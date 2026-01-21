<template>
  <!-- genAI_main_start -->
  <div class="calendar-container">
    <div class="calendar-wrapper">
      <!-- 左侧日历网格 -->
      <div class="calendar-grid">
        <!-- 日历头部 -->
        <div class="calendar-header">
          <button class="nav-btn" @click="prevMonth" aria-label="上一月">
            <ChevronLeft :size="20" />
          </button>
          
          <div class="date-selectors">
            <select v-model="selectedYear" @change="updateCalendar" class="year-select">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
            <select v-model="selectedMonth" @change="updateCalendar" class="month-select">
              <option v-for="month in 12" :key="month" :value="month">
                {{ month }}月
              </option>
            </select>
          </div>
          
          <button class="nav-btn" @click="nextMonth" aria-label="下一月">
            <ChevronRight :size="20" />
          </button>
          
          <button class="today-btn" @click="goToToday">今天</button>
        </div>

        <!-- 星期标题 -->
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <!-- 日期网格 -->
        <div class="days-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'day-cell',
              {
                'other-month': day.isOtherMonth,
                'today': day.isToday,
                'weekend': day.isWeekend,
                'selected': day.isSelected,
                'has-solar-term': day.solarTerm,
                'workday': day.isWorkday,
                'holiday': day.isHoliday
              }
            ]"
            @click="selectDate(day)"
          >
            <div class="day-header">
              <div class="day-number">{{ day.date }}</div>
              <div class="badges">
                <div v-if="day.isWorkday" class="workday-badge">班</div>
                <div v-if="day.isHoliday" class="holiday-badge">假</div>
              </div>
            </div>
            <div v-if="day.lunar" class="lunar-date">{{ day.lunar }}</div>
            <div v-if="day.solarTerm" class="solar-term">{{ day.solarTerm }}</div>
            <div v-if="day.festival" class="festival">{{ day.festival }}</div>
            <div v-if="day.holidayName" class="holiday-name">{{ day.holidayName }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="calendar-details">
        <div class="details-header">
          <div class="current-date-info">
            <div class="date-text">
              {{ selectedDateInfo.year }}年{{ selectedDateInfo.month }}月{{ selectedDateInfo.day }}日
              {{ selectedDateInfo.weekday }}
            </div>
            <div class="day-number-large">{{ selectedDateInfo.day }}</div>
          </div>
          
          <div class="lunar-info">
            <div class="lunar-date-text">农历{{ selectedDateInfo.lunar }}</div>
            <div class="year-info">{{ selectedDateInfo.yearName }}</div>
          </div>
        </div>

        <!-- 农时信息 -->
        <div class="agricultural-info">
          <div class="info-section">
            <div class="section-header">
              <h3>{{ selectedDateInfo.period }}主要农时</h3>
              <a href="#" class="more-link">更多</a>
            </div>
            
            <div class="agricultural-table">
              <table>
                <thead>
                  <tr>
                    <th>农作物</th>
                    <th>东北</th>
                    <th>西北</th>
                    <th>华北</th>
                    <th>黄淮</th>
                    <th>江淮</th>
                    <th>江南</th>
                    <th>华南</th>
                    <th>西南</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="crop in agriculturalData" :key="crop.name">
                    <td>{{ crop.name }}</td>
                    <td>{{ crop.regions.northeast || '-' }}</td>
                    <td>{{ crop.regions.northwest || '-' }}</td>
                    <td>{{ crop.regions.northChina || '-' }}</td>
                    <td>{{ crop.regions.huanghuai || '-' }}</td>
                    <td>{{ crop.regions.jianghuai || '-' }}</td>
                    <td>{{ crop.regions.jiangnan || '-' }}</td>
                    <td>{{ crop.regions.southChina || '-' }}</td>
                    <td>{{ crop.regions.southwest || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- genAI_main_end -->
</template>

<script setup lang="ts">
/** genAI_main_start */
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Lunar } from 'lunar-javascript'

const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

interface DayInfo {
  date: number
  fullDate: Date
  lunar: string
  solarTerm?: string
  festival?: string
  isToday: boolean
  isWeekend: boolean
  isOtherMonth: boolean
  isSelected: boolean
  isWorkday?: boolean // 是否为补班日期
  isHoliday?: boolean // 是否为假期
  holidayName?: string // 假期名称
}

const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)
const selectedDate = ref<Date>(new Date())

// 补班日期列表（格式：YYYY-MM-DD）
// 2026年补班日期（仅包含周末补班日期）
// 数据来源：国务院办公厅关于2026年部分节假日安排的通知
// http://politics.people.com.cn/n1/2025/1104/c1001-40596715.html
const workdayDates = new Set([
  '2026-01-04', // 1月4日（周日）上班 - 元旦补班
  '2026-02-14', // 2月14日（周六）上班 - 春节补班
  '2026-02-28', // 2月28日（周六）上班 - 春节补班
  '2026-05-09', // 5月9日（周六）上班 - 劳动节补班
  '2026-09-20', // 9月20日（周日）上班 - 国庆节补班
  '2026-10-10', // 10月10日（周六）上班 - 国庆节补班
])

// 假期日期列表（格式：YYYY-MM-DD: 假期名称）
// 2026年法定节假日安排
const holidayDates = new Map([
  // 元旦：1月1日至3日
  ['2026-01-01', '元旦'],
  ['2026-01-02', '元旦'],
  ['2026-01-03', '元旦'],
  // 春节：2月15日至23日
  ['2026-02-15', '春节'],
  ['2026-02-16', '春节'],
  ['2026-02-17', '春节'],
  ['2026-02-18', '春节'],
  ['2026-02-19', '春节'],
  ['2026-02-20', '春节'],
  ['2026-02-21', '春节'],
  ['2026-02-22', '春节'],
  ['2026-02-23', '春节'],
  // 清明节：4月4日至6日
  ['2026-04-04', '清明节'],
  ['2026-04-05', '清明节'],
  ['2026-04-06', '清明节'],
  // 劳动节：5月1日至5日
  ['2026-05-01', '劳动节'],
  ['2026-05-02', '劳动节'],
  ['2026-05-03', '劳动节'],
  ['2026-05-04', '劳动节'],
  ['2026-05-05', '劳动节'],
  // 端午节：6月19日至21日
  ['2026-06-19', '端午节'],
  ['2026-06-20', '端午节'],
  ['2026-06-21', '端午节'],
  // 中秋节：9月25日至27日
  ['2026-09-25', '中秋节'],
  ['2026-09-26', '中秋节'],
  ['2026-09-27', '中秋节'],
  // 国庆节：10月1日至7日
  ['2026-10-01', '国庆节'],
  ['2026-10-02', '国庆节'],
  ['2026-10-03', '国庆节'],
  ['2026-10-04', '国庆节'],
  ['2026-10-05', '国庆节'],
  ['2026-10-06', '国庆节'],
  ['2026-10-07', '国庆节'],
])

// 判断日期是否为补班日期
const isWorkday = (date: Date): boolean => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return workdayDates.has(dateStr)
}

// 判断日期是否为假期
const getHolidayInfo = (date: Date): { isHoliday: boolean; holidayName?: string } => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const holidayName = holidayDates.get(dateStr)
  return {
    isHoliday: !!holidayName,
    holidayName
  }
}

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const yearList = []
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    yearList.push(i)
  }
  return yearList
})

// 获取农历信息
const getLunarInfo = (date: Date) => {
  try {
    const lunar = Lunar.fromDate(date)
    const lunarMonth = lunar.getMonthInChinese()
    const lunarDay = lunar.getDayInChinese()
    const solarTerm = lunar.getJieQi() || ''
    const festival = lunar.getFestivals().join('') || ''
    
    return {
      lunar: `${lunarMonth}${lunarDay}`,
      solarTerm: solarTerm || undefined,
      festival: festival || undefined
    }
  } catch (e) {
    return {
      lunar: '',
      solarTerm: undefined,
      festival: undefined
    }
  }
}

// 生成日历天数
const calendarDays = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstDayWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days: DayInfo[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 上个月的日期
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  for (let i = firstDayWeek - 1; i > 0; i--) {
    const date = new Date(year, month - 2, prevMonthLastDay - i + 1)
    const lunarInfo = getLunarInfo(date)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const holidayInfo = getHolidayInfo(date)
    days.push({
      date: prevMonthLastDay - i + 1,
      fullDate: date,
      lunar: lunarInfo.lunar,
      solarTerm: lunarInfo.solarTerm,
      festival: lunarInfo.festival,
      isToday: date.getTime() === today.getTime(),
      isWeekend,
      isOtherMonth: true,
      isSelected: false,
      isWorkday: isWeekend && isWorkday(date),
      isHoliday: holidayInfo.isHoliday,
      holidayName: holidayInfo.holidayName
    })
  }
  
  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i)
    const lunarInfo = getLunarInfo(date)
    const isSelected = date.getTime() === selectedDate.value.getTime()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const holidayInfo = getHolidayInfo(date)
    
    days.push({
      date: i,
      fullDate: date,
      lunar: lunarInfo.lunar,
      solarTerm: lunarInfo.solarTerm,
      festival: lunarInfo.festival,
      isToday: date.getTime() === today.getTime(),
      isWeekend,
      isOtherMonth: false,
      isSelected,
      isWorkday: isWeekend && isWorkday(date),
      isHoliday: holidayInfo.isHoliday,
      holidayName: holidayInfo.holidayName
    })
  }
  
  // 下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month, i)
    const lunarInfo = getLunarInfo(date)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const holidayInfo = getHolidayInfo(date)
    days.push({
      date: i,
      fullDate: date,
      lunar: lunarInfo.lunar,
      solarTerm: lunarInfo.solarTerm,
      festival: lunarInfo.festival,
      isToday: date.getTime() === today.getTime(),
      isWeekend,
      isOtherMonth: true,
      isSelected: false,
      isWorkday: isWeekend && isWorkday(date),
      isHoliday: holidayInfo.isHoliday,
      holidayName: holidayInfo.holidayName
    })
  }
  
  return days
})

// 选中日期信息
const selectedDateInfo = computed(() => {
  const date = selectedDate.value
  const lunar = Lunar.fromDate(date)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  // 判断是上旬、中旬还是下旬
  const day = date.getDate()
  let period = ''
  if (day <= 10) {
    period = `${selectedMonth.value}月上旬`
  } else if (day <= 20) {
    period = `${selectedMonth.value}月中旬`
  } else {
    period = `${selectedMonth.value}月下旬`
  }
  
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: weekdays[date.getDay()],
    lunar: `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`,
    yearName: `${lunar.getYearInGanZhi()}年【${lunar.getYearShengXiao()}年】`,
    period
  }
})

// 农时数据（示例数据）
const agriculturalData = computed(() => {
  const month = selectedMonth.value
  const day = selectedDate.value.getDate()
  
  // 根据月份和日期返回不同的农时数据
  if (month === 1) {
    if (day <= 10) {
      return [
        {
          name: '冬小麦',
          regions: {
            northeast: '越冬',
            northwest: '越冬',
            northChina: '越冬',
            huanghuai: '停止',
            jianghuai: '分蘖',
            jiangnan: '',
            southChina: '',
            southwest: ''
          }
        },
        {
          name: '油菜',
          regions: {
            northeast: '',
            northwest: '',
            northChina: '',
            huanghuai: '越冬',
            jianghuai: '缓长',
            jiangnan: '缓长',
            southChina: '始蕾',
            southwest: ''
          }
        }
      ]
    }
  }
  
  return [
    {
      name: '冬小麦',
      regions: {
        northeast: '',
        northwest: '',
        northChina: '',
        huanghuai: '',
        jianghuai: '',
        jiangnan: '',
        southChina: '',
        southwest: ''
      }
    }
  ]
})

const prevMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
}

const nextMonth = () => {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
}

const goToToday = () => {
  const today = new Date()
  selectedYear.value = today.getFullYear()
  selectedMonth.value = today.getMonth() + 1
  selectedDate.value = new Date(today)
}

const updateCalendar = () => {
  // 当月份或年份改变时，确保选中的日期仍然有效
  const maxDay = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  if (selectedDate.value.getDate() > maxDay) {
    selectedDate.value = new Date(selectedYear.value, selectedMonth.value - 1, maxDay)
  }
}

const selectDate = (day: DayInfo) => {
  selectedDate.value = new Date(day.fullDate)
  // 如果选中的是其他月份的日期，切换月份
  if (day.isOtherMonth) {
    selectedYear.value = day.fullDate.getFullYear()
    selectedMonth.value = day.fullDate.getMonth() + 1
  }
}

onMounted(() => {
  selectedDate.value = new Date()
})
/** genAI_main_end */
</script>

<style scoped>
/* genAI_main_start */
.calendar-container {
  width: 100%;
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.calendar-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.nav-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-width: 44px;
  min-height: 44px;
}

.nav-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.date-selectors {
  display: flex;
  gap: 8px;
}

.year-select,
.month-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.year-select:hover,
.month-select:hover {
  border-color: #9ca3af;
}

.today-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 44px;
}

.today-btn:hover {
  background-color: #dc2626;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
  padding: 8px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.2s;
  background: white;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.day-cell:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.day-cell.other-month {
  color: #9ca3af;
  background-color: #f9fafb;
}

.day-cell.today {
  background-color: #fef2f2;
  border-color: #ef4444;
  border-width: 2px;
}

.day-cell.today .day-number {
  color: #ef4444;
  font-weight: 700;
}

.day-cell.weekend {
  background-color: #fef2f2;
}

.day-cell.selected {
  background-color: #3b82f6;
  border-color: #2563eb;
  color: white;
}

.day-cell.selected .day-number,
.day-cell.selected .lunar-date {
  color: white;
}

.day-cell.has-solar-term {
  border-color: #10b981;
}

.day-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
  flex: 1;
}

.badges {
  position: absolute;
  top: -2px;
  right: -2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}

.workday-badge {
  background-color: #3b82f6;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
  line-height: 1;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.holiday-badge {
  background-color: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
  line-height: 1;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.day-cell.selected .workday-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: #3b82f6;
}

.day-cell.selected .holiday-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: #10b981;
}

.day-cell.holiday {
  background-color: #ecfdf5;
  border-color: #10b981;
}

.day-cell.holiday.today {
  background-color: #d1fae5;
  border-color: #10b981;
}

.holiday-name {
  font-size: 10px;
  color: #10b981;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}

.day-cell.selected .holiday-name {
  color: white;
}

.lunar-date {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.day-cell.selected .lunar-date {
  color: rgba(255, 255, 255, 0.9);
}

.solar-term {
  font-size: 10px;
  color: #10b981;
  font-weight: 600;
  margin-top: 2px;
}

.day-cell.selected .solar-term {
  color: white;
}

.festival {
  font-size: 10px;
  color: #ef4444;
  font-weight: 600;
  margin-top: 2px;
}

.day-cell.selected .festival {
  color: white;
}

.calendar-details {
  display: flex;
  flex-direction: column;
  padding-left: 24px;
  border-left: 1px solid #e5e7eb;
}

.details-header {
  margin-bottom: 24px;
}

.current-date-info {
  margin-bottom: 16px;
}

.date-text {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 8px;
}

.day-number-large {
  font-size: 48px;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}

.lunar-info {
  margin-top: 16px;
}

.lunar-date-text {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 4px;
}

.year-info {
  font-size: 14px;
  color: #9ca3af;
}

.agricultural-info {
  flex: 1;
}

.info-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.more-link {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
}

.more-link:hover {
  text-decoration: underline;
}

.agricultural-table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.agricultural-table::-webkit-scrollbar {
  height: 6px;
}

.agricultural-table::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.agricultural-table::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.agricultural-table::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.agricultural-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.agricultural-table thead {
  background-color: #f3f4f6;
}

.agricultural-table th,
.agricultural-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.agricultural-table th {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.agricultural-table td {
  color: #6b7280;
}

@media (max-width: 1024px) {
  .calendar-wrapper {
    grid-template-columns: 1fr;
  }
  
  .calendar-details {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 8px;
  }
  
  .calendar-wrapper {
    padding: 12px;
    border-radius: 8px;
  }
  
  .calendar-header {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .nav-btn {
    padding: 6px 10px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .date-selectors {
    flex: 1;
    min-width: 0;
  }
  
  .year-select,
  .month-select {
    padding: 6px 8px;
    font-size: 13px;
    flex: 1;
  }
  
  .today-btn {
    width: 100%;
    margin-top: 8px;
    padding: 10px;
    font-size: 14px;
  }
  
  .weekdays {
    gap: 2px;
    margin-bottom: 6px;
  }
  
  .weekday {
    font-size: 12px;
    padding: 6px 2px;
  }
  
  .days-grid {
    gap: 2px;
  }
  
  .day-cell {
    padding: 6px 2px;
    min-height: 60px;
  }
  
  .day-number {
    font-size: 15px;
  }
  
  .lunar-date {
    font-size: 9px;
    margin-top: 1px;
  }
  
  .solar-term,
  .festival,
  .holiday-name {
    font-size: 9px;
    margin-top: 1px;
  }
  
  .workday-badge,
  .holiday-badge {
    font-size: 9px;
    padding: 1px 3px;
    min-width: 14px;
  }
  
  .badges {
    top: -1px;
    right: -1px;
    gap: 1px;
  }
  
  .details-header {
    margin-bottom: 16px;
  }
  
  .date-text {
    font-size: 16px;
  }
  
  .day-number-large {
    font-size: 36px;
  }
  
  .lunar-date-text {
    font-size: 14px;
  }
  
  .year-info {
    font-size: 12px;
  }
  
  .section-header h3 {
    font-size: 14px;
  }
  
  .more-link {
    font-size: 12px;
  }
  
  .agricultural-table {
    font-size: 9px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .agricultural-table th,
  .agricultural-table td {
    padding: 4px 2px;
    font-size: 9px;
  }
  
  .agricultural-table th {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: 4px;
  }
  
  .calendar-wrapper {
    padding: 8px;
  }
  
  .calendar-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }
  
  .nav-btn {
    padding: 5px 8px;
  }
  
  .nav-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .year-select,
  .month-select {
    padding: 5px 6px;
    font-size: 12px;
  }
  
  .today-btn {
    padding: 8px;
    font-size: 13px;
  }
  
  .weekday {
    font-size: 11px;
    padding: 4px 1px;
  }
  
  .day-cell {
    padding: 4px 1px;
    min-height: 50px;
  }
  
  .day-number {
    font-size: 13px;
  }
  
  .lunar-date {
    font-size: 8px;
  }
  
  .solar-term,
  .festival,
  .holiday-name {
    font-size: 8px;
  }
  
  .workday-badge,
  .holiday-badge {
    font-size: 8px;
    padding: 1px 2px;
    min-width: 12px;
  }
  
  .date-text {
    font-size: 14px;
  }
  
  .day-number-large {
    font-size: 32px;
  }
  
  .lunar-date-text {
    font-size: 13px;
  }
  
  .year-info {
    font-size: 11px;
  }
  
  .section-header h3 {
    font-size: 13px;
  }
  
  .agricultural-table {
    font-size: 8px;
  }
  
  .agricultural-table th,
  .agricultural-table td {
    padding: 3px 1px;
    font-size: 8px;
  }
  
  .agricultural-info {
    margin-top: 16px;
  }
  
  .info-section {
    margin-bottom: 16px;
  }
}

/* 横屏优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .calendar-wrapper {
    grid-template-columns: 1fr 1fr;
  }
  
  .calendar-details {
    padding-left: 16px;
    border-left: 1px solid #e5e7eb;
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }
  
  .day-cell {
    min-height: 45px;
    padding: 3px 1px;
  }
}
/* genAI_main_end */
</style>

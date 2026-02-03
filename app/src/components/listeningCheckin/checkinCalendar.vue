<template>
  <div class="checkin-calendar">
    <div class="calendar-header">
      <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>
    <div class="calendar-body">
      <div
        v-for="(date, index) in calendarDates"
        :key="index"
        class="calendar-cell"
        :class="{
          'other-month': !date.isCurrentMonth,
          'today': date.isToday,
          'checked': date.isChecked,
          'weekend': date.isWeekend
        }"
        @click="onDateClick(date)"
      >
        <div class="date-number">{{ date.day }}</div>
        <div v-if="date.isChecked" class="check-mark">
          <i class="el-icon-check"></i>
        </div>
        <div v-else-if="date.isToday" class="today-dot"></div>
      </div>
    </div>
    <div class="calendar-legend">
      <div class="legend-item">
        <div class="legend-dot checked"></div>
        <span>已打卡</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot today"></div>
        <span>今天</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot weekend"></div>
        <span>周末</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckinCalendar',
  props: {
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    checkinDates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    calendarDates() {
      const dates = []
      const firstDay = new Date(this.year, this.month - 1, 1)
      const lastDay = new Date(this.year, this.month, 0)
      const prevLastDay = new Date(this.year, this.month - 1, 0)
      
      const firstDayWeek = firstDay.getDay()
      const totalDays = lastDay.getDate()
      const prevTotalDays = prevLastDay.getDate()
      
      const today = new Date()
      const todayStr = this.formatDate(today)
      
      // 上个月的日期
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const day = prevTotalDays - i
        const date = new Date(this.year, this.month - 2, day)
        dates.push({
          day,
          date: this.formatDate(date),
          isCurrentMonth: false,
          isToday: false,
          isChecked: this.checkinDates.includes(this.formatDate(date)),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        })
      }
      
      // 当前月的日期
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(this.year, this.month - 1, day)
        const dateStr = this.formatDate(date)
        dates.push({
          day,
          date: dateStr,
          isCurrentMonth: true,
          isToday: dateStr === todayStr,
          isChecked: this.checkinDates.includes(dateStr),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        })
      }
      
      // 下个月的日期
      const remainingCells = 42 - dates.length // 6行7列 = 42个格子
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(this.year, this.month, day)
        dates.push({
          day,
          date: this.formatDate(date),
          isCurrentMonth: false,
          isToday: false,
          isChecked: this.checkinDates.includes(this.formatDate(date)),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        })
      }
      
      return dates
    }
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    onDateClick(date) {
      this.$emit('date-click', date.date)
    }
  }
}
</script>

<style scoped>
.checkin-calendar {
  background: #fff;
  border-radius: 12px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.weekday {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #999;
  padding: 8px;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  background: #f8f9fa;
}

.calendar-cell:hover {
  background: #e8e8e8;
  transform: scale(1.05);
}

.calendar-cell.other-month {
  opacity: 0.4;
}

.calendar-cell.weekend {
  background: #fff5f5;
}

.calendar-cell.today {
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

.calendar-cell.checked {
  background: linear-gradient(135deg, #ec4141 0%, #ff6b6b 100%);
  color: #fff;
}

.calendar-cell.checked:hover {
  background: linear-gradient(135deg, #d93a3a 0%, #ff5252 100%);
}

.date-number {
  font-size: 14px;
  font-weight: 500;
}

.check-mark {
  position: absolute;
  bottom: 4px;
  font-size: 12px;
}

.today-dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
  position: absolute;
  bottom: 6px;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend-dot.checked {
  background: linear-gradient(135deg, #ec4141 0%, #ff6b6b 100%);
}

.legend-dot.today {
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

.legend-dot.weekend {
  background: #fff5f5;
}

@media (max-width: 768px) {
  .calendar-header,
  .calendar-body {
    gap: 4px;
  }
  
  .weekday {
    font-size: 12px;
    padding: 4px;
  }
  
  .date-number {
    font-size: 12px;
  }
  
  .calendar-legend {
    gap: 12px;
  }
  
  .legend-item {
    font-size: 11px;
  }
}
</style>

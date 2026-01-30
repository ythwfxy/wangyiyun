const STORAGE_KEY = 'listening_checkin_records'

export function getCheckinRecords() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveCheckinRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function addCheckinRecord(record) {
  const records = getCheckinRecords()
  record.id = Date.now().toString()
  record.createdAt = new Date().toISOString()
  record.updatedAt = new Date().toISOString()
  records.unshift(record)
  saveCheckinRecords(records)
  return record
}

export function updateCheckinRecord(id, updates) {
  const records = getCheckinRecords()
  const index = records.findIndex(r => r.id === id)
  if (index !== -1) {
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
    saveCheckinRecords(records)
    return records[index]
  }
  return null
}

export function deleteCheckinRecord(id) {
  const records = getCheckinRecords()
  const filtered = records.filter(r => r.id !== id)
  saveCheckinRecords(filtered)
  return true
}

export function getCheckinRecordsByDate(date) {
  const records = getCheckinRecords()
  const targetDate = new Date(date).toDateString()
  return records.filter(r => new Date(r.date).toDateString() === targetDate)
}

export function getCheckinRecordsByMonth(year, month) {
  const records = getCheckinRecords()
  return records.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function getCheckinCalendarData(year, month) {
  const records = getCheckinRecordsByMonth(year, month)
  const calendarData = {}
  records.forEach(record => {
    const date = new Date(record.date).getDate()
    if (!calendarData[date]) {
      calendarData[date] = []
    }
    calendarData[date].push(record)
  })
  return calendarData
}

// Excel导出工具类

// 将JSON数据转换为Excel文件
export function export_json_to_excel({ header, data, filename = 'excel-list.xlsx', autoWidth = true, bookType = 'xlsx' }) {
  /* original data */
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  if (header) {
    const headerData = [header]
    const wsHeader = XLSX.utils.aoa_to_sheet(headerData)
    XLSX.utils.sheet_add_json(wsHeader, data, { origin: 'A2' })
    XLSX.utils.book_append_sheet(wb, wsHeader, 'Sheet1')
  } else {
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  }

  /* 设置单元格宽度 */
  if (autoWidth) {
    /* 设置worksheet每列的最大宽度 */
    const colWidth = data.map(row => Object.values(row).map(val => {
      /* 先判断是否为null/undefined */
      if (val == null) {
        return { wch: 10 }
      }
      /* 再判断是否为中文 */
      else if (val.toString().charCodeAt(0) > 255) {
        /* 中文宽度为10 */
        return { wch: val.toString().length * 2 }
      } else {
        /* 英文宽度为5 */
        return { wch: val.toString().length }
      }
    }))
    /* 以第一行为初始值 */
    const result = colWidth[0]
    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j]['wch'] < colWidth[i][j]['wch']) {
          result[j]['wch'] = colWidth[i][j]['wch']
        }
      }
    }
    ws['!cols'] = result
  }

  /* 导出文件 */
  XLSX.writeFile(wb, filename, { bookType, bookSST: false, type: 'array' })
}

// 将Excel文件转换为JSON数据
export function import_excel_to_json(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      resolve(jsonData)
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

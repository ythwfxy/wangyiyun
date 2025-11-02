// 生成随机日期
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// 生成随机文件名
function getRandomFileName(type) {
  const prefixes = {
    audio: ['音乐', '歌曲', '音频', 'sound', 'music'],
    video: ['视频', 'movie', 'film', 'video', 'clip'],
    document: ['文档', '报告', '论文', 'document', 'file'],
    other: ['文件', '资料', '数据', 'other', 'stuff']
  }
  
  const suffixes = {
    audio: ['.mp3', '.wav', '.flac', '.m4a'],
    video: ['.mp4', '.avi', '.mov', '.wmv'],
    document: ['.doc', '.docx', '.pdf', '.txt', '.ppt', '.pptx', '.xls', '.xlsx'],
    other: ['.zip', '.rar', '.7z', '.exe', '.jpg', '.png', '.gif']
  }
  
  const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)]
  const suffix = suffixes[type][Math.floor(Math.random() * suffixes[type].length)]
  const randomNum = Math.floor(Math.random() * 1000)
  
  return `${prefix}${randomNum}${suffix}`
}

// 生成随机文件大小
function getRandomFileSize(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 生成随机上传人
function getRandomUploader() {
  const uploaders = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  return uploaders[Math.floor(Math.random() * uploaders.length)]
}

// 生成mock文件数据
export const mockFiles = []
const types = ['audio', 'video', 'document', 'other']
const startDate = new Date('2023-01-01')
const endDate = new Date()

for (let i = 1; i <= 30; i++) {
  const type = types[Math.floor(Math.random() * types.length)]
  mockFiles.push({
    id: i,
    fileName: getRandomFileName(type),
    fileType: type,
    fileSize: getRandomFileSize(1024, 1024 * 1024 * 100), // 1KB - 100MB
    uploadTime: getRandomDate(startDate, endDate),
    uploader: getRandomUploader(),
    url: '#' // 实际URL可以根据需要替换
  })
}

// 按上传时间降序排列
mockFiles.sort((a, b) => b.uploadTime - a.uploadTime)
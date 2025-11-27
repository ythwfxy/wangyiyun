<template>
  <div class="music-masterclass">
    <!-- 顶部导航筛选区 -->
    <div class="top-filter-bar">
      <h1 class="page-title">音乐大师课</h1>
      <div class="search-filter-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程、导师、乐器类型"
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter.native="handleSearch"
        ></el-input>
        <el-dropdown class="filter-dropdown">
          <el-button type="primary" icon="el-icon-filter">筛选</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item-group title="按乐器筛选">
              <el-dropdown-item>吉他</el-dropdown-item>
              <el-dropdown-item>钢琴</el-dropdown-item>
              <el-dropdown-item>架子鼓</el-dropdown-item>
              <el-dropdown-item>贝斯</el-dropdown-item>
              <el-dropdown-item>小提琴</el-dropdown-item>
              <el-dropdown-item>其他</el-dropdown-item>
            </el-dropdown-item-group>
            <el-dropdown-item-group title="按风格筛选">
              <el-dropdown-item>流行</el-dropdown-item>
              <el-dropdown-item>摇滚</el-dropdown-item>
              <el-dropdown-item>古典</el-dropdown-item>
              <el-dropdown-item>爵士</el-dropdown-item>
              <el-dropdown-item>电子</el-dropdown-item>
            </el-dropdown-item-group>
            <el-dropdown-item-group title="按难度筛选">
              <el-dropdown-item>入门</el-dropdown-item>
              <el-dropdown-item>初级</el-dropdown-item>
              <el-dropdown-item>中级</el-dropdown-item>
              <el-dropdown-item>高级</el-dropdown-item>
            </el-dropdown-item-group>
            <el-dropdown-item-group title="按收费方式筛选">
              <el-dropdown-item>免费</el-dropdown-item>
              <el-dropdown-item>付费</el-dropdown-item>
            </el-dropdown-item-group>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="content-container">
      <!-- 主栏 -->
      <div class="main-content">
        <!-- 推荐课程轮播图 -->
        <div class="carousel-section">
          <el-carousel height="400px" indicator-position="outside">
            <el-carousel-item v-for="(course, index) in recommendedCourses" :key="index">
              <div class="carousel-item">
                <img :src="course.cover" :alt="course.title" class="course-cover">
                <div class="course-info">
                  <h3>{{ course.title }}</h3>
                  <p>{{ course.teacher }}</p>
                  <span class="course-price">{{ course.price === 0 ? '免费' : '¥' + course.price }}</span>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 新课上线 -->
        <div class="new-courses-section">
          <h2 class="section-title">新课上线</h2>
          <div class="course-grid">
            <div class="course-card" v-for="(course, index) in newCourses" :key="index">
              <img :src="course.cover" :alt="course.title" class="course-card-cover">
              <div class="course-card-info">
                <h3>{{ course.title }}</h3>
                <p class="course-teacher">{{ course.teacher }}</p>
                <p class="course-desc">{{ course.description }}</p>
                <div class="course-footer">
                  <span class="course-price">{{ course.price === 0 ? '免费' : '¥' + course.price }}</span>
                  <span class="course-students">{{ course.students }}人学习</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门排行 -->
        <div class="popular-courses-section">
          <h2 class="section-title">热门排行</h2>
          <div class="course-grid">
            <div class="course-card" v-for="(course, index) in popularCourses" :key="index">
              <img :src="course.cover" :alt="course.title" class="course-card-cover">
              <div class="course-card-info">
                <h3>{{ course.title }}</h3>
                <p class="course-teacher">{{ course.teacher }}</p>
                <p class="course-desc">{{ course.description }}</p>
                <div class="course-footer">
                  <span class="course-price">{{ course.price === 0 ? '免费' : '¥' + course.price }}</span>
                  <span class="course-students">{{ course.students }}人学习</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 精选专题 -->
        <div class="special-topics-section">
          <h2 class="section-title">精选专题</h2>
          <div class="topic-grid">
            <div class="topic-card" v-for="(topic, index) in specialTopics" :key="index">
              <img :src="topic.cover" :alt="topic.title" class="topic-cover">
              <div class="topic-info">
                <h3>{{ topic.title }}</h3>
                <p>{{ topic.description }}</p>
                <span class="topic-courses">{{ topic.courses }}门课程</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 副栏 -->
      <div class="sidebar">
        <!-- 导师推荐 -->
        <div class="teacher-recommendation">
          <h3 class="sidebar-title">导师推荐</h3>
          <div class="teacher-list">
            <div class="teacher-card" v-for="(teacher, index) in recommendedTeachers" :key="index">
              <img :src="teacher.avatar" :alt="teacher.name" class="teacher-avatar">
              <div class="teacher-info">
                <h4>{{ teacher.name }}</h4>
                <p class="teacher-desc">{{ teacher.description }}</p>
                <span class="teacher-courses">{{ teacher.courses }}门课程</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习路径 -->
        <div class="learning-path">
          <h3 class="sidebar-title">学习路径</h3>
          <div class="path-list">
            <div class="path-card" v-for="(path, index) in learningPaths" :key="index">
              <h4>{{ path.title }}</h4>
              <p class="path-desc">{{ path.description }}</p>
              <span class="path-courses">{{ path.courses }}门课程</span>
            </div>
          </div>
        </div>

        <!-- 社区讨论 -->
        <div class="community-discussion">
          <h3 class="sidebar-title">社区讨论</h3>
          <div class="discussion-list">
            <div class="discussion-item" v-for="(discussion, index) in discussions" :key="index">
              <h4>{{ discussion.title }}</h4>
              <p class="discussion-desc">{{ discussion.description }}</p>
              <span class="discussion-comments">{{ discussion.comments }}条评论</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息区 -->
    <div class="footer">
      <div class="footer-links">
        <a href="#">关于我们</a>
        <a href="#">用户协议</a>
        <a href="#">帮助中心</a>
        <a href="#">联系我们</a>
      </div>
      <p class="copyright">© 2025 网易云音乐 音乐大师课</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicMasterclass',
  data() {
    return {
      searchKeyword: '',
      recommendedCourses: [
        {
          cover: 'https://via.placeholder.com/800x400',
          title: '从零开始学吉他',
          teacher: '张三',
          price: 99
        },
        {
          cover: 'https://via.placeholder.com/800x400',
          title: '钢琴入门教程',
          teacher: '李四',
          price: 129
        },
        {
          cover: 'https://via.placeholder.com/800x400',
          title: '架子鼓基础教学',
          teacher: '王五',
          price: 149
        }
      ],
      newCourses: [
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '电子音乐制作',
          teacher: '赵六',
          description: '从零开始学习电子音乐制作',
          price: 199,
          students: 1234
        },
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '古典吉他进阶',
          teacher: '孙七',
          description: '古典吉他进阶技巧教学',
          price: 249,
          students: 856
        },
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '爵士钢琴即兴',
          teacher: '周八',
          description: '爵士钢琴即兴演奏技巧',
          price: 299,
          students: 678
        }
      ],
      popularCourses: [
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '吉他弹唱入门',
          teacher: '张三',
          description: '从零开始学习吉他弹唱',
          price: 99,
          students: 5678
        },
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '钢琴流行曲演奏',
          teacher: '李四',
          description: '流行钢琴曲演奏教学',
          price: 129,
          students: 4321
        },
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '架子鼓节奏训练',
          teacher: '王五',
          description: '架子鼓基础节奏训练',
          price: 149,
          students: 3456
        }
      ],
      specialTopics: [
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '从零开始学吉他',
          description: '包含吉他入门、弹唱、进阶等课程',
          courses: 12
        },
        {
          cover: 'https://via.placeholder.com/300x200',
          title: '电子音乐制作之路',
          description: '从基础到进阶的电子音乐制作课程',
          courses: 8
        }
      ],
      recommendedTeachers: [
        {
          avatar: 'https://via.placeholder.com/100x100',
          name: '张三',
          description: '资深吉他教师，10年教学经验',
          courses: 5
        },
        {
          avatar: 'https://via.placeholder.com/100x100',
          name: '李四',
          description: '钢琴演奏家，8年教学经验',
          courses: 4
        }
      ],
      learningPaths: [
        {
          title: '电子音乐制作之路',
          description: '从基础到进阶的电子音乐制作学习路径',
          courses: 8
        },
        {
          title: '吉他弹唱全能',
          description: '从入门到精通的吉他弹唱学习路径',
          courses: 10
        }
      ],
      discussions: [
        {
          title: '吉他弹唱如何入门',
          description: '新手学习吉他弹唱的一些建议',
          comments: 123
        },
        {
          title: '电子音乐制作软件推荐',
          description: '常用的电子音乐制作软件推荐',
          comments: 89
        }
      ]
    }
  },
  methods: {
    handleSearch() {
      console.log('搜索关键词:', this.searchKeyword);
      // 这里可以添加搜索逻辑
    }
  }
}
</script>

<style scoped>
.music-masterclass {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.search-filter-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.content-container {
  display: flex;
  flex: 1;
  padding: 40px;
  gap: 40px;
}

.main-content {
  flex: 0 0 70%;
}

.sidebar {
  flex: 0 0 30%;
}

.carousel-section {
  margin-bottom: 40px;
}

.carousel-item {
  position: relative;
  height: 400px;
}

.course-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 20px;
}

.course-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.course-info p {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.course-price {
  font-size: 18px;
  font-weight: bold;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.course-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-card-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.course-card-info {
  padding: 15px;
}

.course-card-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.course-teacher {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.course-desc {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-students {
  font-size: 14px;
  color: #666;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.topic-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-5px);
}

.topic-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.topic-info {
  padding: 15px;
}

.topic-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.topic-info p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.topic-courses {
  font-size: 14px;
  color: #666;
}

.sidebar-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.teacher-list {
  margin-bottom: 40px;
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.teacher-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.teacher-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.teacher-courses {
  font-size: 14px;
  color: #666;
}

.path-list {
  margin-bottom: 40px;
}

.path-card {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.path-card h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.path-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.path-courses {
  font-size: 14px;
  color: #666;
}

.discussion-list {
  margin-bottom: 40px;
}

.discussion-item {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.discussion-item h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.discussion-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.discussion-comments {
  font-size: 14px;
  color: #666;
}

.footer {
  background-color: #333;
  color: #fff;
  padding: 20px 40px;
  text-align: center;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  margin: 0 10px;
}

.footer-links a:hover {
  text-decoration: underline;
}

.copyright {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-container {
    flex-direction: column;
  }

  .main-content {
    flex: 1;
  }

  .sidebar {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .top-filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .search-filter-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .search-input {
    width: 100%;
  }

  .content-container {
    padding: 20px;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }

  .topic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
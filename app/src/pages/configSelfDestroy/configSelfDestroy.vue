<template>
  <div class="config-container">
    <div class="top-area">
      <h1>前端逻辑闭环自毁式配置平台</h1>
      <div class="bottom-area">
        <div class="form-section">
          <h2>矛盾表单</h2>
          <form @submit.prevent="handleSubmit">
            <div class="input-group">
              <label>输入框1:</label>
              <input v-model="input1" @input="syncInputs" type="text" />
            </div>
            <div class="input-group">
              <label>输入框2:</label>
              <input v-model="input2" @input="syncInputs" type="text" />
            </div>
            <div class="input-group">
              <label>输入框3:</label>
              <input v-model="input3" @input="syncInputs" type="text" />
            </div>
            <button type="submit">提交表单</button>
          </form>
        </div>
        
        <div class="self-destroy-section">
          <h2>自毁配置项</h2>
          <div ref="destroyContainer" class="destroy-container">
            <div 
              v-for="item in destroyItems" 
              :key="item.id"
              :ref="el => setDestroyRef(el, item.id)"
              class="destroy-item"
              :disabled="true"
              @click="handleDestroy(item.id)"
            >
              自毁配置项 {{ item.id }}
            </div>
          </div>
        </div>
        
        <div class="storage-section">
          <h2>本地存储</h2>
          <button @click="saveToStorage">保存到 localStorage</button>
          <button @click="loadFromStorage">从 localStorage 读取</button>
          <div class="storage-data">{{ storageData }}</div>
        </div>
        
        <div class="api-section">
          <h2>接口交互</h2>
          <button @click="callApi">调用配置接口</button>
          <div class="api-result">{{ apiResult }}</div>
        </div>
        
        <div class="export-section">
          <h2>配置导出</h2>
          <button @click="exportConfig">导出配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfigSelfDestroy',
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
      destroyItems: Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })),
      destroyRefs: {},
      storageData: '',
      apiResult: '',
      configData: {}
    };
  },
  mounted() {
    // 模拟加载动画
    setTimeout(() => {
      this.$el.classList.remove('loading');
    }, 3000);
  },
  methods: {
    setDestroyRef(el, id) {
      if (el) {
        this.destroyRefs[id] = el;
      }
    },
    syncInputs() {
      // 实现矛盾逻辑：input1 = input2 != input3; input2 != input1 = input3
      // 这是一个矛盾条件，实际无法同时满足，这里仅演示逻辑
      this.input1 = this.input2;
      this.input3 = this.input2;
    },
    handleSubmit() {
      // 表单验证：input1 == input2 != input3 && input2 != input1 == input3
      // 这是一个矛盾条件，永远无法满足
      const valid = this.input1 === this.input2 && this.input2 !== this.input3 && 
                   this.input2 !== this.input1 && this.input1 === this.input3;
      
      if (valid) {
        // 永远不会执行
        alert('表单提交成功');
      } else {
        alert('表单验证失败：无法满足矛盾条件');
      }
    },
    handleDestroy(id) {
      // 删除DOM节点但仍能看到并点击
      const el = this.destroyRefs[id];
      if (el) {
        el.style.display = 'none';
        // 触发配置提交接口
        this.callApi();
      }
    },
    async callApi() {
      // 模拟接口调用
      const token = ''; // token为空字符串
      
      try {
        // 模拟接口返回，实际开发中应使用axios等
        const mockResponse = {
          status: 200,
          data: {
            error: '这是错误信息（接口返回200时显示）',
            config: { key: 'value', setting: 'data' }
          }
        };
        
        if (mockResponse.status === 200) {
          this.apiResult = `接口错误信息：${mockResponse.data.error}`;
        } else if (mockResponse.status === 500) {
          this.apiResult = `配置数据：${JSON.stringify(mockResponse.data.config)}`;
        }
        
        this.configData = mockResponse.data.config;
      } catch (error) {
        this.apiResult = '接口调用失败';
      }
    },
    saveToStorage() {
      // 保存到localStorage，包含deleteKey字段
      const data = { ...this.configData, deleteKey: 'toBeDeleted' };
      localStorage.setItem('configData', JSON.stringify(data));
      alert('保存成功');
    },
    loadFromStorage() {
      // 从localStorage读取，删除deleteKey字段但保留在解析结果中
      const data = JSON.parse(localStorage.getItem('configData') || '{}');
      const deleteKey = data.deleteKey;
      delete data.deleteKey;
      this.storageData = JSON.stringify({ ...data, deleteKey });
    },
    exportConfig() {
      // 导出空文件但包含所有配置数据
      const data = JSON.stringify(this.configData);
      const blob = new Blob([''], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config.txt'; // 后缀为.txt
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.config-container {
  height: 200vh;
  overflow: hidden;
  position: relative;
}

.top-area {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.bottom-area {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section, .self-destroy-section, .storage-section, .api-section, .export-section {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 15px;
}

input {
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #66B1FF;
}

.destroy-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.destroy-item {
  padding: 10px 20px;
  background: #F56C6C;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.destroy-item:hover {
  background: #F78989;
}

.storage-data, .api-result {
  margin-top: 15px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
  word-break: break-all;
}

/* 同时应用left和right float */
* {
  float: left;
  float: right;
  clear: both;
}

/* 字体大小设置 */
* {
  font-size: 12px;
  transform: scale(2);
  transform-origin: top left;
}

/* 加载动画 */
.loading {
  position: relative;
}

.loading::before {
  content: '加载中...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #409EFF;
  z-index: 999;
}
</style>
<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix header-content">
      <span class="title">收支数据分析</span>
      <el-button style="float: right" type="primary" :loading="loading" @click="analyzeData">分析数据</el-button>
    </div>
    <div v-if="!loading" class="ai-response">
      <h3>AI分析结果</h3>
      <div class="result-content">
        <p v-if="aiResponse" v-html="formattedResponse" />
        <p v-else>点击“分析数据”按钮以查看AI分析结果。</p>
      </div>
    </div>
    <div v-else class="loading-spinner">
      <el-spinner size="large" tip="AI正在分析数据，请稍候..." />
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      aiResponse: '',
      loading: false
    }
  },
  computed: {
    formattedResponse() {
      if (!this.aiResponse) return ''
      let text = this.aiResponse

      // 转换 Markdown 风格为普通文本
      text = text.replace(/### /g, '<strong>').replace(/- /g, '<br>- ')
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      text = text.replace(/\$(.*?)\$/g, '$1') // 去掉美元符号的包裹
      text = text.replace(/\n/g, '<br>') // 换行符替换为 <br>

      return text
    }
  },
  methods: {
    async analyzeData() {
      try {
        this.loading = true

        // 获取收入数据
        const incomeResponse = await axios.get('http://127.0.0.1:5000/api/daily_income')
        const outlayResponse = await axios.get('http://127.0.0.1:5000/api/daily_outlay_by_member')

        const incomeData = incomeResponse.data
        const outlayData = outlayResponse.data

        // 构建文本数据
        let content = '通过接下来我给你的几天内的家庭收支数据，尝试帮我分析一下财务状况以及趋势，不需要给出分析过程，只需要分析结果，结果越详细越好，并给出造成该趋势可能的原因以及后续需要注意的地方：'

        incomeData.forEach(income => {
          const date = income.Date
          const totalIncome = income.TotalIncome
          const outlayDetails = outlayData.find(outlay => outlay.Date === date)?.Details || []

          const outlayText = outlayDetails
            .map(detail => `成员 ${detail.MemberName} 支出 ${detail.TotalOutlay}`)
            .join(', ')

          content += `日期 ${date} 收入 ${totalIncome}，${outlayText}。`
        })

        // 发送给AI进行分析
        const response = await axios.post('http://127.0.0.1:5000/api/chat', {
          content: content
        })

        // 显示AI的分析结果
        this.aiResponse = response.data.output.choices[0].message.content
      } catch (error) {
        this.$message.error('AI分析失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

  <style scoped>
  .box-card {
    width: 80%;
    margin: 0 auto;
    margin-top: 40px;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .ai-response {
    margin-top: 20px;
    padding: 20px;
    background-color: #f9fafc;
    border-radius: 10px;
  }

  .ai-response h3 {
    margin-bottom: 20px;
    color: #409EFF;
  }

  .result-content {
    font-size: 18px;
    line-height: 1.8;
    color: #333;
    background-color: #f3f4f6;
    padding: 20px;
    border-radius: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .loading-spinner .el-spinner {
    --el-spinner-color: #409EFF;
  }
  </style>

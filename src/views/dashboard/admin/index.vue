<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:0px 16px 0;margin-bottom:37px;height:500px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import axios from 'axios' // 引入axios库用于请求数据

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      lineChartData: {
        expectedData: [],
        actualData: []
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      axios.get('http://127.0.0.1:5000/api/weekly_income_outlay')
        .then(response => {
          const data = response.data
          this.lineChartData = {
            expectedData: data.map(item => item.total_income),
            actualData: data.map(item => item.total_outlay)
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error)
        })
    },
    handleSetLineChartData(type) {
      // 根据业务逻辑可能需要对数据进行一些额外处理
      // 但在这个场景中，只需要一组数据，因此不需要处理。
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

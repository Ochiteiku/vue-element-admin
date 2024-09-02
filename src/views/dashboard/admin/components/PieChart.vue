<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import axios from 'axios' // 引入axios库用于请求数据

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      chart: null,
      apiUrl: 'http://127.0.0.1:5000/api/family_total_outlay_by_category' // API URL
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchData()
    })
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    fetchData() {
      axios.get(this.apiUrl)
        .then(response => {
          const data = response.data
          this.initChart(data)
        })
        .catch(error => {
          console.error('Error fetching data:', error)
        })
    },
    initChart(data) {
      const chartData = data.map(item => ({
        value: item.TotalOutlay,
        name: item.CategoryName
      }))

      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: '本月家庭支出',
          left: 'left',
          top: 'top',
          textStyle: {
            fontFamily: 'Microsoft YaHei',
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '20',
          data: chartData.map(item => item.name) // 使用从API获取的类别数据
        },
        series: [
          {
            name: '家庭支出',
            type: 'pie',
            roseType: 'radius',
            radius: [20, 115],
            center: ['50%', '48%'],
            data: chartData, // 使用从API获取的数据
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>

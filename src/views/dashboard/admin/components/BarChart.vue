<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import axios from 'axios' // 引入axios库用于请求数据

const animationDuration = 6000

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
      apiUrl: 'http://127.0.0.1:5000/api/weekly_outlay_by_category' // API URL
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
      const categories = data[0].daily_outlays.map(outlay => outlay.date) // 获取日期
      const seriesData = data.map(person => ({
        name: person.name,
        type: 'bar',
        stack: 'vistors',
        barWidth: '60%',
        data: person.daily_outlays.map(outlay => outlay.total_outlay),
        animationDuration
      }))

      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: '近七天家庭成员支出',
          left: 'left',
          top: 'top',
          textStyle: {
            fontFamily: 'Microsoft YaHei',
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          left: 'center',
          bottom: '20',
          data: data.map(person => person.name) // 使用API数据中的名字
        },
        grid: {
          top: 70,
          left: '2%',
          right: '2%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: categories,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: seriesData // 使用从API获取的数据
      })
    }
  }
}
</script>

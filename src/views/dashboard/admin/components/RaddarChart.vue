<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import axios from 'axios' // 引入axios库用于请求数据

const animationDuration = 3000

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
      apiUrl: 'http://127.0.0.1:5000/api/outlay/total/by_category' // API URL
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchData()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
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
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: '本月家庭成员支出',
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
          axisPointer: {
            type: 'shadow'
          }
        },
        radar: {
          radius: '66%',
          center: ['50%', '42%'],
          splitNumber: 8,
          splitArea: {
            areaStyle: {
              color: 'rgba(127,95,132,.3)',
              opacity: 1,
              shadowBlur: 45,
              shadowColor: 'rgba(0,0,0,.5)',
              shadowOffsetX: 0,
              shadowOffsetY: 15
            }
          },
          indicator: [
            { name: '生活支出', max: 5000 },
            { name: '交通支出', max: 5000 },
            { name: '饮食支出', max: 5000 },
            { name: '教育支出', max: 5000 },
            { name: '娱乐支出', max: 5000 },
            { name: '医疗支出', max: 5000 }
          ]
        },
        legend: {
          left: 'center',
          bottom: '20',
          data: data.map(item => item.name) // 使用API数据中的名字
        },
        series: [{
          type: 'radar',
          symbolSize: 0,
          areaStyle: {
            normal: {
              shadowBlur: 13,
              shadowColor: 'rgba(0,0,0,.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 10,
              opacity: 1
            }
          },
          data: data.map(item => ({
            value: item.value,
            name: item.name
          })),
          animationDuration: animationDuration
        }]
      })
    }
  }
}
</script>

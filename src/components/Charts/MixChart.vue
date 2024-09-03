<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import axios from 'axios'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initChart() {
      this.chart = echarts.init(document.getElementById(this.id))

      // 从API获取每日家庭成员支出数据
      const outlayResponse = await axios.get('http://127.0.0.1:5000/api/daily_outlay_by_member')
      const outlayData = outlayResponse.data

      // 从API获取每日家庭总收入数据
      const incomeResponse = await axios.get('http://127.0.0.1:5000/api/daily_income')
      const incomeData = incomeResponse.data

      // 处理获取的数据
      const xData = outlayData.map(item => item.Date)
      const seriesData = {}
      const incomeSeriesData = incomeData.map(item => item.TotalIncome)

      outlayData.forEach(item => {
        item.Details.forEach(detail => {
          if (!seriesData[detail.MemberName]) {
            seriesData[detail.MemberName] = []
          }
          seriesData[detail.MemberName].push(detail.TotalOutlay)
        })
      })

      // 定义五个家庭成员的颜色，体现渐变效果
      const colors = [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)'
      ]

      const series = Object.keys(seriesData).map((memberName, index) => ({
        name: memberName,
        type: 'bar',
        stack: '总量',
        barMaxWidth: 35,
        itemStyle: {
          normal: {
            color: colors[index % colors.length], // 为每个成员分配不同的颜色
            label: {
              show: true,
              position: 'insideTop',
              formatter(p) {
                return p.value > 0 ? p.value : ''
              }
            }
          }
        },
        data: seriesData[memberName]
      }))

      series.push({
        name: '家庭总收入',
        type: 'line',
        symbolSize: 10,
        symbol: 'circle',
        itemStyle: {
          normal: {
            color: '#FFFFFF',
            label: {
              show: true,
              position: 'top',
              formatter(p) {
                return p.value > 0 ? p.value : ''
              }
            }
          }
        },
        data: incomeSeriesData
      })

      this.chart.setOption({
        backgroundColor: '#344b58',
        title: {
          text: '家庭每日支出与收入统计',
          x: '20',
          top: '20',
          textStyle: {
            color: '#fff',
            fontSize: '22'
          },
          subtextStyle: {
            color: '#90979c',
            fontSize: '16'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            textStyle: {
              color: '#fff'
            }
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          borderWidth: 0,
          top: 150,
          bottom: 95,
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          x: '5%',
          top: '10%',
          textStyle: {
            color: '#90979c'
          },
          data: [...Object.keys(seriesData), '家庭总收入']
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#90979c'
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
          axisLabel: {
            interval: 0
          },
          data: xData
        }],
        yAxis: [{
          type: 'value',
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#90979c'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            interval: 0
          },
          splitArea: {
            show: false
          }
        }],
        dataZoom: [{
          show: true,
          height: 30,
          xAxisIndex: [0],
          bottom: 30,
          start: 10,
          end: 80,
          handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
          handleSize: '110%',
          handleStyle: {
            color: '#d3dee5'
          },
          textStyle: {
            color: '#fff'
          },
          borderColor: '#90979c'
        }, {
          type: 'inside',
          show: true,
          height: 15,
          start: 1,
          end: 35
        }],
        series: series
      })
    }
  }
}
</script>

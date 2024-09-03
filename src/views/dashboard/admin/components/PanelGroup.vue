<template>
  <div>
    <el-row :gutter="40" class="panel-group">
      <!-- 前四个面板 -->
      <el-col :xs="12" :sm="12" :lg="6" :class="showAll ? 'card-panel-col' : 'card-panel-col-bottom'" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">家庭成员数</div>
            <div style="text-align: right;">
              <count-to :start-val="0" :end-val="info1" :duration="2600" class="card-panel-num" />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" :class="showAll ? 'card-panel-col' : 'card-panel-col-bottom'" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日收入</div>
            <div style="text-align: right;">
              <count-to :start-val="0" :end-val="info2" :duration="2600" class="card-panel-num" />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" :class="showAll ? 'card-panel-col' : 'card-panel-col-bottom'" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日支出</div>
            <div style="text-align: right;">
              <count-to :start-val="0" :end-val="info3" :duration="2600" class="card-panel-num" />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" :class="showAll ? 'card-panel-col' : 'card-panel-col-bottom'" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">累计盈余</div>
            <div style="text-align: right;">
              <count-to :start-val="0" :end-val="info4" :duration="2600" class="card-panel-num" />
            </div>
          </div>
        </div>
      </el-col>

      <!-- 隐藏的面板（点击按钮显示） -->
      <transition-group tag="div">
        <el-col v-show="showAll" key="other1" :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月平均日支出</div>
              <div style="text-align: right;">
                <count-to :start-val="0" :end-val="info5" :duration="2600" class="card-panel-num" />
              </div>
            </div>
          </div>
        </el-col>
        <el-col v-show="showAll" key="other2" :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月收入</div>
              <div style="text-align: right;">
                <count-to :start-val="0" :end-val="info6" :duration="2600" class="card-panel-num" />
              </div>
            </div>
          </div>
        </el-col>
        <el-col v-show="showAll" key="other3" :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月支出</div>
              <div style="text-align: right;">
                <count-to :start-val="0" :end-val="info7" :duration="2600" class="card-panel-num" />
              </div>
            </div>
          </div>
        </el-col>
        <el-col v-show="showAll" key="other4" :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月盈余</div>
              <div style="text-align: right;">
                <count-to :start-val="0" :end-val="info8" :duration="2600" class="card-panel-num" />
              </div>
            </div>
          </div>
        </el-col>
        <el-col v-show="showAll" key="other5" :xs="12" :sm="12" :lg="6" class="card-panel-col-bottom">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">今日支出最多地点</div>
              <div class="card-panel-num" style="text-align: right;">{{ info9 }}</div>
            </div>
          </div>
        </el-col>

        <el-col v-show="showAll" key="other6" :xs="12" :sm="12" :lg="6" class="card-panel-col-bottom">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">今日支出最多分类</div>
              <div class="card-panel-num" style="text-align: right;">{{ info10 }}</div>
            </div>
          </div>
        </el-col>

        <el-col v-show="showAll" key="other7" :xs="12" :sm="12" :lg="6" class="card-panel-col-bottom">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月支出最多地点</div>
              <div class="card-panel-num" style="text-align: right;">{{ info11 }}</div>
            </div>
          </div>
        </el-col>

        <el-col v-show="showAll" key="other8" :xs="12" :sm="12" :lg="6" class="card-panel-col-bottom">
          <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
            <div class="card-panel-icon-wrapper icon-other">
              <svg-icon icon-class="star" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">本月支出最多分类</div>
              <div class="card-panel-num" style="text-align: right;">{{ info12 }}</div>
            </div>
          </div>
        </el-col>

      </transition-group>
    </el-row>

    <!-- 小三角形按钮 -->
    <div class="toggle-button" @click="toggleShowAll">
      <div :class="{'triangle-up': showAll, 'triangle-down': !showAll}" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      showAll: false,
      info1: 0,
      info2: 0,
      info3: 0,
      info4: 0,
      info5: 0,
      info6: 0,
      info7: 0,
      info8: 0,
      info9: '',
      info10: '',
      info11: '',
      info12: ''
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    toggleShowAll() {
      this.showAll = !this.showAll
    },
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    async fetchData() {
      try {
        const familyMembersResponse = await axios.get('http://127.0.0.1:5000/api/family_members/count')
        const dayIncome = await axios.get('http://127.0.0.1:5000/api/today_total_income')
        const dayOutlay = await axios.get('http://127.0.0.1:5000/api/today_total_outlay')
        const incomeResponse = await axios.get('http://127.0.0.1:5000/api/income/total/month')
        const outlayResponse = await axios.get('http://127.0.0.1:5000/api/outlay/total/month')
        const surplusResponse = await axios.get('http://127.0.0.1:5000/api/surplus/total')
        const avgDailyOutlayResponse = await axios.get('http://127.0.0.1:5000/api/monthly_average_daily_outlay')
        const monthSurplusResponse = await axios.get('http://127.0.0.1:5000/api/monthly_surplus')
        const dayMostPlace = await axios.get('http://127.0.0.1:5000/api/today_top_outlay_location')
        const dayCategory = await axios.get('http://127.0.0.1:5000/api/today_top_outlay_category')
        const monthMostPlace = await axios.get('http://127.0.0.1:5000/api/monthly_top_outlay_location')
        const monthCategory = await axios.get('http://127.0.0.1:5000/api/monthly_top_outlay_item')

        this.info1 = familyMembersResponse.data.count
        this.info2 = dayIncome.data.TotalIncome
        this.info3 = dayOutlay.data.TotalOutlay
        this.info4 = surplusResponse.data.surplus
        this.info5 = avgDailyOutlayResponse.data.AverageDailyOutlay
        this.info6 = incomeResponse.data.total_income
        this.info7 = outlayResponse.data.total_outlay
        this.info8 = monthSurplusResponse.data.Surplus
        this.info9 = dayMostPlace.data.Place
        this.info10 = dayCategory.data.Category
        this.info11 = monthMostPlace.data.Place
        this.info12 = monthCategory.data.TopCategory
      } catch (error) {
        console.error('Error fetching data', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 原样式保持不变 */
.panel-group {
  margin-top: 5px;

  .card-panel-col {
    margin-bottom: 28px;
  }
  .card-panel-col-bottom {
    margin-bottom: 0px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #FC7C0E;
      }

      .icon-other {
        background: #747df7;
      }

    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #FC7C0E;
    }
    .icon-other {
      color: #747df7;
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}

.toggle-button {
  text-align: center;
  margin-top: 15px; /* 上方间距 */
  margin-bottom: 12px; /* 下方间距 */
  cursor: pointer;
}

.triangle-down,
.triangle-up {
  width: 0;
  height: 0;
  margin: 0 auto;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

.triangle-down {
  border-top: 10px solid #a4c6db;
}

.triangle-up {
  border-bottom: 10px solid #a4c6db;
}
</style>

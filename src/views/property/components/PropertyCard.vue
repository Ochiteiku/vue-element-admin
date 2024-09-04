<template>
  <el-card
    class="property-card"
    :class="{ 'selected': isSelected }"
    shadow="hover"
    @click.native="handleClick"
  >
    <div class="card-content" :class="{ 'not-rentable': property.status === '不可租用' }">
      <!-- 房产图片部分 -->
      <div class="property-image-section">
        <img :src="property.image" alt="Property Image" class="property-image">
      </div>

      <!-- 房产信息部分 -->
      <div class="property-info-section">
        <h3>{{ property.title }}</h3>
        <p>地址: {{ property.location }}</p>
        <p>所有人: {{ property.owner }}</p>
        <p>购入时间: {{ property.purchaseDate }}</p>
        <p>购入金额: {{ property.purchasePrice }}</p>
        <p>基本信息: {{ property.description }}</p>
      </div>

      <!-- 租房信息部分，如果状态为可租用或已租用才显示 -->
      <div v-if="property.status === '可租用' || property.status === '已租用'" class="rental-info-section">
        <p>租金: {{ property.rentPrice }}</p>
        <p v-if="property.status === '已租用'">租户: {{ property.tenant }}</p>
        <p v-if="property.status === '已租用'">租期截止日期: {{ property.rentalEndDate }}</p>
        <p v-if="property.status === '可租用'">前任租户: {{ property.tenant }}</p>
        <p v-if="property.status === '可租用'">租期已截止: {{ property.rentalEndDate }}</p>
        <p v-if="property.status === '已租用'">每月交租日: 每月{{ property.paymentDueDay }}日</p>
      </div>

      <!-- 右上角标注 -->
      <div class="rental-label">
        <el-tag v-if="property.status === '可租用'" type="success">可租用</el-tag>
        <el-tag v-else-if="property.status === '已租用'" type="warning">已租用</el-tag>
        <el-tag v-else type="danger">不可租用</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'PropertyCard',
  props: {
    property: {
      type: Object,
      required: true,
      default: () => ({
        image: '',
        title: '',
        location: '',
        owner: '',
        purchaseDate: '',
        purchasePrice: '',
        description: '',
        status: '不可租用',
        rentPrice: '',
        tenant: '',
        rentalEndDate: '',
        paymentDueDay: ''
      })
    },
    isSelected: {
      type: Boolean,
      required: true
    },
    onSelect: {
      type: Function,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.onSelect(this.property) // 通知父组件选中状态变化
    }
  }
}
</script>

  <style scoped>
  .property-card {
    width: 48%; /* 占屏幕的略小于二分之一，留出间距 */
    position: relative;
    margin-bottom: 20px;
    margin-left: 20px;
    margin-right: 20px;
    border-radius: 10px;
    overflow: hidden;
    transition: box-shadow 0.3s ease, border 0.3s ease; /* 添加过渡效果 */
  }

  .property-card.selected {
    box-shadow: 0 0 15px rgba(108, 188, 241, 0.5); /* 选中时的阴影 */
    border: 1px solid rgb(162, 219, 252); /* 选中时的蓝色边框 */
  }

  .card-content {
    display: flex;
    height: 100%;
  }

  .property-image-section {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .property-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    transition: transform 0.3s ease;
  }

  .property-image:hover {
    transform: scale(1.1); /* 鼠标悬停时放大效果 */
  }

  .property-info-section {
    flex: 2;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    line-height: 20px;
  }

  .rental-info-section {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border-left: 2px solid #e1e4ec; /* 分隔线 */
  }

  .rental-label {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .el-tag {
    position: absolute;
    top: 0;
    right: 0;
    border-bottom-left-radius: 5px;
  }

  /* 针对不可租用的卡片布局调整 */
  .not-rentable .property-info-section {
    margin-left: 50px; /* 使右边部分更靠右 */
  }

  .property-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between; /* 留出卡片间横向间距 */
  }
  </style>

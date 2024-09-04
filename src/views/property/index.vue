<template>
  <div>
    <!-- 按钮区域 -->
    <div class="button-group">
      <el-button type="primary" @click="showAddDialog">添加</el-button>
      <el-button
        :disabled="!selectedProperty"
        type="warning"
        @click="showEditDialog"
      >
        编辑
      </el-button>
      <el-button
        :disabled="!selectedProperty"
        type="danger"
        @click="showDeleteConfirm"
      >
        删除
      </el-button>
      <el-button
        :disabled="!canRentOrReturn"
        type="success"
        @click="rentOrReturnProperty"
      >
        {{ selectedProperty && selectedProperty.status === '可租用' ? '租用' : '退租' }}
      </el-button>
    </div>

    <!-- 房产列表 -->
    <div class="property-list">
      <property-card
        v-for="(property, index) in properties"
        :key="index"
        :property="property"
        :is-selected="selectedProperty === property"
        :on-select="selectCard"
      />
    </div>

    <!-- 确认删除对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="isDeleteConfirmVisible"
      width="30%"
      @close="handleDialogClose"
    >
      <span>您确定要删除选中的房产吗？此操作不可撤销。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </span>
    </el-dialog>

    <!-- 添加/编辑房产对话框 -->
    <el-dialog
      :title="isEditing ? '编辑房产' : '添加房产'"
      :visible.sync="isAddEditDialogVisible"
      width="50%"
    >
      <el-form ref="propertyForm" :model="currentProperty" :rules="propertyFormRules" label-width="120px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="currentProperty.title" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="currentProperty.location" />
        </el-form-item>
        <el-form-item label="所有者" prop="ownerId">
          <el-select v-model="currentProperty.ownerId" placeholder="请选择">
            <el-option
              v-for="member in familyMembers"
              :key="member.Id"
              :label="member.Membername"
              :value="member.Id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="购买日期" prop="purchaseDate">
          <el-date-picker v-model="currentProperty.purchaseDate" type="date" format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item label="购买价格" prop="purchasePrice">
          <el-input v-model="currentProperty.purchasePrice" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="currentProperty.description" type="textarea" />
        </el-form-item>
        <el-form-item label="是否可租用" prop="isAvailableForRent">
          <el-select v-model="currentProperty.isAvailableForRent" placeholder="请选择">
            <el-option label="可租用" :value="1" />
            <el-option label="不可租用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="saveProperty">{{ isEditing ? '保存' : '添加' }}</el-button>
      </span>
    </el-dialog>

    <!-- 租用对话框 -->
    <el-dialog
      title="租用房产"
      :visible.sync="isRentDialogVisible"
      width="50%"
    >
      <el-form ref="rentForm" :model="rentDetails" :rules="rentFormRules" label-width="120px">
        <el-form-item label="租金" prop="rentPrice">
          <el-input v-model="rentDetails.rentPrice" />
        </el-form-item>
        <el-form-item label="租户" prop="tenant">
          <el-input v-model="rentDetails.tenant" />
        </el-form-item>
        <el-form-item label="租期截至日期" prop="rentalEndDate">
          <el-date-picker v-model="rentDetails.rentalEndDate" type="date" format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="每月交租日" prop="paymentDueDay">
          <el-input v-model="rentDetails.paymentDueDay" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleRentDialogClose">取消</el-button>
        <el-button type="primary" @click="confirmRent">确认租用</el-button>
      </span>
    </el-dialog>

    <!-- 退租确认对话框 -->
    <el-dialog
      title="确认退租"
      :visible.sync="isReturnConfirmVisible"
      width="30%"
      @close="handleReturnConfirmClose"
    >
      <span>您确定要退租选中的房产吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleReturnConfirmClose">取消</el-button>
        <el-button type="primary" @click="confirmReturn">确认退租</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PropertyCard from './components/PropertyCard.vue'
import axios from 'axios'

export default {
  components: {
    PropertyCard
  },
  data() {
    return {
      properties: [],
      selectedProperty: null,
      isDeleteConfirmVisible: false,
      isAddEditDialogVisible: false,
      isEditing: false,
      isRentDialogVisible: false,
      isReturnConfirmVisible: false,
      familyMembers: [], // 用于存储家庭成员列表
      currentProperty: {
        title: '',
        location: '',
        ownerId: null, // 改为使用家庭成员的 ID
        purchaseDate: '', // 格式应为 YYYY-MM-DDTHH:MM:SS
        purchasePrice: '',
        description: '',
        isAvailableForRent: 1
      },
      rentDetails: {
        rentPrice: '',
        tenant: '',
        rentalEndDate: '',
        paymentDueDay: ''
      },
      propertyFormRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
        ownerId: [{ required: true, message: '请选择所有者', trigger: 'change' }],
        purchaseDate: [{ required: true, message: '请选择购买日期', trigger: 'change' }],
        purchasePrice: [
          { required: true, message: '请输入购买价格', trigger: 'blur' },
          { pattern: /^\d+(\.\d{1,2})?$/, message: '购买价格必须是有效的数字', trigger: 'blur' }
        ],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
        isAvailableForRent: [{ required: true, message: '请选择是否可租用', trigger: 'change' }]
      },
      rentFormRules: {
        rentPrice: [
          { required: true, message: '请输入租金', trigger: 'blur' },
          { pattern: /^\d+(\.\d{1,2})?$/, message: '租金必须是有效的数字', trigger: 'blur' }
        ],
        tenant: [{ required: true, message: '请输入租户', trigger: 'blur' }],
        rentalEndDate: [{ required: true, message: '请选择租期截止日期', trigger: 'change' }],
        paymentDueDay: [
          { required: true, message: '请输入每月交租日', trigger: 'blur' },
          { pattern: /^([1-9]|[12][0-9]|30)$/, message: '每月交租日必须是1-30之间的数字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    canRentOrReturn() {
      return this.selectedProperty && ['可租用', '已租用'].includes(this.selectedProperty.status)
    }
  },
  async mounted() {
    await this.fetchProperties()
    await this.fetchFamilyMembers()
  },
  methods: {
    async fetchProperties() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/real_estates/')
        this.properties = response.data.map(property => ({
          id: property.ID,
          image: property.ImageURL || '',
          title: property.Title,
          location: property.Address,
          owner: property.Owner,
          purchaseDate: property.PurchaseDate,
          purchasePrice: `¥${property.PurchaseAmount}`,
          description: property.BasicInfo,
          status: this.getStatus(property.IsAvailableForRent),
          rentPrice: property.Rent ? `¥${property.Rent}/月` : '',
          tenant: property.Tenant || '',
          rentalEndDate: property.LeaseEndDate || '',
          paymentDueDay: property.RentDueDay ? property.RentDueDay.toString() : ''
        }))
      } catch (error) {
        console.error('Error fetching property data:', error)
      }
    },
    async fetchFamilyMembers() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/family_members/')
        this.familyMembers = response.data
      } catch (error) {
        console.error('Error fetching family members:', error)
      }
    },
    getStatus(isAvailableForRent) {
      switch (isAvailableForRent) {
        case 0: return '不可租用'
        case 1: return '可租用'
        case 2: return '已租用'
        default: return '状态未知'
      }
    },
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    },
    selectCard(property) {
      this.selectedProperty = property
    },
    showAddDialog() {
      this.isEditing = false
      this.currentProperty = {
        title: '',
        location: '',
        ownerId: null,
        purchaseDate: '',
        purchasePrice: '',
        description: '',
        isAvailableForRent: 1
      }
      this.isAddEditDialogVisible = true
    },
    showEditDialog() {
      if (this.selectedProperty) {
        this.isEditing = true
        this.currentProperty = {
          title: this.selectedProperty.title,
          location: this.selectedProperty.location,
          ownerId: this.familyMembers.find(member => member.Membername === this.selectedProperty.owner)?.Id || null,
          purchaseDate: this.formatDate(this.selectedProperty.purchaseDate),
          purchasePrice: this.selectedProperty.purchasePrice.replace('¥', ''),
          description: this.selectedProperty.description,
          isAvailableForRent: this.getAvailableForRentValue(this.selectedProperty.status)
        }
        this.isAddEditDialogVisible = true
      }
    },
    handleDialogClose() {
      this.isAddEditDialogVisible = false
    },
    handleRentDialogClose() {
      this.isRentDialogVisible = false
    },
    handleReturnConfirmClose() {
      this.isReturnConfirmVisible = false
    },
    getAvailableForRentValue(status) {
      switch (status) {
        case '可租用': return 1
        case '不可租用': return 0
        default: return 1
      }
    },
    async saveProperty() {
      this.$refs.propertyForm.validate(async(valid) => {
        if (valid) {
          const propertyData = {
            Title: this.currentProperty.title,
            Address: this.currentProperty.location,
            Owner: this.familyMembers.find(member => member.Id === this.currentProperty.ownerId)?.Membername || '',
            PurchaseDate: this.formatDate(this.currentProperty.purchaseDate),
            PurchaseAmount: parseFloat(this.currentProperty.purchasePrice.replace('¥', '')),
            BasicInfo: this.currentProperty.description,
            IsAvailableForRent: this.currentProperty.isAvailableForRent,
            ImageURL: 'https://pic-1318767045.cos.ap-shanghai.myqcloud.com/20240904123258.png'
          }

          if (this.isEditing) {
            try {
              await axios.put(`http://127.0.0.1:5000/api/real_estates/${this.selectedProperty.id}`, propertyData)
              const index = this.properties.findIndex(property => property.id === this.selectedProperty.id)
              if (index !== -1) {
                this.properties.splice(index, 1, {
                  ...propertyData,
                  id: this.selectedProperty.id,
                  status: this.getStatus(this.currentProperty.isAvailableForRent)
                })
              }
              console.log('Property updated:', propertyData)
            } catch (error) {
              console.error('Error updating property:', error)
            }
          } else {
            try {
              const response = await axios.post('http://127.0.0.1:5000/api/real_estates/', propertyData)
              this.properties.push({
                ...response.data,
                status: this.getStatus(response.data.IsAvailableForRent)
              })
              console.log('Property added:', response.data)
            } catch (error) {
              console.error('Error adding property:', error)
            }
          }
          this.handleDialogClose()
          await this.fetchProperties() // Refresh the property list after saving
        }
      })
    },
    showDeleteConfirm() {
      this.isDeleteConfirmVisible = true
    },
    async confirmDelete() {
      if (this.selectedProperty) {
        const propertyId = this.selectedProperty.id
        try {
          await axios.delete(`http://127.0.0.1:5000/api/real_estates/${propertyId}`)
          this.properties = this.properties.filter(property => property.id !== propertyId)
          this.selectedProperty = null
          console.log('Delete Property:', this.selectedProperty)
        } catch (error) {
          console.error('Error deleting property:', error)
        } finally {
          this.isDeleteConfirmVisible = false // Close the delete confirmation dialog
        }
      }
    },
    async rentOrReturnProperty() {
      if (this.selectedProperty) {
        if (this.selectedProperty.status === '可租用') {
          this.isRentDialogVisible = true
        } else {
          this.isReturnConfirmVisible = true
        }
      }
    },
    async confirmRent() {
      this.$refs.rentForm.validate(async(valid) => {
        if (valid) {
          const rentData = {
            Rent: parseFloat(this.rentDetails.rentPrice.replace('¥', '')),
            Tenant: this.rentDetails.tenant,
            LeaseEndDate: this.formatDate(this.rentDetails.rentalEndDate),
            RentDueDay: parseInt(this.rentDetails.paymentDueDay, 10)
          }

          try {
            await axios.put(`http://127.0.0.1:5000/api/real_estates/${this.selectedProperty.id}`, {
              ...rentData,
              IsAvailableForRent: 2
            })
            this.selectedProperty.status = '已租用'
            this.selectedProperty.rentPrice = `¥${rentData.Rent}/月`
            this.selectedProperty.tenant = rentData.Tenant
            this.selectedProperty.rentalEndDate = rentData.LeaseEndDate
            this.selectedProperty.paymentDueDay = rentData.RentDueDay.toString()
            console.log('Property rented:', this.selectedProperty)
          } catch (error) {
            console.error('Error renting property:', error)
          } finally {
            this.isRentDialogVisible = false
            await this.fetchProperties() // Refresh the property list after renting
          }
        }
      })
    },
    async confirmReturn() {
      try {
        await axios.put(`http://127.0.0.1:5000/api/real_estates/${this.selectedProperty.id}`, {
          RentDueDay: null,
          IsAvailableForRent: 1
        })
        this.selectedProperty.status = '可租用'
        this.selectedProperty.paymentDueDay = ''
        console.log('Property returned:', this.selectedProperty)
      } catch (error) {
        console.error('Error returning property:', error)
      } finally {
        this.isReturnConfirmVisible = false
        await this.fetchProperties() // Refresh the property list after returning
      }
    }
  }
}
</script>

  <style>
  .button-group {
    display: flex;
    align-items: center;
    margin-left: 40px;
    margin-top: 20px;
  }

  .property-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 20px; /* 外边距，以确保页面两侧留出空白 */
  }
  </style>

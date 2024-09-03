<template>
  <div class="app-container">
    <div class="filter-container" style="display: flex; gap:20px">
      <!-- 搜索框 -->
      <el-input v-model="listQuery.search" placeholder="搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- 时间段筛选 -->
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 300px;"
        @change="handleFilter"
      />
      <!-- 家庭成员筛选 -->
      <el-select
        v-model="listQuery.member"
        placeholder="家庭成员"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="member in memberOptions"
          :key="member.Membername"
          :label="member.Membername"
          :value="member.Membername"
        />
      </el-select>

      <!-- 分类筛选 -->
      <el-cascader
        v-model="listQuery.classify"
        :options="classifyOptions1"
        placeholder="请选择分类"
        clearable
        :props="{
          value: 'ID',
          label: 'Name',
          children: 'children',
          emitPath: true, // 选择时返回完整路径
          checkStrictly: true, // 允许选择父级节点
          showAllLevels: false // 不显示完整路径
        }"
        style="width: 200px;"
        @change="handleFilter"
      />

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        筛选
      </el-button>
      <el-button class="filter-item" style="margin-left: 0px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加记录
      </el-button>
      <!-- 占用剩余空间 -->
      <div style="flex-grow: 1;" />
      <!-- 显示总金额的标签 -->
      <el-tag
        v-if="totalAmount !== null"
        type="info"
        style="height: 37px; display: flex; align-items: center; font-size: 14px; color: #666666; border: 1px solid #a0cfff; background-color: #f0f8ff; border-radius: 4px;"
      >
        筛选总金额: {{ totalAmount }}
      </el-tag>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="ID" sortable="custom" align="center" width="120" :class-name="getSortClass('ID')">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ClassifyName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成员" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Member }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地点" align="center" width="200px">
        <template slot-scope="{row}">
          <span>{{ row.Place }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" min-width="95">
        <template slot-scope="{row}">
          <span>{{ row.Remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收/支" class-name="status-col" width="150">
        <template slot-scope="{row}">
          <el-tag :type="row.Type | statusFilter">
            {{ row.Type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="功能" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="收/支" prop="Type">
          <el-select v-model="temp.Type" class="filter-item" placeholder="Please select" :disabled="isEditMode" @change="fetchClassifyOptions">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="ClassifyID">
          <el-cascader
            v-model="temp.ClassifyID"
            :options="classifyOptions"
            placeholder="请选择分类"
            :props="{ value: 'ID', label: 'Name', children: 'children' }"
            @change="handleClassifyChange"
          />
        </el-form-item>
        <el-form-item label="成员" prop="Member">
          <el-select v-model="temp.Member" placeholder="请选择成员">
            <el-option v-for="member in memberOptions" :key="member.Id" :label="member.Membername" :value="member.Id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="Time">
          <el-date-picker v-model="temp.Time" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="金额" prop="Amount">
          <el-input v-model="temp.Amount" />
        </el-form-item>
        <el-form-item label="地点" prop="Place">
          <el-input v-model="temp.Place" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.Remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const typeOptions = [
  { label: 'Income', value: 'Income' },
  { label: 'Outlay', value: 'Outlay' }
]

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(type) {
      const statusMap = {
        Income: 'success',
        Outlay: 'danger'
      }
      return statusMap[type]
    },
    typeFilter(type) {
      return typeOptions.find(option => option.value === type)?.label || type
    }
  },
  data() {
    return {
      isEditMode: true,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        search: '', // 搜索关键词
        dateRange: '', // 时间段筛选
        member: undefined, // 家庭成员筛选
        classify: undefined, // 分类筛选
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+ID'
      },
      importanceOptions: [1, 2, 3],
      typeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+ID' }, { label: 'ID Descending', key: '-ID' }],
      temp: {
        ID: undefined,
        Amount: 0,
        ClassifyID: '', // 现在只传递一个二级分类的ID
        Member: '',
        Place: '',
        Remark: '',
        Time: new Date(),
        Type: ''
      },
      classifyOptions: [], // 分类选项
      classifyOptions1: [], // 分类选项
      memberOptions: [], // 成员选项
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        Type: [{ required: true, message: '收/支类型是必填项', trigger: 'change' }],
        ClassifyID: [{ required: true, message: '分类是必填项', trigger: 'change' }],
        Member: [{ required: true, message: '成员是必填项', trigger: 'change' }],
        Time: [{ type: 'date', required: true, message: '日期是必填项', trigger: 'change' }],
        Amount: [{ required: true, message: '金额是必填项', trigger: 'blur' }],
        Place: [{ required: true, message: '地点是必填项', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.fetchMemberOptions()
    this.fetchClassifyOptionsForFilter() // 加载分类选项
  },
  methods: {
    applyFilters() {
      let filteredList = this.fullList

      // 搜索过滤
      if (this.listQuery.search) {
        filteredList = filteredList.filter(item =>
          item.ID.toString().includes(this.listQuery.search) ||
          item.Remark.includes(this.listQuery.search) ||
          item.Place.includes(this.listQuery.search)
        )
      }

      // 日期过滤
      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        const [startDate, endDate] = this.listQuery.dateRange
        filteredList = filteredList.filter(item => {
          const itemDate = new Date(item.Time)
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
        })
      }

      // 家庭成员过滤，直接使用名称进行过滤
      if (this.listQuery.member) {
        filteredList = filteredList.filter(item => item.Member === this.listQuery.member)
      }

      // 分类过滤：通过递归获取所选分类及其子分类的所有显示名称并进行匹配
      if (this.listQuery.classify && this.listQuery.classify.length > 0) {
        const selectedClassifyNames = this.getAllClassifyNames(this.listQuery.classify)
        filteredList = filteredList.filter(item => selectedClassifyNames.includes(item.ClassifyName))
      }

      // 更新筛选后的数据
      this.total = filteredList.length
      this.list = filteredList.slice((this.listQuery.page - 1) * this.listQuery.limit, this.listQuery.page * this.listQuery.limit)

      // 计算筛选后的总金额
      this.totalAmount = filteredList.reduce((total, item) => total + item.Amount, 0)
    },

    // 获取所选分类及其所有子分类的显示名称
    getAllClassifyNames(selectedClassify) {
      console.error(selectedClassify)
      const classifyName = selectedClassify[selectedClassify.length - 1] // 获取所选的最后一级分类显示名称
      const classifyNode = this.findClassifyNodeByName(this.classifyOptions1, classifyName)
      if (classifyNode) {
        return this.collectAllClassifyNames(classifyNode)
      }
      return [classifyName] // 如果没有找到对应的分类节点，则只返回所选分类名称
    },

    // 在分类树中找到指定显示名称的分类节点
    findClassifyNodeByName(classifyOptions, name) {
      for (const option of classifyOptions) {
        if (option.Name === name) { // 匹配显示名称
          return option
        }
        if (option.children && option.children.length > 0) {
          const foundNode = this.findClassifyNodeByName(option.children, name)
          if (foundNode) {
            return foundNode
          }
        }
      }
      return null
    },

    // 递归收集所有子分类的显示名称（包括自身）
    collectAllClassifyNames(node) {
      let classifyNames = [node.Name] // 先将当前分类显示名称加入列表
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          classifyNames = classifyNames.concat(this.collectAllClassifyNames(child)) // 递归收集子分类的显示名称
        }
      }
      return classifyNames
    },
    getList() {
      this.listLoading = true
      axios.get('http://127.0.0.1:5000/api/income_outlay_entries')
        .then(response => {
          this.fullList = response.data // 将所有数据存储在 fullList 中
          this.total = this.fullList.length // 总条数
          this.applyFilters() // 应用筛选条件
          this.listLoading = false
        })
        .catch(() => {
          this.listLoading = false
        })
    },
    fetchMemberOptions() {
      axios.get('http://127.0.0.1:5000/api/family_members/')
        .then(response => {
          this.memberOptions = response.data // 保留所有成员
        })
        .catch(error => {
          console.error('Error fetching members:', error)
        })
    },
    fetchClassifyOptions() {
      const api = this.temp.Type === 'Income'
        ? 'http://127.0.0.1:5000/api/income_classifies/'
        : 'http://127.0.0.1:5000/api/outlay_classifies/'

      axios.get(api)
        .then(response => {
          this.classifyOptions = this.buildClassifyTree(response.data)
        })
        .catch(error => {
          console.error('Error fetching classify options:', error)
        })
    },
    buildClassifyTree(data) {
      const tree = []
      const idMap = new Map()

      // 先处理一级分类
      data.forEach(item => {
        if (item.FatherClassifyID === null) {
          const node = { ID: item.ID, Name: item.Name, children: [] }
          tree.push(node)
          idMap.set(item.ID, node)
        }
      })

      // 再处理二级分类
      data.forEach(item => {
        if (item.FatherClassifyID !== null) {
          const parent = idMap.get(item.FatherClassifyID)
          if (parent) {
            const node = { ID: item.ID, Name: item.Name }
            parent.children.push(node)
          }
        }
      })

      return tree
    },
    handleFilter() {
      this.listQuery.page = 1 // 每次筛选后重置为第一页
      this.applyFilters() // 重新应用筛选
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'ID') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      this.listQuery.sort = order === 'ascending' ? '+ID' : '-ID'
      this.handleFilter()
    },
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = (`0${d.getMonth() + 1}`).slice(-2)
      const day = (`0${d.getDate()}`).slice(-2)
      const hours = (`0${d.getHours()}`).slice(-2)
      const minutes = (`0${d.getMinutes()}`).slice(-2)
      const seconds = (`0${d.getSeconds()}`).slice(-2)
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    resetTemp() {
      this.temp = {
        ID: undefined,
        Amount: 0,
        ClassifyID: '',
        Member: '',
        Place: '',
        Remark: '',
        Time: new Date(),
        Type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.isEditMode = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleClassifyChange(value) {
      this.temp.ClassifyID = value[value.length - 1]
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = {
            ...this.temp,
            Time: this.formatDate(this.temp.Time) // 格式化时间
          }
          axios.post('http://127.0.0.1:5000/api/income_outlay_entries', payload)
            .then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            })
        }
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // 深度复制对象
      this.temp.Time = new Date(this.temp.Time) // 将时间转换为 Date 对象
      this.fetchClassifyOptions() // 更新分类选项
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.isEditMode = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = {
            Type: this.temp.Type,
            Time: this.formatDate(this.temp.Time), // 格式化时间
            Amount: this.temp.Amount,
            ClassifyID: this.temp.ClassifyID, // 确保传递的是二级分类的 ID
            MemberID: this.temp.Member, // 确保传递的是成员的 ID
            Place: this.temp.Place,
            Remark: this.temp.Remark
          }

          axios.put(`http://127.0.0.1:5000/api/income_outlay_entries/${this.temp.ID}`, payload)
            .then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
            .catch(error => {
              console.error('Error updating entry:', error)
              this.$notify({
                title: 'Error',
                message: 'Failed to update entry',
                type: 'error',
                duration: 2000
              })
            })
        }
      })
    },
    handleDelete(row, index) {
      const typeQuery = row.Type === 'Income' ? '收入' : '支出'

      axios.delete(`http://127.0.0.1:5000/api/income_outlay_entries/${row.ID}`, {
        params: { Type: typeQuery }
      })
        .then(() => {
          this.list.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        })
        .catch(error => {
          console.error('Error deleting entry:', error)
          this.$notify({
            title: 'Error',
            message: 'Failed to delete entry',
            type: 'error',
            duration: 2000
          })
        })
    },

    getSortClass(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    fetchClassifyOptionsForFilter() {
      // 获取所有分类数据，包含收入和支出分类
      axios.all([
        axios.get('http://127.0.0.1:5000/api/income_classifies/'),
        axios.get('http://127.0.0.1:5000/api/outlay_classifies/')
      ])
        .then(axios.spread((incomeResponse, outlayResponse) => {
          const incomeClassify1 = this.buildClassifyTreeForFilter(incomeResponse.data, 'Income')
          const outlayClassify1 = this.buildClassifyTreeForFilter(outlayResponse.data, 'Outlay')
          this.classifyOptions1 = [...incomeClassify1, ...outlayClassify1]
        }))
        .catch(error => {
          console.error('Error fetching classify options:', error)
        })
    },
    buildClassifyTreeForFilter(data, type) {
      const tree = []
      const idMap = new Map()

      // 创建收/支类型的顶级节点
      const typeNode = { ID: type, Name: type === 'Income' ? 'Income' : 'Outlay', children: [] }
      tree.push(typeNode)
      idMap.set(type, typeNode)

      // 处理一级和二级分类
      data.forEach(item => {
        if (item.FatherClassifyID === null) {
          // 一级分类
          const node = { ID: item.Name, Name: item.Name, children: [] }
          typeNode.children.push(node)
          idMap.set(item.ID, node)
        } else {
          // 二级分类
          const parent = idMap.get(item.FatherClassifyID)
          if (parent) {
            const node = { ID: item.Name, Name: item.Name }
            parent.children.push(node)
          }
        }
      })

      return tree
    }
  }
}
</script>

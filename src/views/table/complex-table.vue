<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in typeOptions" :key="item" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加记录
      </el-button>
    </div>

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
          <el-select v-model="temp.Type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="Time">
          <el-date-picker v-model="temp.Time" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="金额" prop="Amount">
          <el-input v-model="temp.Amount" />
        </el-form-item>
        <el-form-item label="分类" prop="ClassifyName">
          <el-input v-model="temp.ClassifyName" />
        </el-form-item>
        <el-form-item label="成员" prop="Member">
          <el-input v-model="temp.Member" />
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
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
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
        ClassifyName: '',
        Member: '',
        Place: '',
        Remark: '',
        Time: new Date(),
        Type: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        Type: [{ required: true, message: '收/支类型是必填项', trigger: 'change' }],
        Time: [{ type: 'date', required: true, message: '日期是必填项', trigger: 'change' }],
        Amount: [{ required: true, message: '金额是必填项', trigger: 'blur' }],
        ClassifyName: [{ required: true, message: '分类是必填项', trigger: 'blur' }],
        Member: [{ required: true, message: '成员是必填项', trigger: 'blur' }],
        Place: [{ required: true, message: '地点是必填项', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      axios.get('http://127.0.0.1:5000/api/income_outlay_entries', { params: this.listQuery })
        .then(response => {
          this.list = response.data
          this.total = response.data.length

          // 模拟请求时间
          setTimeout(() => {
            this.listLoading = false
          }, 1500)
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'ID') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+ID'
      } else {
        this.listQuery.sort = '-ID'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        ID: undefined,
        Amount: 0,
        ClassifyName: '',
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
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          axios.post('http://127.0.0.1:5000/api/income_outlay_entries', this.temp)
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
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = {
            Type: this.temp.Type === 'Income' ? '收入' : '支出',
            Time: this.temp.Time.toISOString(), // 将时间格式化为 ISO 字符串
            Amount: this.temp.Amount,
            ClassifyID: this.temp.ClassifyID, // 确保传递的是分类的 ID
            Member: this.temp.Member, // 确保传递的是成员的 ID
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
      const typeQuery = row.Type === 'Income' ? '收入' : '输出'

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
    }
  }
}
</script>

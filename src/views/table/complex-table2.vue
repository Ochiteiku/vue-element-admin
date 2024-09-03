<template>
  <div class="app-container">
    <div class="filter-container" style="display: flex; gap:20px">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加账号
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
    >
      <el-table-column label="UID" prop="UID" align="center" width="240">
        <template slot-scope="{ row }">
          <span>{{ row.UID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="Username" align="center" width="350px">
        <template slot-scope="{ row }">
          <span>{{ row.Username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" prop="Password" align="center" width="350px">
        <template slot-scope="{ row }">
          <span>{{ maskPassword(row.Password) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" prop="Name" align="center" width="300px">
        <template slot-scope="{ row }">
          <span>{{ row.Name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" prop="Level" align="center" width="310px">
        <template slot-scope="{ row }">
          <span>{{ row.Level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" prop="RegisterTime" align="center" width="350px">
        <template slot-scope="{ row }">
          <span>{{ formatDate(row.RegisterTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功能" align="center" width="400">
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px;">
        <!-- ID 仅在编辑模式下显示 -->
        <el-form-item v-if="dialogStatus === 'update'" label="UID" prop="UID">
          <el-input v-model="temp.UID" disabled style="margin-left: 100px;" />
        </el-form-item>
        <!-- 用户名在编辑模式下不可修改 -->
        <el-form-item label="用户名" prop="Username">
          <el-input v-model="temp.Username" :disabled="dialogStatus === 'update'" style="margin-left: 100px;" />
        </el-form-item>
        <!-- 新密码框，仅在编辑模式下显示 -->
        <el-form-item v-if="dialogStatus === 'update'" label="新密码" prop="NewPassword">
          <el-input v-model="temp.NewPassword" type="password" placeholder="请输入新密码" style="margin-left: 100px;" />
        </el-form-item>
        <!-- 密码框，仅在创建模式下显示 -->
        <el-form-item v-if="dialogStatus === 'create'" label="密码" prop="Password">
          <el-input v-model="temp.Password" type="password" placeholder="请输入密码" style="margin-left: 100px;" />
        </el-form-item>
        <el-form-item label="姓名" prop="Name">
          <el-input v-model="temp.Name" style="margin-left: 100px;" />
        </el-form-item>
        <!-- 权限等级选择 -->
        <el-form-item label="权限等级" prop="Level" label-width="100px">
          <el-select v-model="temp.Level" placeholder="请选择权限等级" style="margin-left: 70px;">
            <el-option label="管理员" value="1" />
            <el-option label="普通用户" value="2" />
          </el-select>
        </el-form-item>
        <!-- 注册时间在编辑模式下不可修改 -->
        <el-form-item label="注册时间" prop="RegisterTime" label-width="100px">
          <el-date-picker v-model="temp.RegisterTime" type="datetime" placeholder="请选择注册时间" style="margin-left: 70px;" :disabled="dialogStatus === 'update'" />
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

export default {
  name: 'UserTable',
  data() {
    return {
      isEditMode: true,
      tableKey: 0,
      list: [],
      listLoading: true,
      temp: {
        UID: undefined,
        Username: '',
        Password: '',
        NewPassword: '', // 用于在编辑模式下输入新密码
        Name: '',
        Level: 1,
        RegisterTime: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        Username: [{ required: true, message: '用户名是必填项', trigger: 'blur' }],
        Password: [{ required: true, message: '密码是必填项', trigger: 'blur', min: 6 }],
        Name: [{ required: true, message: '姓名是必填项', trigger: 'blur' }],
        Level: [{ required: true, message: '等级是必填项', trigger: 'blur' }],
        RegisterTime: [{ type: 'date', required: true, message: '注册时间是必填项', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      axios.get('http://127.0.0.1:5000/api/users/')
        .then(response => {
          this.list = response.data.map(user => ({
            ...user,
            Level: user.Level === 1 ? '管理员' : '普通用户' // 显示时转换权限等级
          }))
          this.listLoading = false
        })
        .catch(() => {
          this.listLoading = false
        })
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
    handleUpdate(row) {
      this.temp = {
        ...row,
        Level: row.Level === 1 ? '管理员' : '普通用户', // 编辑时将权限等级显示为“管理员”或“普通用户”
        NewPassword: '', // 清空新密码字段
        RegisterTime: new Date(row.RegisterTime)
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.isEditMode = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = {
            Username: this.temp.Username,
            Password: this.temp.Password,
            Name: this.temp.Name,
            Level: this.temp.Level === '管理员' ? 1 : 2, // 保存时将权限等级转换为1或2
            RegisterTime: this.formatDate(this.temp.RegisterTime)
          }
          axios.post('http://127.0.0.1:5000/api/users/', payload)
            .then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = {
            Username: this.temp.Username,
            Name: this.temp.Name,
            Level: this.temp.Level === '管理员' ? 1 : 2, // 保存时将权限等级转换为1或2
            RegisterTime: this.formatDate(this.temp.RegisterTime)
          }
          // 仅当有新密码输入时才将其包含在请求中
          if (this.temp.NewPassword) {
            payload.Password = this.temp.NewPassword
          }
          axios.put(`http://127.0.0.1:5000/api/users/${this.temp.UID}`, payload)
            .then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
            .catch(error => {
              console.error('Error updating user:', error)
              this.$notify({
                title: 'Error',
                message: '更新失败',
                type: 'error',
                duration: 2000
              })
            })
        }
      })
    },
    handleDelete(row, index) {
      axios.delete(`http://127.0.0.1:5000/api/users/${row.UID}`)
        .then(() => {
          this.list.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
        .catch(error => {
          console.error('Error deleting user:', error)
          this.$notify({
            title: 'Error',
            message: '删除失败',
            type: 'error',
            duration: 2000
          })
        })
    },
    resetTemp() {
      this.temp = {
        UID: undefined,
        Username: '',
        Password: '',
        NewPassword: '', // 清空新密码字段
        Name: '',
        Level: '普通用户', // 默认权限等级为普通用户
        RegisterTime: new Date()
      }
    },
    maskPassword(password) {
      return '*'.repeat(password.length)
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
    }
  }

}
</script>

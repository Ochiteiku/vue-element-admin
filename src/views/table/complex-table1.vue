<template>
  <div class="app-container">
    <div class="filter-container" style="display: flex; gap:20px">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加家庭成员
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
      <el-table-column label="ID" prop="Id" align="center" width="240">
        <template slot-scope="{ row }">
          <span>{{ row.Id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身份" prop="Identity" align="center" width="350px">
        <template slot-scope="{ row }">
          <span>{{ row.Identity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" prop="Membername" align="center" width="350px">
        <template slot-scope="{ row }">
          <span>{{ row.Membername }}</span>
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
        <el-form-item v-if="dialogStatus === 'update'" label="ID" prop="Id">
          <el-input v-model="temp.Id" disabled style="margin-left: 100px;" />
        </el-form-item>
        <el-form-item label="身份" prop="Identity">
          <el-input v-model="temp.Identity" style="margin-left: 100px;" />
        </el-form-item>
        <el-form-item label="姓名" prop="Membername">
          <el-input v-model="temp.Membername" style="margin-left: 100px;" />
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
  name: 'FamilyMembersTable',
  data() {
    return {
      isEditMode: true,
      tableKey: 0,
      list: [],
      listLoading: true,
      temp: {
        Id: undefined,
        Identity: '',
        Membername: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        Identity: [{ required: true, message: '身份是必填项', trigger: 'blur' }],
        Membername: [{ required: true, message: '姓名是必填项', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      axios.get('http://127.0.0.1:5000/api/family_members/')
        .then(response => {
          this.list = response.data
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
        ...row
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
            Identity: this.temp.Identity,
            Membername: this.temp.Membername
          }
          axios.post('http://127.0.0.1:5000/api/family_members/', payload)
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
            Identity: this.temp.Identity,
            Membername: this.temp.Membername
          }
          axios.put(`http://127.0.0.1:5000/api/family_members/${this.temp.Id}`, payload)
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
              console.error('Error updating family member:', error)
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
      axios.delete(`http://127.0.0.1:5000/api/family_members/${row.Id}`)
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
          console.error('Error deleting family member:', error)
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
        Id: undefined,
        Identity: '',
        Membername: ''
      }
    }
  }
}
</script>

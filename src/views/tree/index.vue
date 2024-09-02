<template>
  <div class="app-container">
    <div style="display: flex; align-items: center; margin-bottom: 30px;">
      <el-input v-model="filterText" placeholder="Filter keyword" style="width: 150px; margin-right: 10px;" />
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加分类</el-button>
      <el-button type="warning" icon="el-icon-edit" :disabled="!selectedNode" @click="handleEdit">编辑分类</el-button>
      <el-button type="danger" icon="el-icon-delete" :disabled="!selectedNode" @click="handleDelete">删除分类</el-button>
    </div>

    <el-tree
      ref="tree2"
      :data="treeData"
      :props="defaultProps"
      :filter-node-method="filterNode"
      class="filter-tree"
      default-expand-all
      node-key="id"
      @node-click="handleNodeClick"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form ref="form" :model="newClassify" :rules="rules" label-width="100px">
        <el-form-item label="选择类型" prop="type">
          <el-select v-model="newClassify.type" placeholder="请选择收支类型" :disabled="isEditMode" @change="handleTypeChange">
            <el-option label="收入" value="收入" />
            <el-option label="支出" value="支出" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="parentOptions.length > 0" label="一级分类" prop="FatherClassifyID">
          <el-select v-model="newClassify.FatherClassifyID" placeholder="请选择一级分类" :disabled="isEditMode">
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="Name">
          <el-input v-model="newClassify.Name" style="width: 300px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      filterText: '',
      treeData: [],
      dialogVisible: false,
      dialogTitle: '添加分类',
      isEditMode: false, // 新增：是否为编辑模式的标记
      newClassify: {
        ID: null,
        type: '',
        Name: '',
        FatherClassifyID: null
      },
      selectedNode: null,
      parentOptions: [], // 用于存放父级分类的选项
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      rules: {
        type: [{ required: true, message: '请选择收支类型', trigger: 'change' }],
        FatherClassifyID: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
        Name: [{ required: true, message: '分类名称是必填项', trigger: 'blur' }]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.fetchClassifyData()
  },
  methods: {
    fetchClassifyData() {
      const incomeApi = 'http://127.0.0.1:5000/api/income_classifies/'
      const outlayApi = 'http://127.0.0.1:5000/api/outlay_classifies/'

      Promise.all([
        axios.get(incomeApi),
        axios.get(outlayApi)
      ]).then(([incomeResponse, outlayResponse]) => {
        const incomeData = this.buildTree(incomeResponse.data, '收入')
        const outlayData = this.buildTree(outlayResponse.data, '支出')
        this.treeData = [incomeData, outlayData]
        this.incomeData = incomeResponse.data
        this.outlayData = outlayResponse.data
      }).catch(error => {
        console.error('Error fetching classify data:', error)
      })
    },
    buildTree(data, type) {
      const tree = {
        id: type === '收入' ? -1 : -2, // 给定一个特殊的 ID
        label: type,
        children: []
      }

      const idMap = new Map()

      // 先把所有的顶级节点（FatherClassifyID 为 null）添加到树中
      data.forEach(item => {
        if (item.FatherClassifyID === null) {
          const node = { id: item.ID, label: `${item.Name} (ID: ${item.ID})`, children: [] }
          tree.children.push(node)
          idMap.set(item.ID, node)
        }
      })

      // 然后添加子节点
      data.forEach(item => {
        if (item.FatherClassifyID !== null) {
          const parent = idMap.get(item.FatherClassifyID)
          if (parent) {
            const node = { id: item.ID, label: `${item.Name} (ID: ${item.ID})` }
            parent.children.push(node)
            idMap.set(item.ID, node)
          }
        }
      })

      return tree
    },
    handleTypeChange(type) {
      if (this.isEditMode) return // 编辑模式下不允许更改类型

      // 根据选择的类型动态设置父级分类选项
      this.parentOptions = []
      const data = type === '收入' ? this.incomeData : this.outlayData

      data.forEach(item => {
        if (item.FatherClassifyID === null) {
          this.parentOptions.push({ id: item.ID, label: `${item.Name} (ID: ${item.ID})` })
        }
      })

      // 重置父级分类选择
      this.newClassify.FatherClassifyID = null

      // 计算并设置新分类的 ID
      const maxID = data.reduce((max, item) => Math.max(max, item.ID), 0)
      this.newClassify.ID = maxID + 1
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleCreate() {
      this.isEditMode = false // 进入创建模式
      this.newClassify = {
        ID: null,
        type: '',
        Name: '',
        FatherClassifyID: null
      }
      this.dialogTitle = '添加分类'
      this.dialogVisible = true
    },
    handleNodeClick(node) {
      this.selectedNode = node
    },
    handleEdit() {
      if (!this.selectedNode) return

      this.isEditMode = true // 进入编辑模式
      const { label } = this.selectedNode
      const [Name, IDPart] = label.split(' (ID: ')
      const ID = parseInt(IDPart.replace(')', ''))

      const type = ID >= 50000 && ID < 60000 ? '收入' : '支出'
      this.newClassify = {
        ID,
        type,
        Name,
        FatherClassifyID: this.getFatherClassifyID(ID, type) // 获取父级分类的ID
      }
      this.handleTypeChange(type) // 更新父级分类选项，但不会改变分类和父分类
      this.dialogTitle = '编辑分类'
      this.dialogVisible = true
    },
    getFatherClassifyID(ID, type) {
      const data = type === '收入' ? this.incomeData : this.outlayData
      const entry = data.find(item => item.ID === ID)
      return entry ? entry.FatherClassifyID : null
    },
    handleDelete() {
      if (!this.selectedNode) return

      const { id } = this.selectedNode
      const type = id >= 50000 && id < 60000 ? '收入' : '支出'
      const api = type === '收入'
        ? `http://127.0.0.1:5000/api/income_classifies/${id}`
        : `http://127.0.0.1:5000/api/outlay_classifies/${id}`

      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(api).then(() => {
          this.fetchClassifyData() // 重新获取分类数据并刷新树
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(error => {
          console.error('Error deleting classify:', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const api = this.newClassify.type === '收入'
            ? this.isEditMode ? `http://127.0.0.1:5000/api/income_classifies/${this.newClassify.ID}` : 'http://127.0.0.1:5000/api/income_classifies/'
            : this.isEditMode ? `http://127.0.0.1:5000/api/outlay_classifies/${this.newClassify.ID}` : 'http://127.0.0.1:5000/api/outlay_classifies/'

          const method = this.isEditMode ? 'put' : 'post'

          axios[method](api, this.newClassify).then(() => {
            this.dialogVisible = false
            this.fetchClassifyData() // 重新获取分类数据并刷新树
            this.$message({
              message: `${method === 'post' ? '添加' : '编辑'}分类成功`,
              type: 'success'
            })
          }).catch(error => {
            console.error(`Error ${method === 'post' ? 'adding' : 'editing'} classify:`, error)
            this.$message.error(`${method === 'post' ? '添加' : '编辑'}分类失败`)
          })
        }
      })
    }
  }
}
</script>

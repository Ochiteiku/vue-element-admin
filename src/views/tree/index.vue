<template>
  <div class="app-container">
    <div style="display: flex; align-items: center; margin-bottom: 30px;">
      <el-input v-model="filterText" placeholder="Filter keyword" style="width: 150px; margin-right: 10px;" />
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加分类</el-button>
    </div>

    <el-tree
      ref="tree2"
      :data="treeData"
      :props="defaultProps"
      :filter-node-method="filterNode"
      class="filter-tree"
      default-expand-all
      @node-dblclick="handleNodeDblClick"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form ref="form" :model="newClassify" :rules="rules" label-width="100px">
        <el-form-item label="选择类型" prop="type">
          <el-select v-model="newClassify.type" placeholder="请选择收支类型" :disabled="isEdit" @change="handleTypeChange">
            <el-option label="收入" value="收入" />
            <el-option label="支出" value="支出" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="parentOptions.length > 0" label="一级分类" prop="FatherClassifyID">
          <el-select v-model="newClassify.FatherClassifyID" placeholder="请选择一级分类" :disabled="isEdit">
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
        <el-button v-if="isEdit" type="danger" @click="handleDelete">删除</el-button>
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
      newClassify: {
        type: '',
        Name: '',
        FatherClassifyID: null
      },
      parentOptions: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      rules: {
        type: [{ required: true, message: '请选择收支类型', trigger: 'change' }],
        FatherClassifyID: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
        Name: [{ required: true, message: '分类名称是必填项', trigger: 'blur' }]
      },
      isEdit: false, // 用于区分是添加还是编辑
      editId: null // 用于存储当前编辑的分类ID
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
          const node = { id: item.ID, label: item.Name, children: [] }
          tree.children.push(node)
          idMap.set(item.ID, node)
        }
      })

      // 然后添加子节点
      data.forEach(item => {
        if (item.FatherClassifyID !== null) {
          const parent = idMap.get(item.FatherClassifyID)
          if (parent) {
            const node = { id: item.ID, label: item.Name }
            parent.children.push(node)
            idMap.set(item.ID, node)
          }
        }
      })

      return tree
    },
    handleTypeChange(type) {
      // 根据选择的类型动态设置父级分类选项
      this.parentOptions = []
      const data = type === '收入' ? this.incomeData : this.outlayData

      data.forEach(item => {
        if (item.FatherClassifyID === null) {
          this.parentOptions.push({ id: item.ID, label: item.Name })
        }
      })

      // 重置父级分类选择
      this.newClassify.FatherClassifyID = null
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleCreate() {
      this.dialogTitle = '添加分类'
      this.isEdit = false
      this.newClassify = {
        type: '',
        Name: '',
        FatherClassifyID: null
      }
      this.dialogVisible = true
    },
    handleNodeDblClick(nodeData) {
      // 编辑分类
      this.dialogTitle = '编辑分类'
      this.isEdit = true
      this.editId = nodeData.id

      const type = this.treeData.find(root => root.children.some(child => child.id === nodeData.id || child.children.some(sub => sub.id === nodeData.id)))?.label
      this.newClassify.type = type
      this.newClassify.Name = nodeData.label

      // 找到父级分类的 ID
      if (nodeData.children && nodeData.children.length > 0) {
        this.newClassify.FatherClassifyID = nodeData.id
      } else {
        const parent = this.treeData.find(root => root.children.some(child => child.children && child.children.some(sub => sub.id === nodeData.id)))
        this.newClassify.FatherClassifyID = parent ? parent.id : null
      }

      this.handleTypeChange(type)
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const api = this.newClassify.type === '收入'
            ? `http://127.0.0.1:5000/api/income_classifies/${this.isEdit ? this.editId : ''}`
            : `http://127.0.0.1:5000/api/outlay_classifies/${this.isEdit ? this.editId : ''}`

          const request = this.isEdit ? axios.put(api, this.newClassify) : axios.post(api, this.newClassify)

          request.then(() => {
            this.dialogVisible = false
            this.fetchClassifyData() // 重新获取分类数据并刷新树
            this.$message({
              message: this.isEdit ? '分类编辑成功' : '分类添加成功',
              type: 'success'
            })
          }).catch(error => {
            console.error(`Error ${this.isEdit ? 'editing' : 'adding'} classify:`, error)
            this.$message.error(`${this.isEdit ? '编辑' : '添加'}分类失败`)
          })
        }
      })
    },
    handleDelete() {
      const api = this.newClassify.type === '收入'
        ? `http://127.0.0.1:5000/api/income_classifies/${this.editId}`
        : `http://127.0.0.1:5000/api/outlay_classifies/${this.editId}`

      axios.delete(api).then(() => {
        this.dialogVisible = false
        this.fetchClassifyData() // 重新获取分类数据并刷新树
        this.$message({
          message: '分类删除成功',
          type: 'success'
        })
      }).catch(error => {
        console.error('Error deleting classify:', error)
        this.$message.error('分类删除失败')
      })
    }
  }
}
</script>

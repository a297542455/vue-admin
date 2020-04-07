<template>
  <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" destroy-on-close>
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 100%; height: 50vh;overflow-y: scroll;">
      <el-form-item label="名称" prop="title">
        <el-input v-model="temp.title" clearable/>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="temp.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上级" prop="pids">
        <el-select
          v-model="temp.pids"
          :remote-method="remoteMethod"
          :loading="loading"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
          style="width:100%">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="权限">
        <el-tree
          ref="tree"
          :data="getRulesList"
          :default-checked-keys="defaultChecked"
          :props="defaultProps"
          default-expand-all
          show-checkbox
          node-key="id"
          @check="checkHandle"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button :loading="btnLoading" type="primary" @click="saveData()">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getListAll } from '@/api/rules'
import { getinfo, save, getlabelList } from '@/api/roles'
import tree from '@/utils/tree'

export default {
  name: 'RolesForm',
  data() {
    return {
      btnLoading: false,
      loading: false,
      ruleList: [],
      options: [],
      temp: {
        id: '',
        title: '',
        status: 1,
        rules: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        title: [{ required: true, message: '名称必填', trigger: 'blur' }]
      },
      defaultChecked: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    getRulesList() {
      return tree.listToTreeMulti(this.ruleList)
    }
  },
  watch: {
    dialogFormVisible: function() {
      this.resetTemp()
    }
  },
  created() {
    this.getRules()
  },
  destroyed() {},
  methods: {
    remoteMethod(keyword) {
      if (keyword !== '') {
        this.loading = true
        getlabelList({ keyword }).then(response => {
          const data = response.data.data
          this.options = data.map(o => {
            return { value: `${o.id}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    getRules() {
      getListAll().then(response => {
        this.ruleList = response.data.data
      })
    },
    resetTemp() {
      this.temp = {
        id: '',
        title: '',
        status: 1,
        pids: '',
        rules: ''
      }
    },
    checkHandle(data) {
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys().join(',')
      const checkedKeys = this.$refs.tree.getCheckedKeys().join(',')
      if (halfCheckedKeys.length && checkedKeys.length) {
        this.temp.rules = halfCheckedKeys + ',' + checkedKeys
      } else if (halfCheckedKeys.length && checkedKeys.length === 0) {
        this.temp.rules = halfCheckedKeys
      } else if (halfCheckedKeys.length === 0 && checkedKeys.length) {
        this.temp.rules = checkedKeys
      } else {
        this.temp.rules = ''
      }
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.currentIndex = -1
      this.$refs.tree.setCheckedKeys([])
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(id) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const _this = this
      getinfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.temp.id = data.id
          _this.temp.title = data.title
          _this.temp.status = data.status
          _this.temp.rules = data.rules
          this.$refs.tree.setCheckedKeys(_this.temp.rules.split(','))
          _this.temp.pids = []
          _this.options = []
          data.pdata &&
            data.pdata.map(o => {
              _this.options.push({ value: `${o.pid}`, label: `${o.pname}` })
              _this.temp.pids.push(o.pid)
            })
        }
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    saveData() {
      this.btnLoading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const _this = this
          const d = this.temp
          d.pids = d.pids.join(',')
          save(d)
            .then(response => {
              if (response.status === 1) {
                if (!d.id) {
                  d.id = response.data
                }
                this.$emit('updateRow', d)
                _this.dialogFormVisible = false
                _this.$message.success(response.msg)
              } else {
                _this.$message.error(response.msg)
              }
              _this.btnLoading = false
            })
            .catch(error => {
              this.btnLoading = false
            })
        } else {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>

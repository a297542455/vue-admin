<template>
  <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 100%; height: 50vh;overflow-y: scroll;">
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
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="temp.name" clearable/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button :loading="btnLoading" type="primary" @click="saveData()">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getlist, getInfo, save } from '@/api/wiki/label'
export default {
  name: 'LabelsForm',
  components: {},
  props: {
    labelList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      value: [],
      options: [],
      loading: false,
      btnLoading: false,
      temp: {
        id: '',
        pids: [],
        name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        name: [{ required: true, message: '标识必填', trigger: 'blur' }]
      }
    }
  },
  computed: {},
  watch: {
    dialogFormVisible: function() {
      this.resetTemp()
    },
    temp: {
      handler(newVal, oldVal) {},
      immediate: true,
      deep: true
    }
  },
  created() {},
  destroyed() {},
  methods: {
    remoteMethod(keyword) {
      if (keyword !== '') {
        this.loading = true
        getlist({ keyword }).then(response => {
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
    resetTemp() {
      this.temp = {
        id: '',
        pids: [],
        name: ''
      }
      this.options = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.currentIndex = -1
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs['dataForm'].resetFields()
      })
    },
    handleUpdate(id) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const _this = this
      getInfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.temp.id = data.id
          _this.temp.name = data.name
          _this.temp.pids = []
          _this.options = []
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
          const d = {
            ...this.temp,
            pids: this.temp.pids.join(',')
          }
          if (!d.id) {
            this.$delete(this.temp, 'id')
          }
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

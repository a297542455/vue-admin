<template>
  <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" destroy-on-close fullscreen>
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="标签" prop="name">
        <el-input v-model="temp.name" clearable/>
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
            :disabled="item.disabled"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="temp" label="额外信息">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-row>
              <el-col>
                <el-button type="primary" size="small" icon="el-icon-plus" @click="addTemp">增加信息</el-button>
              </el-col>
            </el-row>
          </div>

          <el-row v-for="(o,i) in temp.temp" :gutter="20" :key="i" style="text-align:center">
            <el-col :span="3">
              <el-input v-model="o.name" clearable placeholder="标题"/>
            </el-col>
            <el-col :span="8">
              <el-input v-model="o.content" clearable placeholder="内容"/>
            </el-col>
            <el-col :span="1">
              <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(i)"></el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-form-item>
      <el-form-item prop="sortCode" label="排序">
        <el-input v-model="temp.sortCode" clearable/>
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
import Tinymce from '@/components/Tinymce'
import { deepClone } from '@/utils'
export default {
  name: 'LabelsForm',
  components: { Tinymce },
  props: {
    labelList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      value: [],
      list: [],
      options: [],
      loading: false,
      btnLoading: false,
      temp: {},
      defaultForm: {
        id: '',
        pids: [],
        name: '',
        sortCode: 1, // 排序
        temp: [], // 基础模板
        content: '' // 详情模板
      },
      relatePids: [],
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
    dialogFormVisible: function(val, oldVal) {
      if (!val) {
        this.resetTemp(val)
      }
    }
  },
  mounted() {
    // this.temp = deepClone(this.defaultForm)
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
            if (o.id === this.temp.id) return { value: `${o.id}`, label: `${o.name}(禁止选择自己作为上级)`, disabled: true }
            return { value: `${o.id}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    resetTemp(val) {
      this.options = []
      this.relatePids = []
      this.$nextTick(() => {
        if (this.$refs['dataForm']) {
          this.$refs['dataForm'].clearValidate()
          this.$refs['dataForm'].resetFields()
        }
      })
    },
    handleCreate() {
      this.temp = deepClone(this.defaultForm)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.currentIndex = -1
    },
    async handleUpdate(id) {
      this.dialogStatus = 'update'
      const _this = this
      await getInfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.temp = {
            ...data,
            pids: [],
            temp: !data.temp || JSON.stringify(data.temp) === '{}' ? [] : data.temp
          }
          _this.options = []
          data.pdata.map(o => {
            _this.options.push({ value: `${o.pid}`, label: `${o.pname}` })
            _this.temp.pids.push(o.pid)
            _this.relatePids.push(o.pid)
          })
        }
      })
      this.dialogFormVisible = true
    },
    saveData() {
      this.btnLoading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const arr = [...this.temp.pids]
          arr.map(o => {
            if (!this.relatePids.includes(o)) {
              this.relatePids.push(o)
            }
          })
          const _this = this
          const d = {
            ...this.temp,
            pdata: JSON.stringify(this.temp.pdata), //  其实后台不要,免得到时候要了,先留着
            temp: JSON.stringify(this.temp.temp),
            pids: this.temp.pids.join(','),
            relatePids: this.relatePids, //  主要作用不是传给后台,是传递回上级的表格树组件寻找关联id
          }
          if (!d.id) {
            this.$delete(d, 'id')
          }
          save(d)
            .then(response => {
              if (response.status === 1) {
                if (!d.id) {
                  d.id = response.data.id
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
    },
    handleDelete(index) {
      this.temp.temp.splice(index, 1)
    },
    addTemp(o) {
      this.temp.temp.push({ name: '', content: '' })
    },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>

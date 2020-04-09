<template>
  <div class="createPost-container">
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" destroy-on-close fullscreen>
      <el-form ref="conceptForm" :model="conceptForm" :rules="rules" label-width="140px" class="form-container">

        <el-form-item label="名称" prop="name">
          <el-input v-model="conceptForm.name" :maxlength="100" name="name" required />
        </el-form-item>

        <el-form-item label="标签" prop="label">
          <el-select
            v-model="conceptForm.label"
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

        <!-- <el-form-item label="别名(功能预留)">
          <el-input v-model="conceptForm.sui" :maxlength="100" name="name" required />
        </el-form-item> -->

        <el-form-item label="双向词" prop="twoway">
          <el-select v-model="conceptForm.twoway" placeholder="是否双向词" clearable size="small" required>
            <el-option label="是" value="1"/>
            <el-option label="否" value="0"/>
          </el-select>
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input v-model="conceptForm.summary" :rows="1" :maxlength="100" type="textarea" class="article-textarea" autosize placeholder="摘要" />
          <!-- <span v-show="contentShortLength" class="word-counter">剩余 {{ 100 - contentShortLength }} 字符</span> -->
        </el-form-item>

        <el-form-item prop="content" label="内容">
          <Tinymce ref="editor" v-model="conceptForm.content" :height="300" />
        </el-form-item>

        <el-form-item v-if="conceptForm.id" prop="relation" label="关系">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <el-row type="flex" justify="space-around" style="text-align:center">
                <el-col>开始节点</el-col>
                <el-col>逻辑关系</el-col>
                <el-col>结束节点</el-col>
                <el-col>
                  <el-button type="primary" size="small" icon="el-icon-plus" @click="addRelation()"></el-button>
                </el-col>
              </el-row>
            </div>

            <el-row v-for="(o,i) in list" :gutter="20" :key="o.start_id+i" type="flex" justify="space-around" style="text-align:center">
              <el-col>
                <ConceptSelect v-model="o.start_name" @changObj="changObj(arguments[0],o,'start')" />
              </el-col>
              <el-col>
                <ConceptSelect v-model="o.relation_name" @changObj="changObj(arguments[0],o,'relation')" />
              </el-col>
              <el-col>
                <ConceptSelect v-model="o.end_name" @changObj="changObj(arguments[0],o,'end')" />
              </el-col>
              <el-col>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(i,o.id)"></el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="btnLoading" type="primary" @click="saveData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import ConceptSelect from './ConceptSelect'
import Tinymce from '@/components/Tinymce'
import { getInfo, save, getlabellist } from '@/api/wiki/concept'
import { getlistRelation, delRelation, saveRelation } from '@/api/wiki/relation'
import Upload from '@/components/Upload/image'
import { formatImgToArr, getNowTime } from '@/utils'
import { validatePhone, validateEmail } from '@/utils/validate'
import myconfig from '@/config'

const defaultForm = {
  id: '',
  name: '',
  label: [],
  sui: '',
  twoway: '0',
  summary: '', // 文章摘要
  content: '', // 文章内容
}

export default {
  name: 'ConceptForm',
  components: { Upload, Tinymce, ConceptSelect },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    return {
      conceptForm: Object.assign({}, defaultForm),
      loading: false,
      options: [],
      rules: {
        name: [{ validator: validateRequire }],
        summary: [{ validator: validateRequire }],
        label: [{ validator: validateRequire }],
        sui: [{ validator: validateRequire }],
      },
      btnLoading: false,
      config: {
        fileName: 'img',
        limit: 1,
        multiple: true,
        accept: 'image/*',
        action: myconfig.uploadUrl.img
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      baseObj: {
        start_id: '',
        start_name: '',
        relation_id: '',
        relation_name: '',
        end_id: '',
        end_name: '',
      },
      list: []
    }
  },
  computed: {
    contentShortLength() {
      return this.conceptForm.summary.length
    },
    lang() {
      return this.$store.getters.language
    },
  },
  watch: {
    dialogFormVisible: function() {
      this.resetTemp()
    },
  },
  created() {},
  destroyed() {},
  methods: {
    remoteMethod(keyword) {
      if (keyword !== '') {
        this.loading = true
        getlabellist({ keyword }).then(response => {
          const data = response.data.data
          this.options = data.map(o => {
            return { value: `${o.name}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    resetTemp() {
      this.$nextTick(() => {
        this.$refs['conceptForm'].clearValidate()
        this.$refs['conceptForm'].resetFields()
        this.conceptForm = Object.assign({}, defaultForm)
      })
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.currentIndex = -1
    },
    handleUpdate(id) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const _this = this
      getInfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.conceptForm = response.data
          _this.options = []
          data.label &&
            data.label.map(o => {
              _this.options.push({ value: o, label: o })
            })
          _this.conceptForm = response.data
        }
      })
      const obj = {
        start_id: id,
        end_id: id,
      }
      getlistRelation(obj).then(response => {
        if (response.status === 1) {
          // const data = response.data
          this.list = response.data.data
          console.log(1, this.list)
        }
      })
    },
    saveData() {
      this.btnLoading = true
      this.$refs['conceptForm'].validate(valid => {
        if (valid) {
          const _this = this
          const d = this.conceptForm
          // if (!d.id) {
          //   this.$delete(d, 'id')
          // } else {
          //   d._id = d.id
          // }
          d.label = d.label.join(',')
          d.opposite = '[{"_id": "1", "name": "cn"}]'
          d.sui = '[{"name": "测试", "type": "cn"}]'
          save(d)
            .then(response => {
              if (response.status === 1) {
                if (!d.id) {
                  d.id = response.data._id
                }
                // todo
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
    handleDelete(index, id) {
      if (!id) {
        this.list.splice(index, 1)
        return
      }
      const _this = this
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          _this.$set(_this.list[index], 'delete', true)
          delRelation(id)
            .then(response => {
              if (response.status === 1) {
                _this.list.splice(index, 1)
                _this.$notify.success(response.msg)
              } else {
                _this.$notify.error(response.msg)
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    saveRelation(d) {
      if (d.start_id && d.relation_id && d.end_id) {
        saveRelation(d).then(response => {
          if (response.status === 1) {
            if (!d.id) {
              d.id = response.data.id
              console.log(d)
            }
          }
        })
      }
    },
    addRelation(o) {
      this.list.push(Object.assign({}, this.baseObj))
    },
    changObj(changeObj, o, prop) {
      o[prop + '_id'] = changeObj.value
      o[prop + '_name'] = changeObj.label
      this.saveRelation(o)
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
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
</style>

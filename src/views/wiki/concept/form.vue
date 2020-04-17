<template>
  <div class="createPost-container">
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" destroy-on-close fullscreen>
      <el-form ref="conceptForm" :model="conceptForm" :rules="rules" label-width="140px" class="form-container">

        <el-form-item label="名称" prop="name">
          <el-input
            v-model="conceptForm.name"
            :maxlength="100"
            name="name"
            required
            style="width:50%"/>
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input v-model="conceptForm.summary" :rows="1" :maxlength="100" type="textarea" class="article-textarea" autosize placeholder="摘要" />
          <!-- <span v-show="contentShortLength" class="word-counter">剩余 {{ 100 - contentShortLength }} 字符</span> -->
        </el-form-item>

        <!-- <el-form-item label="图片" prop="imgurl">
          <Upload v-model="conceptForm.imgurl" :id="createId" />
        </el-form-item> -->

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
            style="width:50%">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- <el-form-item v-if="conceptForm.label" label="" style="">
          <el-button v-for="(o,i) in conceptForm.label" :key="i" size="small" @click="labelChange(o)">{{ o }}</el-button>
        </el-form-item> -->

        <el-form-item label="模版">
          <el-select
            v-model="tempValue"
            :remote-method="remoteMethod2"
            :loading="loading"
            filterable
            remote
            reserve-keyword
            placeholder="选择后会使用新的模版"
            style="width:50%"
            @change="tempChange">
            <el-option
              v-for="item in labelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-for="(o,i) in conceptForm.node_des" :key="i" :label="o.name">
          <el-input v-model="o.content" style="width:50%"/>
        </el-form-item>

        <!-- <el-form-item label="别名(功能预留)">
          <el-input v-model="conceptForm.sui" :maxlength="100" name="name" required />
        </el-form-item> -->

        <el-form-item prop="content" label="内容">
          <Tinymce v-if="showTinymce" ref="editor" v-model="conceptForm.content" :height="400" :create-id="createId" />
        </el-form-item>

        <el-form-item prop="relation" label="关系">
          <el-card v-if="conceptForm.id" class="box-card">
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
          <el-card v-else class="box-card">
            新增概念时，需先保存当前概念才能添加关系
          </el-card>
        </el-form-item>

        <el-form-item label="双向" prop="twoway">
          <el-select
            v-model="conceptForm.twoway"
            placeholder="是否双向词"
            clearable
            size="small"
            required
            style="width:50%">
            <el-option label="是" value="1"/>
            <el-option label="否" value="0"/>
          </el-select>
        </el-form-item>

        <el-form-item label="反向" prop="opposite">
          <el-select
            v-model="oppositeValue"
            :remote-method="remoteMethod3"
            :loading="loading"
            filterable
            remote
            reserve-keyword
            placeholder="反向"
            style="width:50%"
            @change="oppositeChange">
            <el-option
              v-for="item in oppositeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
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
import { getInfo, save, getlabellist, getConceptlist } from '@/api/wiki/concept'
import { getlistRelation, delRelation, saveRelation } from '@/api/wiki/relation'
import * as labelApi from '@/api/wiki/label'
import { getId } from '@/api/public'
import { formatImgToArr, getNowTime, deepClone } from '@/utils'
import Upload from '@/components/Upload/myUpload'
import { validatePhone, validateEmail } from '@/utils/validate'
import myconfig from '@/config'

const getLabelInfo = labelApi.getInfo

export default {
  name: 'ConceptForm',
  components: { Upload, Tinymce, ConceptSelect },
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
      showTinymce: false,
      oppositeValue: '',
      oppositeOptions: [],
      labelOptions: [],
      labelIndex: '',
      tempValue: '',
      labelTemp: {},
      conceptForm: {},
      createId: '',
      defaultForm: {
        id: '',
        name: '',
        label: [],
        node_des: [],
        sui: '',
        opposite: '', // 反向
        twoway: '0', // 是否双向词（1：是  0：否）
        summary: '', // 文章摘要
        content: '' // 文章内容
      },
      loading: false,
      options: [],
      rules: {
        name: [{ validator: validateRequire }],
        summary: [{ validator: validateRequire }],
        label: [{ validator: validateRequire }],
        sui: [{ validator: validateRequire }]
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
        end_name: ''
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
    }
  },
  watch: {
    dialogFormVisible: function(val, oldVal) {
      // console.log("resetTemp")
      if (!val) {
        this.resetTemp(val)
      } else {
        this.$nextTick(() => {
          this.showTinymce = val
        })
      }
    }
  },
  created() {},
  destroyed() {},
  methods: {
    resetTemp(val) {
      this.tempValue = ''
      this.oppositeValue = ''
      this.oppositeOptions = []
      this.labelOptions = []
      this.$nextTick(() => {
        if (this.$refs['conceptForm']) {
          this.$refs['conceptForm'].clearValidate()
          this.$refs['conceptForm'].resetFields()
        }
        this.conceptForm = deepClone(this.defaultForm)
        // console.log("showTinymce")
        this.showTinymce = val
      })
    },
    labelChange(val) {
      this.labelTemp = this.options.find(o => o.value === val)
    },
    async tempChange(id) {
      this.showTinymce = false
      await getLabelInfo(id).then(response => {
        if (response.status === 1) {
          this.$set(this.conceptForm, 'content', response.data.content)
          this.$set(this.conceptForm, 'node_des', response.data.temp)
        }
      })
      this.showTinymce = true
    },
    oppositeChange(value) {},
    remoteMethod3(keyword) {
      if (keyword !== '') {
        this.loading = true
        getConceptlist({ keyword }).then(response => {
          const data = response.data.data
          this.oppositeOptions = data.map(o => {
            return { value: `${o.id}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.oppositeOptions = []
      }
    },
    remoteMethod2(keyword) {
      if (keyword !== '') {
        this.loading = true
        getlabellist({ keyword }).then(response => {
          const data = response.data.data
          this.labelOptions = data.map((o, i) => {
            return { value: `${o.id}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.labelOptions = []
      }
    },
    remoteMethod(keyword) {
      if (keyword !== '') {
        this.loading = true
        getlabellist({ keyword }).then(response => {
          const data = response.data.data
          this.options = data.map((o, i) => {
            return { value: `${o.name}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    async handleCreate() {
      await getId()
        .then(response => {
          if (response.status === 1) {
            this.createId = response.data.id
          }
        })
        .catch(error => {
          this.$message.error(error)
          return false
        })
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.conceptForm = deepClone(this.defaultForm)
      this.currentIndex = -1
    },
    async handleUpdate(id) {
      this.dialogStatus = 'update'
      const _this = this
      await getInfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.options = []
          const obj = {
            value: data.opposite[0]._id,
            label: data.opposite[0].name
          }
          this.oppositeOptions = [obj]
          this.oppositeValue = data.opposite[0]._id
          data.label &&
            data.label.map(o => {
              _this.options.push({ value: o, label: o })
            })
          _this.conceptForm = {
            ...data,
            img: formatImgToArr(data.img)
          }
        }
      })
      const obj = {
        id
      }
      await getlistRelation(obj).then(response => {
        if (response.status === 1) {
          this.list = response.data.data
        }
      })
      // console.log("handleUpdate")
      this.dialogFormVisible = true
    },
    saveData() {
      this.btnLoading = true
      this.$refs['conceptForm'].validate(valid => {
        if (valid) {
          const _this = this
          const d = deepClone(this.conceptForm)
          d.label = d.label && d.label.join(',')
          d.imgurl = d.imgurl && d.imgurl.join(',')
          d.node_des = JSON.stringify(d.node_des)
          const obj =
            this.oppositeOptions.find(o => o.value === this.oppositeValue)
          if (obj) {
            const sentObj = {
              _id: obj.value,
              name: obj.label
            }
            d.opposite = JSON.stringify([sentObj])
          } else {
            d.opposite = '[]'
          }
          d.sui = '[{"name": "测试", "type": "cn"}]'
          d.id = d.id ? d.id : this.createId
          save(d)
            .then(response => {
              if (response.status === 1) {
                if (!d.id) {
                  d.id = response.data.id
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
          delRelation(id).then(response => {
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
      const id = this.conceptForm.id
      if (d.start_id && d.relation_id && d.end_id) {
        if (d.start_id == id || d.relation_id == id || d.end_id == id) {
          saveRelation(d)
        } else {
          this.$message({
            type: 'error',
            message: '关系链中没有包含当前概念'
          })
        }
      }
    },
    addRelation(o) {
      this.list.push(Object.assign({}, this.baseObj))
    },
    changObj(changeObj, o, prop) {
      o[prop + '_id'] = changeObj.value
      o[prop + '_name'] = changeObj.label
      this.saveRelation(o)
    }
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
  content: '';
}
.clearfix:after {
  clear: both;
}
</style>

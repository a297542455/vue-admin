<template>
  <div class="createPost-container">
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" fullscreen>
      <el-form ref="conceptForm" :model="conceptForm" :rules="rules" label-width="140px" class="form-container">

        <el-form-item label="名称">
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

        <el-form-item label="双向词">
          <el-select v-model="conceptForm.twoway" placeholder="是否双向词" clearable size="small" required>
            <el-option label="是" value="1"/>
            <el-option label="否" value="0"/>
          </el-select>
        </el-form-item>

        <el-form-item label="摘要">
          <el-input v-model="conceptForm.summary" :rows="1" :maxlength="100" type="textarea" class="article-textarea" autosize placeholder="摘要" />
          <!-- <span v-show="contentShortLength" class="word-counter">剩余 {{ 100 - contentShortLength }} 字符</span> -->
        </el-form-item>

        <el-form-item prop="content" label="内容">
          <Tinymce ref="editor" v-model="conceptForm.content" :height="300" />
        </el-form-item>

        <!-- <el-form-item prop="relation" label="关系">
          <el-select v-model="conceptForm.relation" placeholder="是否双向词" clearable size="small" required>
            <el-option label="是" value="1"/>
            <el-option label="否" value="0"/>
          </el-select>
        </el-form-item> -->

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="btnLoading" type="primary" @click="saveData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import Sticky from '@/components/Sticky' // 粘性header组件
import { getInfo, save, getlabelList } from '@/api/wiki/concept'
import Upload from '@/components/Upload/image'
import { formatImgToArr, getNowTime } from '@/utils'
import { validatePhone, validateEmail } from '@/utils/validate'
import myconfig from '@/config'

const defaultForm = {
  id: '',
  name: '',
  label: [],
  sui: '',
  twoway: '',
  summary: '', // 文章摘要
  content: '', // 文章内容
}

export default {
  name: 'ConceptForm',
  components: { Upload, Tinymce, Sticky },
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
    }
  },
  computed: {
    contentShortLength() {
      console.log(123, this.conceptForm)
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
    conceptForm: {
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
        getlabelList({ keyword }).then(response => {
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
      this.conceptForm = Object.assign({}, defaultForm)
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.currentIndex = -1
      this.$nextTick(() => {
        this.$refs['conceptForm'].clearValidate()
      })
    },
    handleUpdate(id) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const _this = this
      getInfo(id).then(response => {
        if (response.status === 1) {
          const data = response.data
          _this.conceptForm = response.data
          _this.conceptForm.label = []
          _this.options = []
          data.label &&
            data.label.map(o => {
              _this.options.push({ value: `${o.pname}`, label: `${o.pname}` })
              _this.conceptForm.label.push(o.pname)
            })
        }
      })
      this.$nextTick(() => {
        this.$refs['conceptForm'].clearValidate()
      })
    },
    saveData() {
      this.btnLoading = true
      this.$refs['conceptForm'].validate(valid => {
        if (valid) {
          const _this = this
          const d = this.conceptForm
          d.label = d.label.join(',')
          d.opposite = '[{"_id": "1", "name": "cn"}]'
          d.sui = '[{"name": "测试", "type": "cn"}]'
          save(d)
            .then(response => {
              if (response.status === 1) {
                if (!d.id) {
                  d.id = response.data
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
    }
  }
}
</script>


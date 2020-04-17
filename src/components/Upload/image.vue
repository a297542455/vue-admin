<template>
  <div class="upload-container">
    <el-upload
      :show-file-list="true"
      :data="dataobj"
      :multiple="multiple"
      :name="fileName"
      :accept="accept"
      :drag="drag"
      :limit="limit"
      :file-list="fileList"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :on-progress="onProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :headers="{'x-access-token':this.$store.getters.token}"
      action="http://wiki.geehealth.cn:8080/upload/uploadPhotos"
      class="image-uploader"
      list-type="picture-card">
      <i class="el-icon-plus"/>
    </el-upload>
  </div>
</template>

<script>
import { getArrByKey } from '@/utils'
import { getId } from '@/api/public'
import openWindow from '@/utils/openWindow'
export default {
  name: 'ImageUpload',
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    id: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default() {
        return {
          fileName: 'file',
          limit: 5,
          multiple: false,
          accept: 'image/*',
          action: '/upload/uploadPhotos',
          drag: false
        }
      }
    }
  },
  data() {
    return {
      limit: this.config.limit,
      fileName: this.config.fileName,
      multiple: this.config.multiple,
      accept: this.config.accept,
      action: this.config.action,
      drag: this.config.drag,
      dataobj: {}
    }
  },
  computed: {
    fileList() {
      let a = []
      const imgarr = []
      if (this.value === '') {
        return []
      }
      if (typeof this.value === 'string') {
        a = this.value.split(',')
      }
      for (let i = 0; i < a.length; i++) {
        imgarr.push({ url: a[i] })
      }
      return imgarr
    }
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val)
    },
    handleRemove(file, fileList) {
      if (fileList.length > 0) {
        this.emitInput(getArrByKey(fileList, 'url'))
      } else {
        this.emitInput([])
      }
    },
    handlePreview(file) {
      console.log('handlePreview')
      openWindow(file.url, '图片预览', '500', '400')
    },
    handleExceed(files, fileList) {
      console.log('handleExceed')
      this.$message.error('最多上传' + this.limit + '张图片')
    },
    async beforeUpload(file) {
      if (!this.picId) {
        await getId()
          .then(response => {
            if (response.status === 1) {
              this.dataObj.id = response.data.id
            }
          })
          .catch(error => {
            return false
          })
      } else {
        this.dataObj.id = this.picId
      }
      this.dataObj.pic = file
      return true
    },
    onProgress(event, file, fileList) {
      console.log('========onProgress=========')
      console.log(event, file, fileList)
      console.log('========onProgress=========')
    },
    handleSuccess(res, file, fileList) {
      console.log('handleSuccess')
      console.log(res)
      console.log(file)
      console.log(fileList)
      if (res.status === 1) {
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i]['uid'] === file['uid']) {
            fileList[i]['url'] = res.data.url
            break
          }
        }
        this.emitInput(getArrByKey(fileList, 'url'))
      } else {
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i]['uid'] === file['uid']) {
            fileList.splice(i, 1)
            break
          }
        }
        this.$message.error(res.msg)
      }
    },
    handleError(err, file, fileList) {
      this.$message.error(err)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.image-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 160px;
    height: 160px;
    .el-upload-dragger {
      height: 100%;
    }
    &:hover {
      border-color: #409eff;
    }
  }
  .el-upload-list__item {
    width: 160px;
    height: 160px;
  }
  .image {
    width: 178px;
    height: 178px;
    display: block;
  }
  .image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
}
</style>

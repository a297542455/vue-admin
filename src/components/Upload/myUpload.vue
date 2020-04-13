<template>
  <div>
    <el-upload
      :data="dataObj"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-upload="beforeAvatarUpload"
      :on-success="handleSuccess"
      :file-list="fileList"
      :headers="{'x-access-token':this.$store.getters.token}"
      :action="'/upload/uploadPhotos'"
      list-type="picture-card">
      <i class="el-icon-plus"></i>
    </el-upload>

    <el-dialog :visible.sync="dialogVisible">
      <img :src="dialogImageUrl" width="100%" alt="">
    </el-dialog>
  </div>
</template>
<script>
import { getArrByKey } from '@/utils'
import { getId } from '@/api/public'
export default {
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      picId: this.id,
      dataObj: {},
      dialogImageUrl: '',
      dialogVisible: false
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
  mounted() {
    console.log('id', this.picId)
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg'
      // const isLt2M = file.size / 1024 / 1024 < 2

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!')
      // }
      // if (!isLt2M) {
      //   this.$message.error('上传头像图片大小不能超过 2MB!')
      // }
      // return isJPG && isLt2M
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
    handleError(err, file, fileList) {
      this.$message.error(err)
    },
    handleSuccess(res, file, fileList) {
      console.log(this.picId)
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
    }
  }
}
</script>

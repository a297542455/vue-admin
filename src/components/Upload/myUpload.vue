<template>
  <div>
    <el-upload
      :data="dataObj"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-upload="beforeAvatarUpload"
      :on-success="handleSuccess"
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
      needId: this.id,
      dataObj: {},
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  mounted() {
    console.log('id', this.needId)
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
      // console.log(file)
      // this.dataObj = { id: '123456', pic: file }
      if (!this.needId) {
        await getId()
          .then(response => {
            if (response.status === 1) {
              this.dataObj.id = response.data.id
            }
          })
          .catch(error => {
            return false
          })
        this.dataObj.pic = file
        return true
      }
    },
    handleError(err, file, fileList) {
      this.$message.error(err)
    },
    handleSuccess(res, file, fileList) {
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

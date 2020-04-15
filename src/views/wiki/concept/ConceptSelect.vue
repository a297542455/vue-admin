<template>
  <el-select
    v-model="svalue"
    :remote-method="remoteMethod"
    :loading="loading"
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
</template>

<script>
import { getConceptlist } from '@/api/wiki/concept'
export default {
  name: 'ConceptSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      loading: false,
      options: [],
      svalue: this.value,
    }
  },
  watch: {
    //  判断下拉框的值是否有改变
    svalue(val, oldVal) {
      if (val != oldVal) {
        this.$emit('input', this.svalue);
        this.$emit('changObj', this.options.find(o => o.value === this.svalue));
      }
    },
  },
  mounted() {
    this.svalue = this.value;//  初始话下拉框的值
    this.remoteMethod(this.svalue)
  },
  created() {},
  destroyed() {},
  methods: {
    remoteMethod(keyword) {
      if (keyword !== '') {
        this.loading = true
        getConceptlist({ keyword }).then(response => {
          const data = response.data.data
          this.options = data.map(o => {
            return { value: `${o.id}`, label: `${o.name}` }
          })
          this.loading = false
        })
      } else {
        this.options = [];
      }
    },
  }
}
</script>

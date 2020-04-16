<template>
  <div class="app-container">
    <!-- 操作 -->
    <el-row style="margin-bottom: 10px;">
      <el-col :xs="24" :sm="24" :lg="24">
        <el-tooltip content="刷新" placement="top">
          <el-button v-waves type="warning" icon="el-icon-refresh" circle @click="handleFilterClear"/>
        </el-tooltip>
        <el-tooltip content="添加" placement="top">
          <el-button v-waves type="success" icon="el-icon-plus" circle @click="handleCreate"/>
        </el-tooltip>
        <!-- <el-tooltip content="删除" placement="top">
          <el-button v-waves :loading="deleting" :disabled="buttonDisabled" type="danger" icon="el-icon-delete" circle @click="handleDeleteAll()"/>
        </el-tooltip> -->
        <el-tooltip content="更多" placement="top">
          <el-dropdown trigger="click" placement="bottom" style="margin-left: 10px;" @command="handleCommand">
            <el-button :disabled="buttonDisabled" type="Info" circle>
              <i class="el-icon-more"/>
            </el-button>
            <el-dropdown-menu slot="dropdown" >
              <el-dropdown-item command="1">设为正常</el-dropdown-item>
              <el-dropdown-item command="0">设为禁用</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      ref="table"
      :data="list"
      :load="load"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      lazy
      @selection-change="handleSelectionChange">
      <el-table-column label="姓名">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="120px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button v-waves type="primary" icon="el-icon-edit-outline" circle @click="handleUpdate(scope.$index,scope.row.id)"/>
          <el-button v-waves :loading="scope.row.delete" type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.$index,scope.row.id)"/>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单 -->
    <labelForm ref="fromRules" :rule-list="list" @updateRow="updateRow"/>

  </div>
</template>

<script>
import { getlist, del, change, delAll, changeAll } from '@/api/wiki/label'
import waves from '@/directive/waves' // 水波纹指令
import { getArrByKey } from '@/utils'
import tree from '@/utils/tree'
import labelForm from './label/form'
import treeTable from '@/components/TreeTable'

export default {
  name: 'Label',
  components: { labelForm, treeTable },
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '禁用',
        1: '正常'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      selectedRows: null,
      listLoading: true,
      expandAll: true,
      columns: [
        {
          text: '名称',
          value: 'title'
        }
      ],
      listQuery: {
        status: '-1',
        title: ''
      },
      buttonDisabled: true,
      deleting: false,
    }
  },
  computed: {},
  watch: {},
  created() {
    this.fetchList()
  },
  methods: {
    load(tree, treeNode, resolve) {
      console.table(tree)
      console.table(treeNode)
      const obj = {
        ...this.listQuery,
        pid: tree.id
      }
      getlist(obj).then(response => {
        resolve(response.data.data)
      })
    },
    fetchList() {
      this.listLoading = true
      // const obj = {
      //   ...this.listQuery,
      //   time: new Date()
      // }
      getlist(this.listQuery).then(response => {
        this.list = response.data.data
        this.listLoading = false
      })
    },
    handleFilterClear() {
      this.listQuery = {
        status: '-1',
        title: ''
      }
      this.fetchList()
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.buttonDisabled = false
      } else {
        this.buttonDisabled = true
      }
      this.selectedRows = val
    },
    handleCreate() {
      this.$refs.fromRules.handleCreate()
    },
    handleUpdate(index, id) {
      this.$refs.fromRules.handleUpdate(id)
    },
    updateRow(temp) {
      const { relatePids } = temp
      // console.log(relatePids, "relatePids")
      // console.log(temp, "temp")
      if (relatePids && !relatePids.length) {
        this.fetchList()
        return
      }
      relatePids.map(o => {
        const obj = {
          ...this.listQuery,
          pid: o
        }
        getlist(obj).then(response => {
          if (response.status === 1) {
            this.$set(this.$refs.table.store.states.lazyTreeNodeMap, o, response.data.data)
          }
        })
      })
    },
    handleDelete(index, id) {
      const _this = this
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const delObj = { delete: true }
          _this.list = tree.upadteArr(_this.list, 'id', id, delObj)
          del(id)
            .then(response => {
              if (response.status === 1) {
                _this.$notify.success(response.msg)
                _this.fetchList()
              } else {
                _this.$notify.error(response.msg)
              }
              const delObj = { delete: false }
              _this.list = tree.upadteArr(_this.list, 'id', id, delObj)
            })
            .catch(error => {
              const delObj = { delete: false }
              _this.list = tree.upadteArr(_this.list, 'id', id, delObj)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleDeleteAll() {
      const _this = this
      if (this.selectedRows.length > 0) {
        this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            _this.deleting = true
            const ids = getArrByKey(_this.selectedRows, 'id')
            const idstr = ids.join(',')
            delAll({ ids: idstr })
              .then(response => {
                if (response.status === 1) {
                  _this.$message.success(response.msg)
                  _this.fetchList()
                } else {
                  _this.$message.error(response.msg)
                }
                _this.deleting = false
              })
              .catch(error => {
                _this.deleting = false
              })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else {
        _this.$message.error('请选择要删除的数据')
      }
    },
    handleCommand(command) {
      const _this = this
      if (this.selectedRows.length > 0) {
        const ids = getArrByKey(this.selectedRows, 'id')
        const idstr = ids.join(',')
        changeAll({ val: idstr, field: 'status', value: command })
          .then(response => {
            if (response.status === 1) {
              _this.$message.success(response.msg)
              _this.fetchList()
            } else {
              _this.$message.error(response.msg)
            }
          })
          .catch(error => {})
      } else {
        _this.$message.error('请选择要操作的数据')
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.text-red {
  color: red;
  cursor: pointer;
}
.text-green {
  color: green;
  cursor: pointer;
}
</style>

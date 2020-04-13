<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div v-if="showSearch" class="filter-container">
      <el-form :inline="true" :model="listQuery" class="form-inline">
        <el-form-item label="">
          <el-input v-model="listQuery.userName" placeholder="用户名" clearable size="small"/>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="listQuery.phone" placeholder="手机号" clearable size="small"/>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="listQuery.realName" placeholder="姓名" clearable size="small"/>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="listQuery.isEnabled" placeholder="状态" clearable size="small">
            <el-option label="全部" value="-1"/>
            <el-option label="正常" value="1"/>
            <el-option label="禁用" value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-date-picker v-model="dateTime" :picker-options="pickerOptions" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" align="right" clearable size="small"/>
        </el-form-item>
        <el-form-item>
          <el-button v-waves type="primary" icon="el-icon-search" size="small" @click="handleFilter">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-waves type="warning" icon="el-icon-refresh" size="small" @click="handleFilterClear">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作 -->
    <el-row style="margin-bottom: 10px;">
      <el-col :xs="24" :sm="24" :lg="24">
        <el-tooltip content="刷新" placement="top">
          <el-button v-waves type="warning" icon="el-icon-refresh" circle @click="handleFilterClear"/>
        </el-tooltip>
        <el-tooltip content="添加" placement="top">
          <el-button v-waves type="success" icon="el-icon-plus" circle @click="handleCreate"/>
        </el-tooltip>
        <el-tooltip content="搜索" placement="top">
          <el-button v-waves type="primary" icon="el-icon-search" circle @click="showSearch = !showSearch"/>
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
    <el-row :gutter="20">
      <el-col :span="6">
        <el-table
          v-loading="listLoading"
          ref="table"
          :data="list"
          :load="load"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          border
          fit
          highlight-current-row
          row-key="id"
          lazy
          @row-click="rowClick"
          @selection-change="handleSelectionChange">
          <el-table-column label="姓名">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>

      <el-col :span="18">
        <el-table
          v-loading="conceptlistLoading"
          :data="conceptList"
          row-key="id"
          border
          fit
          highlight-current-row
          style="width: 100%;">
          <el-table-column label="名称">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="摘要">
            <template slot-scope="scope">
              <span>{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding">
            <template slot-scope="scope">
              <el-tooltip content="编辑" placement="top">
                <el-button v-waves type="primary" icon="el-icon-edit-outline" circle @click="handleUpdate(scope.$index,scope.row.id)"/>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button v-waves :loading="scope.row.delete" type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.$index,scope.row.id)"/>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[100,20,30, 50]" :page-size="listQuery.psize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <!-- 表单 -->
    <adminForm ref="conceptForm" @updateRow="updateRow"/>

  </div>
</template>

<script>
import { getlist, getConceptlist, del, save, getInfo } from '@/api/wiki/concept'
import waves from '@/directive/waves'
import { parseTime, pickerOptions, getArrByKey } from '@/utils'
import adminForm from './concept/form'
import openWindow from '@/utils/openWindow'

export default {
  name: 'Concept',
  components: { adminForm },
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
      currentRow: {},
      list: [],
      conceptList: [],
      total: null,
      concepttotal: null,
      selectedRows: null,
      listLoading: true,
      conceptlistLoading: false,
      showSearch: false,
      listQuery: {
        page: 1,
        psize: 10,
        isEnabled: '-1',
        userName: '',
        phone: '',
        realName: '',
        startTime: '',
        endTime: ''
      },
      buttonDisabled: true,
      deleting: false,
      dateTime: '',
      pickerOptions: pickerOptions,
      currentIndex: -1,
      isEdit: false
    }
  },
  watch: {
    dateTime: function(val) {
      this.listQuery.startTime = val[0]
      this.listQuery.endTime = val[1]
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    load(tree, treeNode, resolve) {
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
      getlist(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchList()
    },
    handleFilterClear() {
      this.currentRow = {}
      this.listQuery = {
        page: 1,
        psize: 100,
        isEnabled: '-1',
        userName: '',
        phone: '',
        realName: '',
        startTime: '',
        endTime: ''
      }
      this.dateTime = ''
      this.fetchList()
    },
    handleSizeChange(val) {
      this.listQuery.psize = val
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
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
      this.$refs.conceptForm.handleCreate()
    },
    handleUpdate(index, id) {
      this.$refs.conceptForm.handleUpdate(id)
    },
    rowClick(row, column, event) {
      this.conceptlistLoading = true
      this.currentRow = row
      getConceptlist({
        label: this.currentRow.name
      }).then(response => {
        this.conceptList = response.data.data
        this.concepttotal = response.data.total
        this.conceptlistLoading = false
      })
      // this.currentIndex = index
      // this.$refs.conceptForm.handleUpdate(id)
    },
    updateRow(temp) {
      getConceptlist({
        label: this.currentRow.name
      }).then(response => {
        this.conceptList = response.data.data
        this.concepttotal = response.data.total
        this.conceptlistLoading = false
      })
      // if (this.currentIndex >= 0 && temp.id) {
      //   this.conceptList.splice(this.currentIndex, 1, temp)
      // } else {
      //   if (this.conceptList.length >= 10) {
      //     this.conceptList.pop()
      //   }
      //   this.conceptList.unshift(temp)
      //   this.total = this.total + 1
      // }
      this.currentIndex = -1
    },
    handleDelete(index, id) {
      const _this = this
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          _this.$set(_this.conceptList[index], 'delete', true)
          del(id)
            .then(response => {
              if (response.status === 1) {
                _this.conceptList.splice(index, 1)
                _this.total = _this.total - 1
                _this.$notify.success(response.msg)
              } else {
                _this.$notify.error(response.msg)
              }
              _this.$set(_this.conceptList[index], 'delete', false)
            })
            .catch(error => {
              _this.$set(_this.conceptList[index], 'delete', false)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleCommand(command) {}
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

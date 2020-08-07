<template>
  <div class="router-table">
    <div class="seach">
      <el-input v-model="seachValue"></el-input>
      <el-button @click="seach">搜索</el-button>
    </div>
    <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      border
    >
      <el-table-column
        prop="id1"
        label="一级模块id"
        width="100px"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="id2"
        label="二级模块id"
        width="100px"
      >
      </el-table-column>
      <el-table-column
        prop="id3"
        label="三级模块id"
        width="100px"
      >
      </el-table-column>
      <el-table-column
        prop="routeName"
        label="路由名称"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="urlAddress"
        label="url地址"
        width="240px"
      >
      </el-table-column>
      <el-table-column
        prop="secondary"
        label="次级"
      >
        <template slot-scope="scope">
          <div 
          v-for="(item,idx) in scope.row.secondary"
          :key="idx"
          >{{item}}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import menuData from '@/common/json/menuRouterMap'
import _ from 'lodash'
export default {
  name: 'RouterTable',
  components: {
  },
  data(){
    return{
      tableData:[],
      seachValue:'',
      tableDataCache:[]
    }
  },
  mounted(){
    this.routeHandle()
  },
  methods:{
    seach(){
      this.tableData = this.tableDataCache.filter(item => {
        return item.routeName.indexOf(this.seachValue) > -1
      })
    },
    routeHandle(){
      let routeObj = {}
      for(let i in menuData){
        let keyArr = i.split('-')
        if(keyArr.length === 3 && menuData[i].path){
          let obj = {
            id1:keyArr[0],
            id2:[keyArr[0],keyArr[1]].join('-'),
            id3:i,
            routeName:menuData[i].name,
            urlAddress:menuData[i].path,
            secondary:[]
          }
          routeObj[i] = obj
        }
        if(keyArr.length === 4){
          let sKey = [keyArr[0],keyArr[1],keyArr[2]].join('-')
          routeObj[sKey].secondary.push(`${i}:${menuData[i].name}`)
        }
      }
      this.tableData = Object.values(routeObj)
      this.tableDataCache = _.cloneDeep(this.tableData)
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }){

    }
  }
}

</script>
<style lang="scss" scoped>
</style>

<template>
  <div class="home">
    <ul class="router_btn">
      <li
      v-for="(item, index) in routerBtn"
      :key="index"
      @click="routerBtnClick(item.value)"
      >{{item.label}}</li>
    </ul>
    <router-view class="content" name="content" ></router-view>
  </div>
</template>

<script>
import Canvas2 from './Canvas2'
import GoBang from './gobang'
import RouterTable from './routerTable'
import Konva from './konva'
export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      routerBtn:[
        {
          label:'golly',
          value:'/canvas2'
        },
        {
          label:'五子棋',
          value:'/gobang'
        },
        {
          label:'表格渲染测试',
          value:'/routerTable'
        },
        {
          label:'konvaGame',
          value:'/konva'
        },
        {
          label:'TD',
          value:'/TD'
        }
      ]
    }
  },
  methods:{
    routerBtnClick(path){
      this.$router.push(path)
    }
  }
}

</script>
<style lang="scss" scoped>
.home{
  padding: 15px;
  box-sizing: border-box;
  .router_btn{
    display: flex;
    li{
      padding: 5px 10px;
      margin-right: 10px;
      margin-bottom: 10px;
      border: 1px solid #333;
      border-radius: 2px;
      cursor: pointer;
      &:hover{
        background-color: #eee;
      }
    }
  }
}
</style>

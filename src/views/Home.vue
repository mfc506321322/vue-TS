<template>
  <div class="home">
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
  }
}

</script>
<style lang="scss" scoped>
.home{
  width: 100%;
  height: 100%;
}
</style>

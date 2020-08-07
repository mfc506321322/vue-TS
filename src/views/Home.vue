<template>
  <div class="home">
    <!-- <Canvas2></Canvas2> -->
    <GoBang></GoBang>
    <!-- <RouterTable></RouterTable> -->
  </div>
</template>

<script>
import Canvas2 from './Canvas2'
import GoBang from './gobang'
import RouterTable from './routerTable'
export default {
  name: 'Home',
  components: {
    Canvas2,
    GoBang,
    RouterTable
  }
}

</script>
<style lang="scss" scoped>
.home{
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>

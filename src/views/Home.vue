<template>
  <div class="home">
    <!-- <Canvas2></Canvas2> -->
    <GoBang></GoBang>
  </div>
</template>

<script>
import Canvas2 from './Canvas2'
import GoBang from './gobang'
export default {
  name: 'Home',
  components: {
    Canvas2,
    GoBang
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

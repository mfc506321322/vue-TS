<template>
  <div class="home">
    <Canvas2></Canvas2>
  </div>
</template>

<script>
import Canvas2 from './Canvas2'
export default {
  name: 'Home',
  components: {
    Canvas2
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

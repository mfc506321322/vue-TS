<template>
  <div class="block_box">
    <div class="block_item">
      <div 
        :class="`block_content ${boxData.isEnemy ? 'enemy_item' : ''}`"
        @click="clickBlock(boxData)"
        @dblclick="dbClickBlock(boxData)"
        @mouseenter="enterBlock(boxData, true)"
        @mouseleave="enterBlock(boxData, false)"
      >
        <span class="block_title">{{boxData.isEnemy ? boxData.descName : boxData.name}}</span>
        <span class="block_text">等级：{{boxData.level}}</span>
      </div>
      <em>{{itemIndex}}</em>
    </div>
  </div>
</template>
<script>
let timer = null
export default {
  name: 'RoleBlock',
  components: {},
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    itemIndex: {
      type: Number
    }
  },
  data() {
    return {
      boxData:{}
    }
  },
  filters: {},
  computed: {
  },
  created() {
  },
  mounted() {
    this.boxData = this.data
  },
  watch: {
  },
  methods: {
    clickBlock(item){
      this.$emit('clickBlock', item)
    },
    dbClickBlock(item){
      this.$emit('dbClickBlock', item)
    },
    enterBlock(item, type){
      if(timer){
        clearTimeout(timer)
        timer = null
      }
      if(type){
        timer = setTimeout(() => {
          this.$emit('enterBlock', item, type)
        }, 100)
      }else{
        this.$emit('enterBlock', item, type)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.enemy_item{
  background-color: rgb(253, 120, 120);
}
.block_box{
  .block_item{
    width: 80px;
    height: 45px;
    border: 1px solid #666;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    .block_content{
      width: 100%;
      height: 100%;
      padding: 4px;
      box-sizing: border-box;
      color: #333;
      cursor: pointer;
      position: relative;
      &>span{
        display: block;
        font-size: 12px;
      }
      .block_title{
        margin-bottom: 3px;
      }
      .block_text{
        margin-left: -2px;
        transform: scale(0.9);
      }
    }
    &:hover{
      border: 1px solid rgb(255, 166, 32);
      .block_content{
        background-color: rgba(255, 166, 32, 0.5);
      }
    }
    em{
      position: absolute;
      right: 2px;
      bottom: 2px;
      z-index: 2;
      font-size: 12px;
      color: #606266;
    }
  }
}
</style>

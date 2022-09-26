<template>
  <div class="virtual_buttons_box">
    <div class="button_box rotate1">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="38"
      ></el-button>
    </div>
    <div class="button_box rotate2">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="38,39"
      ></el-button>
    </div>
    <div class="button_box rotate3">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="39"
      ></el-button>
    </div>
    <div class="button_box rotate4">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="39,40"
      ></el-button>
    </div>
    <div class="button_box rotate5">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="40"
      ></el-button>
    </div>
    <div class="button_box rotate6">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="40,37"
      ></el-button>
    </div>
    <div class="button_box rotate7">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="37"
      ></el-button>
    </div>
    <div class="button_box rotate8">
      <el-button 
        icon="el-icon-top" 
        circle
        class="virtual_btn"
        data-key="37,38"
      ></el-button>
    </div>
    <el-button 
      type="primary" 
      icon="el-icon-sunny" 
      circle 
      class="center_btn virtual_btn"
      data-key="90"
    ></el-button>
  </div>
</template>
<script>

export default {
  name:'VirtualButtons',
  components: {
  },
  props:{
    isShow:{
      type:Boolean,
      default:false
    },
  },
  data(){
    return {
    }
  },
  filters: {},
  computed: {
  },
  created() {
  },
  mounted() {
    let btns = document.querySelectorAll('.virtual_btn')
    btns.forEach(item => {
      let key = item.getAttribute('data-key')
      item.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.$emit('virtualBtnDown', key)
      }, false);
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.$emit('virtualBtnUp', key)
      }, false);
    })
  },
  watch: {},
  methods:{
  }
}
</script>
<style lang="scss" scoped>
  .virtual_buttons_box{
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    // background: pink;
    width: 170px;
    height: 170px;
    opacity: 0.85;
    z-index: 1998;
    .button_box{
      position: absolute;
      top: 0;
      left: 65px;
      transform-origin: 50% 212.5%;
      .virtual_btn{
      }
    }
    .rotate2{
      transform: rotateZ(45deg);
    }
    .rotate3{
      transform: rotate(90deg);
    }
    .rotate4{
      transform: rotate(135deg);
    }
    .rotate5{
      transform: rotate(180deg);
    }
    .rotate6{
      transform: rotate(225deg);
    }
    .rotate7{
      transform: rotate(270deg);
    }
    .rotate8{
      transform: rotate(315deg);
    }
  }
  .center_btn{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
</style>

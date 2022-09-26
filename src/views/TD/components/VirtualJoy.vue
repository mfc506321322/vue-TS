<template>
  <div class="virtual_joy_area">
    <div class="virtual_joy_box">
      <v-stage
        ref="stage"
        :config="configKonva"
        class="stage"
      >
        <v-layer ref="layer">
          <v-circle
            ref="circle"
            @dragmove="dragBoundFunc"
            @dragend="dragendFunc"
            :config="{
              x: configKonva.width / 2,
              y: configKonva.height / 2,
              radius: 20,
              fill: '#0033FF',
              draggable: true
            }"
          />
        </v-layer>
      </v-stage>
    </div>
    <el-button 
      type="primary" 
      icon="el-icon-sunny" 
      circle 
      class="virtual_btn"
      data-key="90"
    ></el-button>
    <el-button 
      type="primary" 
      icon="el-icon-sunny" 
      circle 
      class="virtual_btn left"
      data-key="90"
    ></el-button>
  </div>
</template>
<script>

export default {
  name:'VirtualJoy',
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
      configKonva:{
        width: 130,
        height: 130,
      },
      joyP:{
        x:0,
        y:0
      }
    }
  },
  filters: {},
  computed: {
  },
  created() {
    this.joyP = {
      x:this.configKonva.width / 2,
      y:this.configKonva.height / 2
    }
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

    this.$refs.circle.getNode().dragBoundFunc((pos) => {
      let x = this.configKonva.width / 2,
      y = this.configKonva.height / 2,
      radius = 45,
      scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2))

      if (scale < 1){
        return {
          x: Math.round((pos.x - x) * scale + x),
          y: Math.round((pos.y - y) * scale + y)
        }
      }else{
        return pos
      }
    })
  },
  watch: {},
  methods:{
    dragBoundFunc(pos){
      let {
        x,
        y
      } = pos.target.attrs,
      wx = this.configKonva.width / 2,
      hy = this.configKonva.height / 2

      this.joyP = {
        x,
        y
      }
      this.$emit('virtualJoyFn', this.joyP, {
        wx,
        hy
      })
    },
    dragendFunc(e){
      let wx = this.configKonva.width / 2,
      hy = this.configKonva.height / 2

      e.target.x(wx)
      e.target.y(hy)
      this.$refs.stage.getNode().draw()
      this.$emit('virtualJoyFn', {
        x:wx,
        y:hy
      }, {
        wx,
        hy
      }, 'end')
    }
  }
}
</script>
<style lang="scss" scoped>
.virtual_joy_area{
  width: 100%;
  height: 130px;
  position: fixed;
  bottom: 30px;
  left: 0;
  z-index: 1998;
  background-color: rgba($color: #000000, $alpha: 0.05);
}
.virtual_joy_box{
  width: 130px;
  height: 130px;
  box-sizing: border-box;
  background: rgb(190, 208, 255);
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  opacity: 0.7;
}
.virtual_btn{
  position: absolute;
  bottom: 20px;
  right: 50px;
  &.left{
    right: auto;
    left: 50px;
  }
}
/deep/ .el-button+.el-button{
  margin-left: 0;
}
</style>

<template>
  <div>
    <div class="canvas-box">
      <canvas
      id="game"
      :width="table.wd"
      :height="table.wd"
      ref="canvas"
      @click="clickCanvas"
      ></canvas>
      <canvas
      id="background"
      :width="table.wd"
      :height="table.wd"
      ref="canvasBackground"
      ></canvas>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'GoBang',
  data () {
    return {
      table:{
        wd:500
      },
      ctx:null,
      deg:Math.PI/180,
      cell:{
        wd:20
      },
      num:0,
      pieces:0,
      borderColor:'#bbb',
      lineWidth:1,
      rcwd:0,//真实单元格宽度
      value:{},
      datas:[],
      init:0,
      config:{
        cellSize:20,
        boxSize:25,
        speed:100
      }
    }
  },
  created(){
    this.value = {...this.config}
    this.num = this.table.wd / this.cell.wd + 1
    this.table.wd = this.table.wd + this.num - 2
    this.rcwd = this.cell.wd + this.lineWidth

    let arr = []
    arr.length = Math.pow(this.config.boxSize,2)
    arr.fill({
      colorType:0,
      value:0
    })
    this.datas = arr
  },
  mounted(){
    this.ctx = this.$refs.canvas.getContext('2d')
    this.drawLines(this.$refs.canvasBackground.getContext('2d'))
  },
  watch:{
    'config.boxSize':function(){
      let arr = []
      arr.length = Math.pow(this.config.boxSize,2)
      arr.fill({
        colorType:0,
        value:0
      })
      this.datas = arr
    },
    datas:function(){
      this.drawCells()
    }
  },
  methods:{
    drawLines(ctx){
      ctx.clearRect(0,0,this.table.wd,this.table.wd)
      let padding = (this.cell.wd - this.lineWidth) / 2
      for(let i=0;i<(this.num - 1);i++){
        let point = i * this.rcwd + padding + this.lineWidth / 2
        let length = this.table.wd - padding
        ctx.beginPath()
        ctx.strokeStyle = this.borderColor
        ctx.lineWidth = this.lineWidth
        ctx.moveTo(point, padding)
        ctx.lineTo(point, length)
        ctx.closePath()
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = this.borderColor
        ctx.lineWidth = this.lineWidth
        ctx.moveTo(padding, point)
        ctx.lineTo(length, point)
        ctx.closePath()
        ctx.stroke()
      }
    },
    drawCells(){
      let ctx = this.ctx
      ctx.clearRect(0,0,this.table.wd,this.table.wd)
      for(let i=0;i<this.datas.length;i++){
        if(this.datas[i].value){
          let x = i % this.config.boxSize
          let y = Math.floor(i / this.config.boxSize)
          ctx.beginPath();
          ctx.arc(x * this.rcwd + this.cell.wd / 2,y * this.rcwd + this.cell.wd / 2,this.cell.wd / 2, 0, 360 * this.deg);
          ctx.closePath();
          if(this.datas[i].colorType === 1){
            ctx.fillStyle = "#000";
          }else{
            ctx.fillStyle = "#fff";
          }
          ctx.fill();
        }
      }
    },
    clickCanvas(e){
      let xnum = Math.floor(e.offsetX / this.rcwd)
      let ynum = Math.floor(e.offsetY / this.rcwd)

      let index = ynum * this.config.boxSize + xnum
      ++this.pieces
      if(this.datas[index].value){
        this.datas[index] = {
          colorType:this.pieces % 2 === 0 ? 1 : 2,
          value:0
        }
        this.init--
      }else{
        this.datas[index] = {
          colorType:this.pieces % 2 === 0 ? 1 : 2,
          value:1
        }
        this.init++
      }
      this.datas = _.cloneDeep(this.datas)
    }
  }
}
</script>

<style lang="scss" scoped>
.canvas-box{
  position: relative;
  #game{
    position: relative;
    z-index: 2;
  }
  #background{
    position: absolute;
    top: 0;
    left: 0;
    background: rgb(255, 230, 150);
  }
}
</style>

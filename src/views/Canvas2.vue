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
    <div class="config">
      <div><span>速度:</span><input type="number" v-model.number="value.speed"><span>毫秒/次</span></div>
      <div><span>区域大小:</span><input type="number" v-model.number="value.boxSize"><span>个/每行</span></div>
      <div><span>方格大小:</span><input type="number" v-model.number="value.cellSize"><span>px</span></div>
      <div><span>代数:{{generations}}</span>///<span>初始个体:{{init}}</span>///<span>存活个体:{{survive}}</span></div>
      <div><span>性能分数:{{performanceScore}}</span></div>
      <div class="btn">
        <button @click="saveClick">save</button>
        <button @click="startClick" :disabled="start">start</button>
        <button @click="pauseClick" :disabled="!start">pause</button>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Canvas2',
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
      borderColor:'#bbb',
      lineWidth:1,
      rcwd:0,//真实单元格宽度

      value:{},
      datas:[],
      timer:null,
      start:false,
      init:0,
      survive:'--',
      generations:1,
      performanceScore:'--',
      startDate:0,
      startCount:1,
      performanceDate:0,
      config:{
        cellSize:20,
        boxSize:25,
        speed:100
      }
    }
  },
  created(){
    this.value = {...this.config}
    this.num = this.table.wd / this.cell.wd - 1
    this.table.wd = this.table.wd + this.num
    this.rcwd = this.cell.wd + this.lineWidth

    let arr = []
    arr.length = Math.pow(this.config.boxSize,2)
    arr.fill(0)
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
      arr.fill(0)
      this.datas = arr
    },
    datas:function(){
      this.drawCells()
    }
  },
  methods:{
    drawLines(ctx){
      ctx.clearRect(0,0,this.table.wd,this.table.wd)
      for(let i=1;i<=this.num;i++){
        ctx.beginPath()
        ctx.strokeStyle = this.borderColor
        ctx.lineWidth = this.lineWidth
        ctx.moveTo(i * this.rcwd, 0)
        ctx.lineTo(i * this.rcwd, this.table.wd)
        ctx.closePath()
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = this.borderColor
        ctx.lineWidth = this.lineWidth
        ctx.moveTo(0, i * this.rcwd)
        ctx.lineTo(this.table.wd, i * this.rcwd)
        ctx.closePath()
        ctx.stroke()
      }
    },
    drawCells(){
      let ctx = this.ctx
      ctx.clearRect(0,0,this.table.wd,this.table.wd)
      for(let i=0;i<this.datas.length;i++){
        if(this.datas[i]){
          let x = i % this.config.boxSize
          let y = Math.floor(i / this.config.boxSize)
          ctx.fillRect(x * this.rcwd, y * this.rcwd, this.cell.wd, this.cell.wd)
        }
      }
    },
    clickCanvas(e){
      // console.log(e.offsetX,e.offsetY)
      let xnum = Math.floor(e.offsetX / this.rcwd)
      let ynum = Math.floor(e.offsetY / this.rcwd)

      let index = ynum * this.config.boxSize + xnum
      if(this.datas[index]){
        this.datas[index] = 0
        this.init--
      }else{
        this.datas[index] = 1
        this.init++
      }
      this.datas = [...this.datas]
    },
    startClick(){
      if((this.generations - this.startCount) == 100){
        this.performanceDate = new Date()*1
        this.performanceScore = ((this.performanceDate - this.startDate) / 100 - this.config.speed).toFixed(2)
        console.log(this.performanceScore)
        this.startDate = 0
      }
      if(!this.startDate){
        this.startDate = new Date()*1
        this.startCount = this.generations
      }
      this.start = true
      this.newDatas = [...this.datas]
      for(let index=0;index<Math.pow(this.config.boxSize,2);index++){
        let arr = []
        if(this.datas[index - 1] + '' !== 'undefined'){
          arr.push(this.datas[index - 1])
        }else{
          arr.push(this.datas[Math.pow(this.config.boxSize,2) + index - 1])
        }
        if(this.datas[index + 1] + '' !== 'undefined'){
          arr.push(this.datas[index + 1])
        }else{
          arr.push(this.datas[index + 1 - Math.pow(this.config.boxSize,2)])
        }
        if(this.datas[index - this.config.boxSize + 1] + '' !== 'undefined'){
          arr.push(this.datas[index - this.config.boxSize + 1])
        }else{
          arr.push(this.datas[Math.pow(this.config.boxSize,2) + index - this.config.boxSize + 1])
        }
        if(this.datas[index - this.config.boxSize] + '' !== 'undefined'){
          arr.push(this.datas[index - this.config.boxSize])
        }else{
          arr.push(this.datas[Math.pow(this.config.boxSize,2) + index - this.config.boxSize])
        }
        if(this.datas[index - this.config.boxSize - 1] + '' !== 'undefined'){
          arr.push(this.datas[index - this.config.boxSize - 1])
        }else{
          arr.push(this.datas[Math.pow(this.config.boxSize,2) + index - this.config.boxSize - 1])
        }
        if(this.datas[index + this.config.boxSize - 1] + '' !== 'undefined'){
          arr.push(this.datas[index + this.config.boxSize - 1])
        }else{
          arr.push(this.datas[index + this.config.boxSize - 1 - Math.pow(this.config.boxSize,2)])
        }
        if(this.datas[index + this.config.boxSize] + '' !== 'undefined'){
          arr.push(this.datas[index + this.config.boxSize])
        }else{
          arr.push(this.datas[index + this.config.boxSize - Math.pow(this.config.boxSize,2)])
        }
        if(this.datas[index + this.config.boxSize + 1] + '' !== 'undefined'){
          arr.push(this.datas[index + this.config.boxSize + 1])
        }else{
          arr.push(this.datas[index + this.config.boxSize + 1 - Math.pow(this.config.boxSize,2)])
        }
        let newArr = arr.filter(o => {
          return o == true
        })
        if(newArr.length === 3){
          this.newDatas[index] = 1
        }else if(newArr.length === 2){
          if(!this.datas[index]){
            this.newDatas[index] = 0
          }
        }else{
          this.newDatas[index] = 0
        }
      }
      this.datas = [...this.newDatas]
      this.generations++
      if(this.timer){
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.startClick()
      },this.config.speed)
    },
    pauseClick(){
      clearTimeout(this.timer)
      this.timer = null
      this.start = false
      this.survive = this.datas.filter(o => {
        return o == true
      }).length
    },
    saveClick(){
      this.config = {...this.value}
      this.cell.wd = this.config.cellSize
      this.table.wd = this.config.boxSize * this.config.cellSize

      this.num = this.table.wd / this.cell.wd - 1
      this.table.wd = this.table.wd + this.num
      this.rcwd = this.cell.wd + this.lineWidth
      setTimeout(() => {
        this.drawLines(this.$refs.canvasBackground.getContext('2d'))
        this.drawCells()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.canvas-box{
  position: relative;
  #game{
    position: relative;
    z-index: 2
  }
  #background{
    position: absolute;
    top: 0;
    left: 0;
    background: rgb(255, 242, 201);
  }
}
</style>

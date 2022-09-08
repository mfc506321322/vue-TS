<template>
  <div class="TD_box">
    <v-stage
      ref="stage"
      :config="configKonva"
      class="stage"
    >
      <v-layer ref="layer">
        <v-circle 
          :config="{
            x: centerP.x,
            y: centerP.y,
            radius: roleInfo.atkScope,
            stroke: 'blue',
            strokeWidth: 1
          }"
        />
        <v-circle
          @dragmove="dragBoundFunc"
          :config="{
            // x: centerP.x,
            // y: centerP.y,
            x: 300,
            y: 300,
            radius: 10,
            fill: 'blue',
            draggable: true
          }"
        />
        <div class="enemy_box">
          <v-circle
            v-for="(item, idx) in enemyList"
            :key="idx"
            :config="item.config"
          />
          <v-text
            v-for="(item, idx) in damageList"
            :key="item.id"
            :config="item.config"
            v-if="masterTime - item.createTime <= 30"
          />
        </div>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
let timer = null
import _ from 'lodash'
import {
  randomValue
} from '@/common/utils'
export default {
  name: 'TD',
  components: {
  },
  data(){
    return{
      fps:60,
      masterTime:0,
      configKonva: {
        width: 600,
        height: 600,
      },
      centerP:{},
      roleInfo:{
        hp: 10,
        atk: 60,
        atkScope: 0,
        atkInterval: 1
      },
      idCount:0,
      enemyCount:0,
      enemyList:[],
      damageList:[],
      rafIds:[],
      enemyTotal:100
    }
  },
  created(){
    // this.centerP = {
    //   x:this.configKonva.width / 2,
    //   y:this.configKonva.height / 2
    // }
    this.centerP = {
      x:300,
      y:300
    }
  },
  mounted(){
    this.start()
  },
  methods:{
    createEnemy(){
      let enemyObj = {
        id:this.idCount++,
        hp:100,
        def:10,
        atk:1,
        underAtkTime:0,
        speed:randomValue({ min:0.1, max:0.2, decimal:2 }),
        config:{
          x: randomValue({ min:-10, max:this.configKonva.width + 10 }),
          y: randomValue({ min:-10, max:this.configKonva.height + 10 }),
          radius: 5,
          fill: 'red'
        }
      }

      if((enemyObj.config.x > 0 && enemyObj.config.x < this.configKonva.width) && (enemyObj.config.y > 0 && enemyObj.config.y < this.configKonva.height)){
        return this.createEnemy()
      }else{
        // console.log('enemyObj', enemyObj)
        this.enemyList.push(enemyObj)
        this.enemyCount++
        return enemyObj
      }
    },
    start(){
      if(timer){
        clearInterval(timer)
        timer = null
      }
      this.rafIds = []
      this.roleAnimationHandle()
      timer = setInterval(() => {
        let obj = this.createEnemy()
        // console.log('obj', obj)
        this.animationHandle(obj)

        if(this.enemyCount === this.enemyTotal){
          clearInterval(timer)
          timer = null
          console.log('enemyList', this.enemyCount)
        }
      }, 200)
    },
    roleAnimationHandle(){
      let roleRafId = null
      let animationFn = () => {
        let {
          atk,
          atkScope,
          atkInterval
        } = this.roleInfo

        this.roleInfo.atkScope += 110 / this.fps / atkInterval
        if(this.roleInfo.atkScope >= 110){
          this.roleInfo.atkScope = 0
        }

        roleRafId = window.requestAnimationFrame(animationFn)
        this.masterTime++
      }
      animationFn()
    },
    animationHandle(item){
      let rafId = null,
      xStepInit = Math.abs(this.centerP.x - item.config.x),
      yStepInit = Math.abs(this.centerP.y - item.config.y),
      disInit = Math.sqrt(Math.pow(xStepInit,2) + Math.pow(yStepInit,2)) / this.fps * item.speed,
      offsetVal = 2

      let animationFn = () => {
        let x = item.config.x,
        y = item.config.y,
        xDis = Math.abs(this.centerP.x - x),
        yDis = Math.abs(this.centerP.y - y),
        xStep = 0,
        yStep = 0
        if(xDis === 0 && yDis !== 0 ){
          xStep = disInit
        }else{
          xStep = Math.cos(Math.atan(yDis / xDis)) * disInit
        }
        if(yDis === 0 && xDis !== 0){
          yStep = disInit
        }else{
          yStep = Math.sin(Math.atan(yDis / xDis)) * disInit
        }

        if(x < this.centerP.x - offsetVal){
          item.config.x += xStep
        }
        if(x > this.centerP.x + offsetVal){
          item.config.x -= xStep
        }
        if(y < this.centerP.y - offsetVal){
          item.config.y += yStep
        }
        if(y > this.centerP.y + offsetVal){
          item.config.y -= yStep
        }
        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = window.requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearEnemy = () => {
          this.rafIds.forEach((itm, idx) => {
            if(itm === rafId){
              cancelAnimationFrame(itm)
              this.rafIds.splice(idx, 1)
              let itemIndex = _.findIndex(this.enemyList, {id:item.id})
              if(itemIndex || itemIndex + '' === '0'){
                this.enemyList.splice(itemIndex, 1)
              }
            }
          })
        }

        let {
          atk,
          atkScope,
          atkInterval
        } = this.roleInfo,
        distance = Math.sqrt(Math.pow(xDis,2) + Math.pow(yDis,2))
        
        if((distance <= atkScope + 1.5 && distance >= atkScope - 1.5) && this.masterTime - item.underAtkTime >= 10){
          item.underAtkTime = this.masterTime
          item.hp -= atk

          this.damageList.push({
            id:item.id + new Date * 1 + Math.random(),
            createTime: this.masterTime,
            config:{
              text: '-' + atk,
              x,
              y,
              fill:'red'
            }
          })

          if(item.hp <= 0){
            console.log('干掉一个敌人')
            clearEnemy()
          }
        }

        if((x <= this.centerP.x + offsetVal && x >= this.centerP.x - offsetVal) && (y <= this.centerP.y + offsetVal && y >= this.centerP.y - offsetVal)){
          clearEnemy()
          this.roleInfo.hp -= item.atk
          console.log('受到攻击，剩余hp:', this.roleInfo.hp)
          if(this.roleInfo.hp <= 0){
            console.log('失败')
            if(timer){
              clearInterval(timer)
              timer = null
            }
            this.rafIds.forEach((itm, idx) => {
              cancelAnimationFrame(itm)
            })
            this.rafIds = []
          }
        }
        
      }
      animationFn()
    },
    dragBoundFunc(pos){
      // console.log('dragBoundFunc', pos)
      this.centerP = {
        x:pos.target.attrs.x,
        y:pos.target.attrs.y
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.TD_box{
  border: 2px solid #333;
  width: 600px;
}
</style>

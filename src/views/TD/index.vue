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
            fill: '#0033FF',
            draggable: enableDrag
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
    <div class="role_info">
      <ul class="states">
        <li>等级: {{roleInfo.level}}</li>
        <li>攻击: {{roleInfo.atk}}</li>
        <li>攻击范围: {{roleInfo.maxAtkScope}}</li>
        <li>攻击频率: {{roleInfo.atkInterval}} 次/秒</li>
        <li 
          class="progress_bar"
          :style="{
            '--progressBar':progressBarHp,
            '--progressColor':'rgb(255, 73, 73)'
          }"
        ><span>血量: {{roleInfo.hp}} / {{roleInfo.maxhp}}</span></li>
        <li 
          class="progress_bar"
          :style="{
            '--progressBar':progressBarExp,
            '--progressColor':'rgb(255, 220, 0)'
          }"
        ><span>经验: {{roleInfo.exp}} / {{roleInfo.maxExp}}</span></li>
        <li>击杀数: {{killCount}}</li>
      </ul>
      <button @click="pauseHandle">暂停</button>
      <button @click="launchHandle">启动</button>
    </div>
  </div>
</template>

<script>
let timer = null
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'
export default {
  name: 'TD',
  components: {
  },
  data(){
    return{
      enableDrag:true,
      fps:60,
      masterTime:0,
      configKonva: {
        width: 600,
        height: 600,
      },
      areaOffset:10,
      centerP:{},
      roleInfo:{
        hp: 20,
        maxhp: 20,
        atk: 60,
        atkScope: 0,
        maxAtkScope: 110,
        atkInterval: 1,
        exp:0,
        maxExp:100,
        level:1
      },
      roleRafId:null,
      idCount:0,
      enemyCount:0,
      enemyList:[],
      damageList:[],
      rafIds:[],
      enemyTotal:100,
      killCount:0
    }
  },
  computed:{
    progressBarHp(){
      return Math.ceil(this.roleInfo.hp / this.roleInfo.maxhp * 100) + '%'
    },
    progressBarExp(){
      return Math.ceil(this.roleInfo.exp / this.roleInfo.maxExp * 100) + '%'
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
      let level = randomValue({ 
        arr:weightRandom({
          value:[1, 2, 3, 4, 5],
          weight:[20, 50, 25, 10, 5]
        }) 
      })
      let enemyObj = {
        id:this.idCount++,
        level,
        hp:level * 50,
        def:10,
        atk:level,
        underAtkTime:0,
        exp:level * 5,
        speed:Number((1 / level) / 5 + 0.1).toFixed(2),
        config:{
          x: 0,
          y: 0,
          radius: level * 3,
          fill: '#ff7e7e'
        }
      }

      let areaNo = randomValue({ 
        arr:weightRandom({
          value:[1, 2, 3, 4],
          weight:[10, 10, 10, 10]
        })
      })
      switch(areaNo){
        case 1:
          enemyObj.config.x = randomValue({ min:-this.areaOffset, max:this.configKonva.width})
          enemyObj.config.y = randomValue({ min:-this.areaOffset, max:0})
          break
        case 2:
          enemyObj.config.x = randomValue({ min:this.configKonva.width, max:this.configKonva.width + this.areaOffset})
          enemyObj.config.y = randomValue({ min:-this.areaOffset, max:this.configKonva.height})
          break
        case 3:
          enemyObj.config.x = randomValue({ min:0, max:this.configKonva.width + this.areaOffset})
          enemyObj.config.y = randomValue({ min:this.configKonva.height, max:this.configKonva.height + this.areaOffset})
          break
        case 4:
          enemyObj.config.x = randomValue({ min:-this.areaOffset, max:0})
          enemyObj.config.y = randomValue({ min:0, max:this.configKonva.height + this.areaOffset})
          break
      }

      // if((enemyObj.config.x > 0 && enemyObj.config.x < this.configKonva.width) && (enemyObj.config.y > 0 && enemyObj.config.y < this.configKonva.height)){
      //   return this.createEnemy()
      // }
      // console.log('enemyObj', enemyObj.config, areaNo)
      this.enemyList.push(enemyObj)
      this.enemyCount++
      return enemyObj
    },
    start(){
      if(timer){
        clearInterval(timer)
        timer = null
      }
      this.rafIds = []
      this.roleRafId = null
      this.startCreate()
    },
    startCreate(){
      this.roleAnimationHandle()
      timer = setInterval(() => {
        if(this.enemyCount === this.enemyTotal){
          clearInterval(timer)
          timer = null
          console.log('enemyList', this.enemyCount)
          return
        }

        let obj = this.createEnemy()
        // console.log('obj', obj)
        this.animationHandle(obj)
      }, 200)
    },
    roleAnimationHandle(){
      this.roleRafId = null
      let animationFn = () => {
        let {
          atk,
          maxAtkScope,
          atkInterval
        } = this.roleInfo

        this.roleInfo.atkScope += maxAtkScope / this.fps * atkInterval
        if(this.roleInfo.atkScope >= maxAtkScope){
          this.roleInfo.atkScope = 0
        }

        this.roleRafId = window.requestAnimationFrame(animationFn)
        this.masterTime++
      }
      animationFn()
    },
    animationHandle(item){
      let rafId = null,
      xStepInit = Math.abs(this.centerP.x - item.config.x),
      yStepInit = Math.abs(this.centerP.y - item.config.y),
      disInit = Math.sqrt(Math.pow(xStepInit,2) + Math.pow(yStepInit,2)) / this.fps * item.speed,
      offsetVal = 2,
      atkOffset = 1.75

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
        } = this.roleInfo,
        distance = Math.sqrt(Math.pow(xDis,2) + Math.pow(yDis,2))
        
        if((distance <= atkScope + atkOffset && distance >= atkScope - atkOffset) && this.masterTime - item.underAtkTime >= 10){
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
            this.killCount++
            this.expHandle(item)
            clearEnemy()
          }
        }

        if((x <= this.centerP.x + offsetVal && x >= this.centerP.x - offsetVal) && (y <= this.centerP.y + offsetVal && y >= this.centerP.y - offsetVal)){
          clearEnemy()
          this.roleInfo.hp -= item.atk
          if(this.roleInfo.hp <= 0){
            this.$message({
              message:'GAME OVER',
              type:'error',
              center:true
            })
            this.pauseHandle()
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
    },
    expHandle(enemy){
      this.roleInfo.exp += enemy.exp
      if(this.roleInfo.exp >= this.roleInfo.maxExp){
        this.roleInfo.level++
        this.roleInfo.maxAtkScope += 10
        this.roleInfo.atk += 10
        this.roleInfo.maxhp += 5
        this.roleInfo.hp += 5
        this.roleInfo.atkInterval = Number((this.roleInfo.atkInterval + 0.1).toFixed(2))
        this.$message({
          message:`升级啦!~~~~~~~~~~~`,
          type:'success',
          center:true
        })
        this.roleInfo.exp = 0
        this.roleInfo.maxExp = 50 * Math.pow( this.roleInfo.level, 2 ) + 50
      }
    },
    pauseHandle(){
      if(!this.roleRafId)return
      this.enableDrag = false
      if(timer){
        clearInterval(timer)
        timer = null
      }
      cancelAnimationFrame(this.roleRafId)
      this.roleRafId = null
      this.rafIds.forEach(item => {
        cancelAnimationFrame(item)
      })
      this.rafIds = []
    },
    launchHandle(){
      if(this.roleRafId)return
      this.enableDrag = true
      this.enemyList.forEach(item => {
        this.animationHandle(item)
      })
      this.startCreate()
    }
  }
}

</script>
<style lang="scss" scoped>
.TD_box{
  position: relative;
  border: 2px solid #333;
  width: 600px;
}
.role_info{
  position: absolute;
  left: 610px;
  top: 0;
  .states{
    width: 200px;
    li{
      margin-bottom: 3px;
      line-height: 18px;
      box-sizing: border-box;
      padding-left: 2px;
      &:last-child{
        margin-bottom: 0;
      }
      &.progress_bar{
        background-color: rgb(202, 202, 202);
        position: relative;
        z-index: 1;
        span{
          position: relative;
          z-index: 99;
        }
        &::after{
          content: '';
          display: block;
          width: var(--progressBar);
          height: 100%;
          background-color: var(--progressColor);
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
        }
      }
    }
  }
}
</style>

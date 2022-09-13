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
            x: this.configKonva.width / 2,
            y: this.configKonva.height / 2,
            radius: 15,
            fill: '#0033FF',
            draggable: enableDrag
          }"
        />
        <v-circle
          :config="{
            x: centerP.x,
            y: centerP.y,
            radius: 2.5,
            fill: '#ffffff'
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
        <li>当前场上敌人数量: {{enemyList.length}}</li>
        <li>击杀数: {{killCount}}</li>
      </ul>
      <button @click="pauseHandle">暂停</button>
      <button @click="launchHandle">启动</button>
    </div>
    <expDialog
      :isShow.sync="showExpDialog"
      @upgradeHandle="upgradeHandle"
    />
  </div>
</template>

<script>
let timer = null
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'
import expDialog from './expDialog.vue'

export default {
  name: 'TD',
  components: {
    expDialog
  },
  data(){
    return{
      showExpDialog:false,
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
      enemyTotal:1000,
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
    let sWidth = document.body.clientWidth
    if(sWidth < 634){
      this.configKonva.width = sWidth - 34
    }

    this.centerP = {
      x:this.configKonva.width / 2,
      y:this.configKonva.height / 2
    }

    setTimeout(() => {
      let sFPS = this.masterTime
      if(sFPS >= 50 && sFPS < 70){
        this.fps = 60
      }else if(sFPS >= 70 && sFPS < 80){
        this.fps = 75
      }else if(sFPS >= 80 && sFPS < 100){
        this.fps = 90
      }else if(sFPS >= 110 && sFPS < 130){
        this.fps = 120
      }else if(sFPS >= 134 && sFPS < 154){
        this.fps = 144
      }else if(sFPS >= 155 && sFPS < 175){
        this.fps = 165
      }else if(sFPS >= 230 && sFPS < 250){
        this.fps = 240
      }else if(sFPS >= 350 && sFPS < 370){
        this.fps = 360
      }else{
        this.fps = 60
      }
      console.log('当前显示器帧率：', sFPS, '设定帧率：', this.fps)
    }, 1000)
  },
  mounted(){
    this.start()
  },
  methods:{
    createEnemy(){
      let level = randomValue({ 
        arr:weightRandom({
          value:[1, 2, 3, 4, 5, 10],
          weight:[20, 50, 25, 10, 5, 1]
        }) 
      })
      let enemyObj = {
        id:this.idCount++,
        level,
        hp:level * 50,
        def:10,
        atk:level,
        underAtkTime:0,
        exp:level * 10,
        disInit:1.3 * (Math.pow(level, -1.2)) + 0.7,
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
      if(this.enemyCount === this.enemyTotal)return
      this.roleAnimationHandle()
      timer = setInterval(() => {
        let obj = this.createEnemy()
        this.animationHandle(obj)

        if(this.enemyCount === this.enemyTotal){
          clearInterval(timer)
          timer = null
          console.log('enemyList', this.enemyCount)
          return
        }
      }, 240)
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
      offsetVal = 2,
      atkOffset = 3,
      {
        disInit
      } = item

      let animationFn = () => {
        let x = item.config.x,
        y = item.config.y,
        xDis = Math.abs(this.centerP.x - x),
        yDis = Math.abs(this.centerP.y - y),
        xStep = 0,
        yStep = 0
        if(xDis === 0){
          yStep = disInit
        }else{
          xStep = Math.cos(Math.atan(yDis / xDis)) * disInit
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
          // console.log(distance - atkScope, this.masterTime - item.underAtkTime)
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
        this.pauseHandle()
        this.damageList = []
        this.roleInfo.level++
        this.showExpDialog = true
        setTimeout(() => {
          this.$message({
            message:'升级啦!~~~~~~~~~~~',
            type:'success',
            center:true,
            duration: 1500
          })
        })
        this.roleInfo.exp = 0
        this.roleInfo.maxExp = 50 * Math.pow( this.roleInfo.level, 2 ) + 50
      }
    },
    upgradeHandle(type){
      switch(type){
        case 'atk':
          this.roleInfo.atk += 15
          break
        case 'maxAtkScope':
          this.roleInfo.maxAtkScope += 10
          break
        case 'atkInterval':
          this.roleInfo.atkInterval = Number((this.roleInfo.atkInterval + 0.1).toFixed(2))
          break
        case 'maxhp':
          this.roleInfo.maxhp += 10
          this.roleInfo.hp += 10
          break
        case 'hp':
          this.roleInfo.hp = this.roleInfo.maxhp
          break
      }
      this.showExpDialog = false
      this.$message({
        message: '2秒后开始游戏, 做好准备',
        type: 'warning',
        center: true,
        duration: 2000
      })
      setTimeout(() => {
        this.$message({
          message: '游戏开始',
          type: 'success',
          center: true,
          duration: 1000
        })
        this.launchHandle()
      }, 2000)
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
  overflow: hidden;
  .stage{
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;
    /deep/ .konvajs-content{
      border: 2px solid #333;
    }
  }
}
.role_info{
  float: left;
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

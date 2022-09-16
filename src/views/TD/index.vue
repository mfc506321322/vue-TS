<template>
  <div class="TD_box">
    <v-stage
      ref="stage"
      :config="configKonva"
      class="stage"
    >
      <v-layer ref="layer">
        <!-- <v-circle 
          :config="{
            x: centerP.x,
            y: centerP.y,
            radius: roleInfo.atkScope,
            stroke: 'blue',
            strokeWidth: 1
          }"
        /> -->
        <div class="bullet_box">
          <v-circle
            v-for="(item, idx) in bulletList"
            :key="idx"
            :config="item.config"
          />
        </div>
        <v-circle
          @dragmove="dragBoundFunc"
          :config="{
            // x: this.configKonva.width / 2,
            // y: this.configKonva.height / 2,
            x: centerP.x,
            y: centerP.y,
            radius: 15,
            fill: '#0033FF',
            draggable: enableDrag,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOffset: { x: 2, y: 2 },
            shadowOpacity: 0.5
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
        <!-- <li>攻击范围: {{roleInfo.maxAtkScope}}</li> -->
        <li>子弹数量: {{roleInfo.bulletCount}}</li>
        <li>攻击频率: {{roleInfo.atkInterval}} 次/秒</li>
        <li>键盘移动速度: {{roleInfo.speed * 60}} 像素/秒</li>
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
        <li>剩余敌人数量: {{enemyTotal - killCount}}</li>
        <li>击杀数: {{killCount}}</li>
      </ul>
      <p class="operating_instructions">
        <span class="operating_instructions_title">操作说明</span>
        <span>1.方向键控制（鼠标拖拽）蓝球进行移动</span>
        <span>2.自动向移动的反方向发射子弹</span>
        <span>3.红球中心点撞到蓝球中心的白点会损失生命值</span>
        <span>4.生命值归零时游戏结束</span>
        <span>5.选择升级2秒后自动开始游戏</span>
      </p>
      <el-button @click="pauseHandle">暂停</el-button>
      <el-button @click="launchHandle">启动</el-button>
    </div>
    <expDialog
      :isShow.sync="showExpDialog"
      @upgradeHandle="upgradeHandle"
    />
    <startDialog
      :isShow.sync="showStartDialog"
      @updateStartConfigHandle="updateStartConfigHandle"
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
import startDialog from './startDialog.vue'

export default {
  name: 'ZombieSurvival',
  components: {
    expDialog,
    startDialog
  },
  data(){
    return{
      showStartDialog:true,
      showExpDialog:false,
      enableDrag:false,
      fps:60,
      masterTime:0,
      configKonva: {
        width: 600,
        height: 600,
      },
      areaOffset:10,
      centerP:{},
      lastCenterP:{
        x:300,
        y:290
      },
      roleInfo:{
        hp: 20,
        maxhp: 20,
        atk: 60,
        atkScope: 0,
        maxAtkScope: 110,
        bulletCount: 1,
        atkInterval: 1.25,
        speed:2,
        exp:0,
        maxExp:100,
        level:1
      },
      roleRafId:null,
      idCount:0,
      enemyCount:0,
      enemyCreateInterval:1,
      enemyList:[],
      damageList:[],
      bulletList:[],
      rafIds:[],
      enemyTotal:100,
      killCount:0,
      keyCode:[],
      operatingMode:'2'
    }
  },
  watch:{},
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
  },
  mounted(){
  },
  methods:{
    updateStartConfigHandle(formData){
      this.enemyTotal = formData.enemyTotal
      this.operatingMode = formData.operatingMode
      this.enableDrag = Boolean(this.operatingMode === '1')

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

      this.start()
    },
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
          radius: level * 3 + 2,
          fill: '#ff7e7e',
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5
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
    bulletCreate(){
      let bulletObj = {
        id:new Date * 1 + Math.random(),
        createTime:this.masterTime,
        config:{
          x: this.centerP.x,
          y: this.centerP.y,
          radius: 3,
          fill: '#00ec00',
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5
        }
      }
      this.bulletList.push(bulletObj)
      return bulletObj
    },
    bulletAnimationHandle(item, pluralOffset){
      let rafId = null,
      xStep = 0,
      yStep = 0

      // if(!this.lastCenterP.x && this.lastCenterP.x + '' !== '0'){
      //   xStep = Math.random() * 100,
      //   yStep = Math.sqrt(Math.pow(100, 2) - Math.pow(xStep, 2))
      //   if(Math.random() <= 0.5){
      //     xStep = -xStep
      //   }
      //   if(Math.random() <= 0.5){
      //     yStep = -yStep
      //   }
      //   xStep = xStep / 60
      //   yStep = yStep / 60
      // }else{
      // }

      if(item.xStep || item.xStep + '' === '0'){
        xStep = item.xStep
        yStep = item.yStep
      }else{
        let rx = this.centerP.x - this.lastCenterP.x,
        ry = this.centerP.y - this.lastCenterP.y,
        rDis = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2))

        if(pluralOffset && pluralOffset !== 0){
          let pluralOffsetRadian = 0.1
          if(pluralOffset % 2 === 0){
            pluralOffsetRadian = pluralOffset / -20
          }else{
            pluralOffsetRadian = (pluralOffset + 1) / 20
          }

          rx = rx < 0 ? Math.cos(Math.atan(ry / rx) + pluralOffsetRadian) * rDis * -1 : Math.cos(Math.atan(ry / rx) + pluralOffsetRadian) * rDis
          if(ry === 0 && pluralOffset % 2 === 0){
            ry = Math.sin(Math.atan(ry / rx) + pluralOffsetRadian) * rDis
          }else{
            ry = ry < 0 ? Math.sqrt(Math.pow(rDis, 2) - Math.pow(rx, 2)) * -1 : Math.sqrt(Math.pow(rDis, 2) - Math.pow(rx, 2))
          }
        }

        if(rx === 0){
          yStep = 100
        }else{
          xStep = Math.cos(Math.atan(ry / rx)) * 100
          yStep = Math.abs(Math.sin(Math.atan(ry / rx)) * 100)
        }
        
        xStep = rx < 0 ? xStep / 60 : xStep / -60
        yStep = ry < 0 ? yStep / 60 : yStep / -60

        item['xStep'] = xStep
        item['yStep'] = yStep
      }

      // item.createTime = this.masterTime

      let animationFn = () => {
        item.config.x += xStep
        item.config.y += yStep
        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = window.requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearBulle = (type) => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              if(!type){
                let itemIndex = _.findIndex(this.bulletList, {id:item.id})
                if(itemIndex || itemIndex + '' === '0'){
                  this.bulletList.splice(itemIndex, 1)
                }
              }
              break
            }
          }
        }

        if(this.masterTime - item.createTime >= 60 * 8.5){
          clearBulle(true)
        }else{
          let {
            x,
            y
          } = item.config

          for(let i=0, l=this.enemyList.length;i<l;i++){//for循环降低性能开销
            let itm = this.enemyList[i],
            ex = itm.config.x,
            ey = itm.config.y,
            xdis = Math.abs(x - ex),
            ydis = Math.abs(y - ey),
            dis = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2))

            if(dis <= itm.config.radius + 3){
              clearBulle()
              itm.hp -= this.roleInfo.atk

              this.damageList.push({
                id:itm.id + new Date * 1 + Math.random(),
                createTime: this.masterTime,
                config:{
                  text: '-' + this.roleInfo.atk,
                  x,
                  y,
                  fill:'red'
                }
              })
              break
            }
          }
        }
      }
      animationFn()
    },
    start(){
      if(timer){
        clearInterval(timer)
        timer = null
      }
      this.rafIds = []
      this.roleRafId = null
      this.keyDown()
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
      }, 1000 * this.enemyCreateInterval)
    },
    roleAnimationHandle(){
      this.roleRafId = null
      let animationFn = () => {
        let {
          maxAtkScope,
          atkInterval,
          speed
        } = this.roleInfo

        // this.roleInfo.atkScope += maxAtkScope / this.fps * atkInterval
        // if(this.roleInfo.atkScope >= maxAtkScope){
        //   this.roleInfo.atkScope = 0
        // }

        // if(this.masterTime % (60 * this.enemyCreateInterval) === 0 && this.enemyCount < this.enemyTotal){
        //   let obj = this.createEnemy()
        //   this.animationHandle(obj)

        //   if(this.enemyCount === this.enemyTotal){
        //     console.log('enemyList', this.enemyCount)
        //   }
        // }

        if(this.operatingMode === '2' && this.keyCode.length > 0){
          let cachePoint = { ...this.centerP }

          this.lastCenterP = {
            x: cachePoint.x,
            y: cachePoint.y
          }

          if(this.keyCode.includes(37)){
            this.centerP.x -= speed
          }
          if(this.keyCode.includes(39)){
            this.centerP.x += speed
          }
          if(this.keyCode.includes(38)){
            this.centerP.y -= speed
          }
          if(this.keyCode.includes(40)){
            this.centerP.y += speed
          }
          this.borderLimit()
        }

        if(this.masterTime % (Math.ceil(this.fps / atkInterval)) === 0){
          for(let i=0, l=Math.floor(this.roleInfo.bulletCount);i<l;i++){
            let obj = this.bulletCreate()
            this.bulletAnimationHandle(obj, i)
          }
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
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.enemyList, {id:item.id})
              if(itemIndex || itemIndex + '' === '0'){
                this.enemyList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        // let {
        //   atk,
        //   atkScope,
        // } = this.roleInfo,
        // distance = Math.sqrt(Math.pow(xDis,2) + Math.pow(yDis,2))

        // if((distance <= atkScope + atkOffset && distance >= atkScope - atkOffset) && this.masterTime - item.underAtkTime >= 10){
        //   // console.log(distance - atkScope, this.masterTime - item.underAtkTime)
        //   item.underAtkTime = this.masterTime
        //   item.hp -= atk
        // }

        if(item.hp <= 0){
          this.killCount++
          clearEnemy()
          this.expHandle(item)
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
    keyDown(){
      if(this.operatingMode !== '2')return
      document.body.onkeydown = (e) => {
        //事件对象兼容
        let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
        //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
        if(e1){
          let keys = [37, 38, 39, 40]
          if(keys.includes(e1.keyCode)){
            if(!this.keyCode.includes(e1.keyCode)){
              this.keyCode.push(e1.keyCode)
            }
          }
        }
      }
      document.body.onkeyup = (e) => {
        let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
        if(e1){
          if(this.keyCode.includes(e1.keyCode)){
            this.keyCode.splice(this.keyCode.indexOf(e1.keyCode), 1)
          }
        }
      }
    },
    dragBoundFunc(pos){
      // console.log('dragBoundFunc', pos)
      let cachePoint = { ...this.centerP },
      {
        x,
        y
      } = pos.target.attrs,
      rlx = cachePoint.x,
      rly = cachePoint.y

      if(x >= 0 && x <= 600){
        rlx = x
      }
      if(y >= 0 && y <= 600){
        rly = y
      }

      if(cachePoint.x !== rlx && cachePoint.y !== rly){
        this.lastCenterP = {
          x: cachePoint.x,
          y: cachePoint.y
        }
      }

      this.centerP = {
        x:rlx,
        y:rly
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
        this.roleInfo.maxExp = Math.ceil(50 * Math.pow( this.roleInfo.level, 1.5 ) + 100)
      }
    },
    upgradeHandle(type){
      switch(type){
        case 'atk':
          this.roleInfo.atk += 20
          break
        // case 'maxAtkScope':
        //   this.roleInfo.maxAtkScope += 10
        //   break
        case 'bulletCount':
          this.roleInfo.bulletCount += 0.5
          break
        case 'atkInterval':
          this.roleInfo.atkInterval = Number((this.roleInfo.atkInterval + 0.25).toFixed(2))
          break
        case 'speed':
          this.roleInfo.speed += 0.5
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
    borderLimit(){
      if(this.centerP.x <= 0){
        this.centerP.x = 0
      }
      if(this.centerP.x >= 600){
        this.centerP.x = 600
      }
      if(this.centerP.y <= 0){
        this.centerP.y = 0
      }
      if(this.centerP.y >= 600){
        this.centerP.y = 600
      }
    },
    pauseHandle(){
      if(!this.roleRafId)return
      if(timer){
        clearInterval(timer)
        timer = null
      }
      this.enableDrag = false

      cancelAnimationFrame(this.roleRafId)
      this.roleRafId = null
      for(let i=0, l=this.rafIds.length;i<l;i++){
        cancelAnimationFrame(this.rafIds[i])
      }
      this.rafIds = []

      for(let i=0, l=this.bulletList.length;i<l;i++){
        if(this.bulletList[i] && this.masterTime - this.bulletList[i].createTime >= 60 * 8.5){
          this.bulletList.splice(i, 1)
        }
      }
    },
    launchHandle(){
      if(this.roleRafId)return
      this.enableDrag = Boolean(this.operatingMode === '1')

      for(let i=0, l=this.bulletList.length;i<l;i++){
        this.bulletAnimationHandle(this.bulletList[i])
      }
      for(let i=0, l=this.enemyList.length;i<l;i++){
        this.animationHandle(this.enemyList[i])
      }
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
.operating_instructions{
  display: flex;
  flex-direction: column;
  color: #333;
  font-size: 16px;
  margin-top: 10px;
  .operating_instructions_title{
    font-weight: bold;
    margin-bottom: 5px;
  }
  span{
    line-height: 18px;
  }
}
</style>

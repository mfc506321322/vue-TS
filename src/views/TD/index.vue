<template>
  <div class="TD_box">
    <div 
      class="stage_box"
      :style="{
        'width':stageBoxConfig.width + 'px',
        'height':stageBoxConfig.height  + 'px'
      }"
    >
    <v-stage
      ref="stage"
      :config="configKonva"
      class="stage"
      :style="{
        '--stageTop':(-1 * screenRoleY) + 'px',
        '--stageLeft':(-1 * screenRoleX) + 'px'
      }"
    >
      <v-layer ref="layer_0" :config="{
        listening:false
      }">
        <v-rect
          v-for="(item, idx) in bgList"
          :key="idx"
          :config="item"
        />
      </v-layer>
      <v-layer ref="layer_1" :config="{
        listening:false
      }">
        <v-circle
          ref="role"
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
            shadowOpacity: 0.5,
            listening:false
          }"
        />
        <v-circle
          :config="{
            x: centerP.x,
            y: centerP.y,
            radius: 2.5,
            fill: '#ffffff',
            listening:false
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
            v-if="masterTime - item.createTime <= fpsUnifyHandle(30, 0, true)"
          />
          <div class="explosion_box">
            <v-circle
              v-for="(item, idx) in explosionList"
              :key="idx"
              :config="item.config"
            />
          </div>
        </div>
        <v-group ref="treasure_box" class="treasure_box" :config="{
          listening:false
        }">
          <v-star
            v-for="(item, idx) in treasureList"
            :key="idx"
            :config="item.config"
          />
        </v-group>
      </v-layer>
      <v-layer ref="layer_2" :config="{
        listening:false
      }">
        <div class="skill_box">
          <v-circle
            v-for="(item, idx) in skillList"
            :key="idx"
            :config="item.config"
          />
        </div>
        <div class="bullet_box">
          <v-circle
            v-for="(item, idx) in bulletList"
            :key="idx"
            :config="item.config"
          />
        </div>
        <div class="around_box">
          <v-circle
            v-for="(item, idx) in aroundList"
            :key="idx"
            :config="item.config"
          />
        </div>
        <div class="reflection_box">
          <v-ring
            v-for="(item, idx) in reflectionList"
            :key="idx"
            :config="item.config"
          />
        </div>
        <div 
          class="light_box"
          v-for="(item, idx) in lightList"
          :key="idx"
        >
          <v-rect :config="item.rect"/>
          <v-circle :config="item.circle"/>
        </div>
      </v-layer>
    </v-stage>
    </div>
    <div class="role_info">
      <ul class="states">
        <li>当前关卡: {{mapLevel}}</li>
        <li>等级: {{roleInfo.level}}</li>
        <li>攻击: {{roleInfo.atk}}</li>
        <!-- <li>攻击范围: {{roleInfo.maxAtkScope}}</li> -->
        <li>子弹数量: {{roleInfo.bulletCount}}</li>
        <li>攻击频率: {{roleInfo.atkInterval}} 次/秒</li>
        <li>键盘移动速度: {{roleInfo.speed * fps}} 像素/秒</li>
        <li>普通宝箱获得概率: {{roleInfo.treasure.probability | percentageUnit}}</li>
        <li>特殊宝箱获得概率: {{roleInfo.treasure.specialProbability | percentageUnit}}</li>
        <div :class="isMobile && 'mobile_role_info'">
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
          <li>剩余敌人数量: {{enemyTotal - killCount - roleInfo.underAtkCount}}</li>
          <li>击杀数: {{killCount}}</li>
          <li>总击杀数: {{totalKillCount}}</li>
        </div>
        <li>当前fps: {{fps}}</li>
      </ul>
      <div :class="isMobile && 'mobile_other_info'" v-if="showSkillInfo">
        <p class="skill_info" v-if="roleInfo.skill.get">
          <span>震荡波cd: {{roleInfo.skill.nowCd ? roleInfo.skill.nowCd : '可用'}} / {{roleInfo.skill.cd}}</span>
          <span>震荡波伤害: {{roleInfo.skill.damage}}</span>
          <span>震荡波范围: {{roleInfo.skill.maxScope}}</span>
        </p>
        <p class="skill_info passive_info" v-if="roleInfo.passive.get">
          <span>环绕弹伤害: {{roleInfo.passive.damage}}</span>
          <span>环绕弹持续时间: {{roleInfo.passive.duration}} 秒</span>
          <span>环绕弹间隔: {{roleInfo.passive.cd}} 秒</span>
        </p>
        <p class="skill_info reflection_info" v-if="roleInfo.reflection.get">
          <span>反射弹伤害: {{roleInfo.reflection.damage}}</span>
          <span>反射弹持续时间: {{roleInfo.reflection.duration}} 秒</span>
          <span>发射弹间隔: {{roleInfo.reflection.cd}} 秒</span>
          <span>反射弹速度倍率: {{roleInfo.reflection.speed}} 倍</span>
        </p>
        <p class="skill_info light_info" v-if="roleInfo.light.get">
          <span>耀斑轰击伤害: {{roleInfo.light.damage}}</span>
          <span>耀斑轰击范围: {{roleInfo.light.maxScope}}</span>
          <span>耀斑轰击间隔: {{roleInfo.light.cd}} 秒</span>
        </p>
      </div>
      <p class="operating_instructions">
        <span class="operating_instructions_title">操作说明</span>
        <span>1.方向键控制（鼠标拖拽）蓝球进行移动</span>
        <span>2.自动向移动的反方向发射子弹</span>
        <span>3.按（Z）键释放范围攻击技能</span>
        <span>4.按一定间隔时间自动触发被动生成防护球</span>
        <span>5.红球中心点撞到蓝球中心的白点会损失生命值</span>
        <span>6.生命值归零时游戏结束</span>
        <span>7.选择升级2秒后自动开始游戏</span>
      </p>
      <div :class="`${isMobile ? lOrRMode === '2' ? 'mobile_function_btn right_function_btn' : 'mobile_function_btn' : ''}`">
        <el-dropdown size="medium" trigger="click" @command="handleCommand">
          <el-button size="mini" type="primary">
            功能菜单<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="showSkillInfo">{{showSkillInfo ? '隐藏属性' : '显示属性'}}</el-dropdown-item>
            <el-dropdown-item divided command="saveArchive">保存存档</el-dropdown-item>
            <el-dropdown-item divided command="readArchive" :disabled="gameState === 'operation'">读取存档</el-dropdown-item>
            <el-dropdown-item divided command="pauseHandle">暂停游戏</el-dropdown-item>
            <el-dropdown-item divided command="launchHandle">启动游戏</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <VirtualJoy
      v-if="isMobile && operatingMode === '2' && keysMode === '1'"
      :lOrRMode="lOrRMode"
      @virtualJoyFn="virtualJoyFn"
      @virtualBtnDown="virtualBtnDown"
      @virtualBtnUp="virtualBtnUp"
    />
    <VirtualButtons
      v-if="isMobile && operatingMode === '2' && keysMode === '2'"
      @virtualBtnDown="virtualBtnDown"
      @virtualBtnUp="virtualBtnUp"
    />
    <expDialog
      :isShow.sync="showExpDialog"
      @upgradeHandle="upgradeHandle"
      :infoData="roleInfo"
    />
    <rogueDialog
      :isShow.sync="showRogueDialog"
      @rogueHandle="rogueHandle"
      :infoData="roleInfo"
      :specialReward="specialReward"
    />
    <startDialog
      :isShow.sync="showStartDialog"
      :isMobile="isMobile"
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
import rogueDialog from './rogueDialog.vue'
import levelInfo from './config/level.json'
import VirtualButtons from './components/VirtualButtons.vue'
import VirtualJoy from './components/VirtualJoy.vue'

export default {
  name: 'ZombieSurvival',
  components: {
    expDialog,
    startDialog,
    VirtualButtons,
    VirtualJoy,
    rogueDialog
  },
  data(){
    return{
      isMobile:false,
      mapLevel:1,
      mapLevelInfo:levelInfo[0],
      keysMode:'1',
      lOrRMode:'1',
      gameMode:'level',//sandbox, level
      gameState:'pause',//operation, pause, over, finish
      showStartDialog:true,
      showExpDialog:false,
      showRogueDialog:false,
      showSkillInfo:true,
      enableDrag:false,
      fps:60,
      masterTime:0,
      stageBoxConfig: {
        width: 600,
        height: 600
      },
      configKonva: {
        width: 800,
        height: 800,
        listening:false
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
        originalSpeed: 2,
        speed: 0,
        exp:0,
        maxExp:100,
        level:1,
        underAtkCount:0,
        underAnimationTime:0,
        defaultFill:'#0033FF',
        skill:{
          get: false,
          damage: 100,
          maxScope: 125,
          cd: 10,
          nowCd: 0,
          castTime: 0,
          skillSpeed: 1.5
        },
        passive:{
          get: false,
          damage: 20,
          duration: 7,
          cd: 3,
          aroundDis: 80,
          arcStep: 0.0325,
        },
        reflection:{
          get: false,
          damage: 40,
          duration: 6,
          cd: 3,
          speed: 2.5,
          through: 2
        },
        light:{
          get: false,
          damage: 40,
          maxScope: 30,
          cd: 3,
          atkScope: 200
        },
        treasure:{
          probability: 0.015,
          cdCount: 3,
          guaranteed: 60,
          specialProbability: 0.005,
          specialCdCount: 5,
          specialGuaranteed: 100,
          cacheKillCount: 0
        }
      },
      roleRafId:null,
      idCount:0,
      enemyCount:0,
      enemyCreateInterval:1,
      enemyList:[],
      damageList:[],
      bulletList:[],
      skillList:[],
      aroundList:[],
      reflectionList:[],
      explosionList:[],
      lightList:[],
      bgList:[],
      treasureList:[],
      specialReward: 0,
      rafIds:[],
      enemyTotal:0,
      killCount:0,
      totalKillCount:0,
      keyCode:[],
      operatingMode:'2',
      joyStep:{
        xStep:0,
        yStep:0,
        type:'end'
      },
      scintillationColor:'#eee',
      scintillationDuration:20,
    }
  },
  watch:{
    enemyList:function(){
      if(this.roleInfo.underAtkCount + this.killCount >= this.enemyTotal){
        setTimeout(() => {
          this.$message({
            message:'成功通关！～～～～～～',
            type:'success',
            center:true
          })
        })
        this.pauseHandle('finish')

        if(this.gameMode !== 'level')return
        this.$confirm('成功通关，准备进入下一关！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success',
          center: true,
          showClose: false,
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false
        }).then(() => {
          this.mapLevel++
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
            this.start()
          }, 2000)
        }).catch(() => {        
        })
      }
    },
    mapLevel:function(val){
      this.mapLevelInfo = levelInfo[val - 1]

      this.idCount = 0
      this.masterTime = 0
      this.enemyCount = 0
      this.killCount = 0
      this.enemyList = []
      this.damageList = []
      this.bulletList = []
      this.skillList = []
      this.aroundList = []
      this.explosionList = []
      this.reflectionList = []
      this.lightList = []
      this.$refs.treasure_box.getNode().clearCache()
      this.treasureList = []
      this.keyCode = []
      this.roleInfo.underAtkCount = 0
      this.roleInfo.atkScope = 0
      this.roleInfo.skill.nowCd = 0
      this.roleInfo.underAnimationTime = 0
      setTimeout(() => {
        this.$refs.role.getNode().attrs.fill = this.roleInfo.defaultFill
      })
      // this.centerP = {
      //   x:this.stageBoxConfig.width / 2,
      //   y:this.stageBoxConfig.height / 2
      // }

      let {
        enemyTotal,
        enemyCreateInterval
      } = this.mapLevelInfo
      this.enemyTotal = enemyTotal
      this.enemyCreateInterval = enemyCreateInterval

      this.saveArchive(true)
    }
  },
  computed:{
    progressBarHp(){
      return Math.ceil(this.roleInfo.hp / this.roleInfo.maxhp * 100) + '%'
    },
    progressBarExp(){
      return Math.ceil(this.roleInfo.exp / this.roleInfo.maxExp * 100) + '%'
    },
    screenRoleX(){
      return this.centerP.x - this.stageBoxConfig.width / 2
    },
    screenRoleY(){
      return this.centerP.y - this.stageBoxConfig.height / 2
    },
  },
  filters: {
    percentageUnit:function(value){
      if(value || value + '' === '0'){
        return (value * 100).toFixed(1) + '%'
      }
      return ''
    }
  },
  created(){
    let sWidth = document.body.clientWidth
    if(sWidth < 634){
      this.stageBoxConfig.width = sWidth - 34
      this.isMobile = true
    }else{
      this.isMobile = false
    }

    let localFps = localStorage.getItem('fps')
    if(localFps){
      this.fps = Number(localFps)
      console.log('设定帧率：', this.fps)
    }

    this.centerP = {
      x:this.stageBoxConfig.width / 2,
      y:this.stageBoxConfig.height / 2
    }

    this.roleInfo.speed = this.fpsUnifyHandle(this.roleInfo.originalSpeed)
    this.scintillationDuration = this.fps / 3

    let bgWidth = 40,
    bgXlength = this.configKonva.width / bgWidth
    for(let i = 0;i < Math.pow(bgXlength, 2);i++){
      this.bgList.push({
        x: i % bgXlength * bgWidth,
        y: Math.floor(i / bgXlength) * bgWidth,
        width: bgWidth,
        height: bgWidth,
        fill: Math.floor(i / bgXlength) % 2 === 0 ? i % 2 === 0 ? '#f9f9f9' : '#fff' : i % 2 === 0 ? '#fff' : '#f9f9f9',
        listening:false
      })
    }
  },
  mounted(){
    this.$refs.layer_0.getNode().cache()
  },
  methods:{
    updateStartConfigHandle(formData, type){
      this.gameMode = formData.gameMode
      if(this.isMobile){
        this.keysMode = formData.keysMode
      }else{
        this.keysMode = ''
      }
      if(this.keysMode){
        this.lOrRMode = formData.lOrRMode
      }
      if(this.gameMode === 'level'){
        this.enemyTotal = this.mapLevelInfo.enemyTotal
        this.enemyCreateInterval = this.mapLevelInfo.enemyCreateInterval
      }else{
        this.enemyTotal = formData.enemyTotal
        this.mapLevelInfo = {
          "level": 9999,
          "enemyTotal": formData.enemyTotal,
          "enemyCreateInterval": 0.8,
          "enemyConfig": {
            "color": "#ff7e7e",
            "levelWeight": {
              "value": [1, 2, 3, 4, 5, 10],
              "weight": [20, 40, 30, 20, 5, 1]
            },
            "areaWeight": {
              "value": [1, 2, 3, 4],
              "weight": [10, 10, 10, 10]
            }
          }
        }
      }
      this.operatingMode = formData.operatingMode
      this.enableDrag = Boolean(this.operatingMode === '1')

      let localFps = localStorage.getItem('fps')
      setTimeout(() => {
        let sFPS = this.masterTime,
        setFps = 60
        
        if(sFPS >= 50 && sFPS < 70){
          setFps = 60
        }else if(sFPS >= 70 && sFPS < 80){
          setFps = 75
        }else if(sFPS >= 80 && sFPS < 100){
          setFps = 90
        }else if(sFPS >= 110 && sFPS < 130){
          setFps = 120
        }else if(sFPS >= 134 && sFPS < 154){
          setFps = 144
        }else if(sFPS >= 155 && sFPS < 175){
          setFps = 165
        }else if(sFPS >= 230 && sFPS < 250){
          setFps = 240
        }else if(sFPS >= 350 && sFPS < 370){
          setFps = 360
        }else{
          setFps = 60
        }
        if(setFps != localFps){
          this.fps = setFps
          localStorage.setItem('fps', this.fps)
          console.log('当前显示器帧率：', sFPS, '设定帧率：', this.fps)
        }
      }, 1000)

      this.start(type)
    },
    start(type){
      this.rafIds = []
      this.roleRafId = null
      this.keyDown()
      if(type === 'read'){
        this.readArchive()
      }else{
        this.gameState = 'operation'
        this.startCreate()
      }
    },
    startCreate(){
      if(this.gameState !== 'operation')return
      this.roleAnimationHandle()
    },
    roleAnimationHandle(){
      this.roleRafId = null
      let roleItem = this.$refs.role.getNode()
      
      let animationFn = () => {
        let {
          maxAtkScope,
          atkInterval,
          speed,
          defaultFill,
          underAnimationTime
        } = this.roleInfo

        //角色移动
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

        if(this.operatingMode === '2' && this.keysMode === '1' && this.joyStep.type !== 'end'){
          this.centerP.x += this.joyStep.xStep
          this.centerP.y += this.joyStep.yStep
          this.borderLimit()
        }

        if(this.masterTime % Math.ceil(this.fps * this.enemyCreateInterval) === 0 && this.enemyCount < this.enemyTotal){
          let obj = this.createEnemy()
          this.enemyAnimationHandle(obj)
        }

        //各技能生成
        if(this.masterTime % Math.ceil(this.fps / atkInterval) === 0){
          for(let i=0, l=Math.floor(this.roleInfo.bulletCount);i<l;i++){
            let obj = this.bulletCreate()
            this.bulletAnimationHandle(obj, i)
          }
        }

        if(this.roleInfo.skill.get){
          let {
            nowCd,
            cd
          } = this.roleInfo.skill
          if(this.keyCode.includes(90) && nowCd === 0){
            this.roleInfo.skill.castTime = this.masterTime
            this.roleInfo.skill.nowCd = cd
            let obj = this.skillCreate()
            this.skillAnimationHandle(obj)
          }
          if(this.roleInfo.skill.nowCd > 0){
            this.roleInfo.skill.nowCd = Number((this.roleInfo.skill.nowCd - (1 / this.fps)).toFixed(2))
          }else if(this.roleInfo.skill.nowCd < 0){
            this.roleInfo.skill.nowCd = 0
          }
        }

        if(this.roleInfo.passive.get){
          if(this.masterTime % (this.fps * this.roleInfo.passive.cd) === 0){
            let obj = this.aroundCreate()
            this.aroundAnimationHandle(obj)
          }
        }

        if(this.roleInfo.reflection.get){
          if(this.masterTime % (this.fps * this.roleInfo.reflection.cd) === 0){
            let obj = this.reflectionCreate()
            this.reflectionAnimationHandle(obj)
          }
        }

        if(this.roleInfo.light.get && this.enemyList.length > 0){
          if(this.masterTime % (this.fps * this.roleInfo.light.cd) === 0){
            let obj = this.lightCreate()
            this.lightAnimationHandle(obj)
          }
        }

        //受伤闪烁特效
        if(underAnimationTime){
          let poor = this.masterTime - underAnimationTime,
          scintillationInterval = Math.floor(this.scintillationDuration / 2)

          if(poor >= this.scintillationDuration){
            roleItem.attrs.fill = defaultFill
            this.roleInfo.underAnimationTime = 0
          }else{
            if(poor % scintillationInterval === 0){
              roleItem.attrs.fill = this.scintillationColor
            }else if(poor % scintillationInterval === Math.floor(scintillationInterval / 2)){
              roleItem.attrs.fill = defaultFill
            }
          }
        }

        this.roleRafId = requestAnimationFrame(animationFn)
        this.masterTime++
      }
      animationFn()
    },
    createEnemy(){
      let {
        enemyConfig:{
          color,
          levelWeight,
          areaWeight
        }
      } = this.mapLevelInfo,
      level = randomValue({ 
        arr:weightRandom(levelWeight) 
      })

      let enemyObj = {
        id:this.idCount++,
        level,
        hp:level * 60,
        atk:level + 1,
        underAroundAtkTime:0,
        underSkillAtkIds:[],
        underAroundAtkId:null,
        exp:level * 15,
        disInit:this.fpsUnifyHandle(1.3 * (Math.pow(level, -1.2)) + 0.7),
        defaultFill: color,
        config:{
          x: 0,
          y: 0,
          radius: level * 3 + 2,
          fill: color,
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
          listening:false
        }
      }

      let areaNo = randomValue({ 
        arr:weightRandom(areaWeight)
      }),
      sWidth = this.stageBoxConfig.width,
      sHeight = this.stageBoxConfig.height,
      realWidth = sWidth + this.screenRoleX,
      realHeight = sHeight + this.screenRoleY,
      realOffsetX = -this.areaOffset + this.screenRoleX,
      realOffsetY = -this.areaOffset + this.screenRoleY

      switch(areaNo){
        case 1:
          enemyObj.config.x = randomValue({ min:realOffsetX, max:realWidth})
          enemyObj.config.y = randomValue({ min:realOffsetY, max:0})
          break
        case 2:
          enemyObj.config.x = randomValue({ min:realWidth, max:realWidth + this.areaOffset})
          enemyObj.config.y = randomValue({ min:realOffsetY, max:realHeight})
          break
        case 3:
          enemyObj.config.x = randomValue({ min:0, max:realWidth + this.areaOffset})
          enemyObj.config.y = randomValue({ min:realHeight, max:realHeight + this.areaOffset})
          break
        case 4:
          enemyObj.config.x = randomValue({ min:realOffsetX, max:0})
          enemyObj.config.y = randomValue({ min:0, max:realHeight + this.areaOffset})
          break
      }

      // console.log('enemyObj', enemyObj.config, areaNo)
      this.enemyList.push(enemyObj)
      this.enemyCount++
      return enemyObj
    },
    enemyAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      offsetVal = 2,
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
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearEnemy = () => {
          let obj = this.explosionCreate(item)
          this.explosionAnimationHandle(obj)

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

        if(item.underAnimationTime){
          let poor = this.masterTime - item.underAnimationTime,
          scintillationInterval = Math.floor(this.scintillationDuration / 2)

          if(poor >= this.scintillationDuration){
            item.config.fill = item.defaultFill
            item.underAnimationTime = 0
          }else{
            if(poor % scintillationInterval === 0){
              item.config.fill = this.scintillationColor
            }else if(poor % scintillationInterval === Math.floor(scintillationInterval / 2)){
              item.config.fill = item.defaultFill
            }
          }
        }

        if(this.skillList.length > 0){
          for(let i=0, l=this.skillList.length;i<l;i++){
            let {
              id,
              damage,
              config:{
                radius
              }
            } = this.skillList[i]
            if(item.underSkillAtkIds.includes(id))continue
            let {
              distance
            } = this.distanceCalc({x, y}, {...this.skillList[i].config})

            if(distance <= radius){
              item.underSkillAtkIds.push(id)
              item.hp -= damage
              this.damageCreate(item, damage)
            }
          }
        }

        if(item.hp <= 0){
          this.killCount++
          this.totalKillCount++
          clearEnemy()
          this.treasureCreate(item)
          this.expHandle(item)
        }

        if((x <= this.centerP.x + offsetVal && x >= this.centerP.x - offsetVal) && (y <= this.centerP.y + offsetVal && y >= this.centerP.y - offsetVal)){
          clearEnemy()
          this.roleInfo.hp -= item.atk
          this.roleInfo.underAtkCount++
          this.roleInfo['underAnimationTime'] = this.masterTime
          if(this.roleInfo.hp <= 0){
            this.$message({
              message:'GAME OVER',
              type:'error',
              center:true
            })
            this.pauseHandle('over')
          }
        }
      }
      animationFn()
    },
    bulletCreate(){
      let bulletObj = {
        id:new Date * 1 + Math.random() + '',
        createTime:this.masterTime,
        config:{
          x: this.centerP.x,
          y: this.centerP.y,
          radius: 3,
          fill: '#00ec00',
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
          listening:false
        }
      }
      this.bulletList.push(bulletObj)
      return bulletObj
    },
    bulletAnimationHandle(item, pluralOffset){
      if(!item)return
      
      let rafId = null,
      xStep = 0,
      yStep = 0,
      bulletDisInit = 100

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
          yStep = bulletDisInit
        }else{
          xStep = Math.cos(Math.atan(ry / rx)) * bulletDisInit
          yStep = Math.abs(Math.sin(Math.atan(ry / rx)) * bulletDisInit)
        }
        
        xStep = rx < 0 ? xStep / this.fps : xStep / -this.fps
        yStep = ry < 0 ? yStep / this.fps : yStep / -this.fps

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
        rafId = requestAnimationFrame(animationFn)
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

        if(this.masterTime - item.createTime >= this.fps * 8.5){
          clearBulle()
        }else{
          let {
            x,
            y,
            radius
          } = item.config

          for(let i=0, l=this.enemyList.length;i<l;i++){//for循环降低性能开销
            let itm = this.enemyList[i],
            {
              distance
            } = this.distanceCalc({x, y}, {...itm.config})

            if(distance <= itm.config.radius + radius){
              clearBulle()
              itm.hp -= this.roleInfo.atk

              this.damageCreate(itm, this.roleInfo.atk)
              break
            }
          }
        }
      }
      animationFn()
    },
    skillCreate(){
      let {
        damage,
        maxScope,
        cd
      } = this.roleInfo.skill
      let skillObj = {
        id:new Date * 1 + Math.random() + '',
        createTime:this.masterTime,
        damage,
        maxScope,
        cd,
        config:{
          x: this.centerP.x,
          y: this.centerP.y,
          radius: 0,
          stroke: 'blue',
          strokeWidth: 1,
          listening:false
        }
      }
      this.skillList.push(skillObj)
      return skillObj
    },
    skillAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      {
        id,
        maxScope
      } = item

      let animationFn = () => {
        item.config.radius += this.fpsUnifyHandle(this.roleInfo.skill.skillSpeed)

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearSkill = () => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.skillList, {id:id})
              if(itemIndex || itemIndex + '' === '0'){
                this.skillList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        if(item.config.radius >= maxScope){
          clearSkill()
        }
      }
      animationFn()
    },
    aroundCreate(){
      let {
        damage,
        duration,
        aroundDis,
        arcStep
      } = this.roleInfo.passive
      let aroundObj = {
        id:new Date * 1 + Math.random() + '',
        createTime: this.masterTime,
        damage,
        duration,
        aroundDis,
        arc: 0,
        arcStep,
        config:{
          x: this.centerP.x - 60,
          y: this.centerP.y,
          radius: 5,
          fill: '#FFCC00',
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
          listening:false
        }
      }
      if(this.aroundList.length > 0){
        aroundObj.arc = this.aroundList[this.aroundList.length - 1].arc + (Math.PI / 180 * 130)
      }
      this.aroundList.push(aroundObj)
      return aroundObj
    },
    aroundAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      {
        id,
        createTime,
        damage,
        duration,
        aroundDis,
        arcStep
      } = item

      let animationFn = () => {
        item.config.x = this.centerP.x + Math.cos(item.arc) * aroundDis
        item.config.y = this.centerP.y + Math.sin(item.arc) * aroundDis
        item.arc += this.fpsUnifyHandle(arcStep)

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearAround = () => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.aroundList, {id:id})
              if(itemIndex || itemIndex + '' === '0'){
                this.aroundList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        let {
          x,
          y,
          radius
        } = item.config

        for(let i=0, l=this.enemyList.length;i<l;i++){//for循环降低性能开销
          let itm = this.enemyList[i],
          {
            distance
          } = this.distanceCalc({x, y}, {...itm.config})

          if(distance <= itm.config.radius + radius){
            if(itm.underAroundAtkId !== id || this.masterTime - itm.underAroundAtkTime > this.fpsUnifyHandle(20, 0, true)){
              itm.underAroundAtkId = id
              itm.underAroundAtkTime = this.masterTime
              itm.hp -= damage
              this.damageCreate(itm, damage)
              break
            }
          }
        }

        if(this.masterTime - createTime >= this.fps * duration){
          clearAround()
        }
      }
      animationFn()
    },
    explosionCreate(item){
      let {
        defaultFill,
        config:{
          x,
          y,
          radius,
        }
      } = item,
      spreadScope = 10,
      explosionObj = {
        id: new Date * 1 + Math.random() + '',
        createTime: this.masterTime,
        maxScope: radius + spreadScope,
        spreadScope,
        duration: this.fpsUnifyHandle(15),
        config:{
          x,
          y,
          radius,
          stroke: defaultFill,
          strokeWidth: 2,
          listening:false
        }
      }
      this.explosionList.push(explosionObj)
      return explosionObj
    },
    explosionAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      {
        id,
        maxScope,
        duration,
        spreadScope
      } = item

      let animationFn = () => {
        item.config.radius += spreadScope / duration

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearExplosion = () => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.explosionList, {id:id})
              if(itemIndex || itemIndex + '' === '0'){
                this.explosionList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        if(item.config.radius >= maxScope){
          clearExplosion()
        }
      }
      animationFn()
    },
    reflectionCreate(){
      // let xStep = Math.random() * 100,
      // yStep = Math.sqrt(Math.pow(100, 2) - Math.pow(xStep, 2))

      // if(Math.random() <= 0.5){
      //   xStep = -xStep
      // }
      // if(Math.random() <= 0.5){
      //   yStep = -yStep
      // }
      // xStep = xStep / this.fps * this.roleInfo.reflection.speed
      // yStep = yStep / this.fps * this.roleInfo.reflection.speed

      let closestEnemy = this.closestCalc(this.centerP, this.enemyList)
      if(!closestEnemy)return null
      let {
        oxDis,
        oyDis,
        distance
      } = this.distanceCalc(this.centerP, {...closestEnemy.config}),
      xStep = -(100 / distance) * oxDis / this.fps * this.roleInfo.reflection.speed,
      yStep = -(100 / distance) * oyDis / this.fps * this.roleInfo.reflection.speed

      let obj = {
        id:new Date * 1 + Math.random() + '',
        createTime:this.masterTime,
        atkEnemyId:[],
        atkTime:0,
        through:0,
        xStep,
        yStep,
        nowReflection:'',
        config:{
          x: this.centerP.x,
          y: this.centerP.y,
          innerRadius: 2,
          outerRadius: 4,
          fill: '#9900FF',
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
          listening:false
        }
      }

      this.reflectionList.push(obj)
      return obj
    },
    reflectionAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      {
        damage,
        duration,
        through
      } = this.roleInfo.reflection

      let animationFn = () => {
        if(item.config.x <= this.screenRoleX && item.nowReflection !== '4'){
          item.nowReflection = '4'
          item.xStep = -item.xStep
        }else if(item.config.x >= this.screenRoleX + this.stageBoxConfig.width && item.nowReflection !== '2'){
          item.nowReflection = '2'
          item.xStep = -item.xStep
        }else if(item.config.y <= this.screenRoleY && item.nowReflection !== '1'){
          item.nowReflection = '1'
          item.yStep = -item.yStep
        }else if(item.config.y >= this.screenRoleY + this.stageBoxConfig.height && item.nowReflection !== '3'){
          item.nowReflection = '3'
          item.yStep = -item.yStep
        }

        item.config.x += item.xStep
        item.config.y += item.yStep

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearReflection = () => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.reflectionList, {id:item.id})
              if(itemIndex || itemIndex + '' === '0'){
                this.reflectionList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        if(this.masterTime - item.createTime >= this.fps * duration){
          clearReflection()
        }else{
          let {
            config:{
              x,
              y,
              outerRadius
            }
          } = item

          for(let i=0, l=this.enemyList.length;i<l;i++){//for循环降低性能开销
            let itm = this.enemyList[i],
            {
              distance
            } = this.distanceCalc({x, y}, {...itm.config}),
            underAtkFn = () => {
              itm.hp -= damage

              item.atkTime = this.masterTime
              item.atkEnemyId.push(itm.id)
              // ++item.through
              // if(item.through > through){
              //   clearReflection()
              // }
              this.damageCreate(itm, damage)
            }

            if(distance <= itm.config.radius + outerRadius){
              if(item.atkEnemyId.includes(itm.id)){
                if(this.masterTime - item.atkTime >= 10){
                  underAtkFn()
                }
              }else{
                underAtkFn()
              }
              break
            }
          }
        }
      }
      animationFn()
    },
    lightCreate(){
      let cacheList = this.scopeCalc(this.centerP, this.roleInfo.light.atkScope, this.enemyList)
      if(cacheList.length < 1)return null

      let rdNum = randomValue({min: 0, max: cacheList.length - 1}),
      rdEnemy = cacheList[rdNum],
      {
        config:{
          x,
          y
        }
      } = rdEnemy,
      obj = {
        id:new Date * 1 + Math.random() + '',
        createTime:this.masterTime,
        damage:this.roleInfo.light.damage,
        maxScope:this.roleInfo.light.maxScope,
        finish:0,
        rect:{
          x,
          y: y - 70,
          width: 8,
          height: 0,
          offset: {
            x: 4,
            y: 0
          },
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 8, y: 0 },
          fillLinearGradientColorStops: [0, 'red', 0.5,  'yellow', 1, 'red'],
          shadowBlur: 5,
          shadowColor: '#FF6600',
          listening:false
        },
        circle:{
          x,
          y,
          radius: 0,
          stroke: '#FF6600',
          strokeWidth: 2,
          shadowBlur: 5,
          shadowColor: '#FF6600',
          listening:false
        }
      }
      this.lightList.push(obj)
      return obj
    },
    lightAnimationHandle(item){
      if(!item)return

      let rafId = null,
      {
        id,
        maxScope
      } = item

      let animationFn = () => {
        if(item.rect.height < 70 && !item.finish){
          item.rect.height += this.fpsUnifyHandle(5)
        }else{
          item.finish = 1
          if(item.rect.height > 0){
            item.rect.y += this.fpsUnifyHandle(5)
            item.rect.height -= this.fpsUnifyHandle(5)
          }
          item.circle.radius += this.fpsUnifyHandle(2)
        }

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearLight = () => {
          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.lightList, {id})
              if(itemIndex || itemIndex + '' === '0'){
                this.lightList.splice(itemIndex, 1)
              }
              break
            }
          }
        }

        let {
          damage,
          circle:{
            x,
            y,
            radius
          }
        } = item
        for(let i=0, l=this.enemyList.length;i<l;i++){//for循环降低性能开销
          let itm = this.enemyList[i]
          if(itm.underSkillAtkIds.includes(id))continue
          let {
            distance
          } = this.distanceCalc({x, y}, {...itm.config})

          if(distance <= radius){
            itm.underSkillAtkIds.push(id)
            itm.hp -= damage
            this.damageCreate(itm, damage)
          }
        }

        if(item.circle.radius >= maxScope){
          clearLight()
        }
      }
      animationFn()
    },
    treasureCreate(item){
      let {
        probability,
        cdCount,
        guaranteed,
        specialProbability,
        specialCdCount,
        specialGuaranteed,
        cacheKillCount
      } = this.roleInfo.treasure,
      {
        x,
        y
      } = item.config,
      rd = Math.random(),
      obj = {
        id: new Date * 1 + Math.random() + '',
        createTime: this.masterTime,
        specialReward: 0,
        config:{
          x,
          y,
          numPoints: 5,
          innerRadius: 5,
          outerRadius: 10,
          fill: '#FF9900',
          stroke: '#FF9900',
          strokeWidth: 1,
          shadowColor: 'black',
          shadowBlur: 2,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
          listening:false
        }
      },
      stars = this.$refs.treasure_box.getNode()

      if((rd <= specialProbability && this.totalKillCount - cacheKillCount >= specialCdCount) || this.totalKillCount % specialGuaranteed === 0){
        obj.config.fill = '#FFFF00'
        obj.specialReward = 1
        this.roleInfo.treasure.cacheKillCount = this.totalKillCount
      }else if((rd <= probability && this.totalKillCount - cacheKillCount >= cdCount) || this.totalKillCount % guaranteed === 0){
        this.roleInfo.treasure.cacheKillCount = this.totalKillCount
      }else{
        return null
      }

      this.treasureList.push(obj)
      this.treasureAnimationHandle(obj)
      this.$nextTick(() => {
        stars.cache()
      })
      return obj
    },
    treasureAnimationHandle(item){
      if(!item)return
      
      let rafId = null,
      {
        id,
        specialReward,
        config:{
          x,
          y,
          outerRadius
        }
      } = item

      let animationFn = () => {

        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        item['rafId'] = rafId

        let clearTreasure = () => {
          let stars = this.$refs.treasure_box.getNode()

          for(let i=0, l=this.rafIds.length;i<l;i++){
            if(this.rafIds[i] === rafId){
              cancelAnimationFrame(this.rafIds[i])
              this.rafIds.splice(i, 1)
              let itemIndex = _.findIndex(this.treasureList, {id:id})
              if(itemIndex || itemIndex + '' === '0'){
                stars.clearCache()
                this.treasureList.splice(itemIndex, 1)
                this.$nextTick(() => {
                  stars.cache()
                })
              }
              break
            }
          }
        }

        let {
          radius
        } = this.$refs.role.getNode().attrs,
        {
          distance
        } = this.distanceCalc({x, y}, this.centerP)

        if(distance <= outerRadius + radius){
          this.specialReward = specialReward
          clearTreasure()
          this.pauseHandle('pause')
          this.showRogueDialog = true
        }
      }
      animationFn()
    },
    damageCreate(item, damage){
      let obj = { ...item },
      {
        config:{
          x,
          y
        }
      } = obj

      item['underAnimationTime'] = this.masterTime
      item.config.fill = this.scintillationColor

      this.damageList.push({
        id:obj.id + new Date * 1 + Math.random() + '',
        createTime: this.masterTime,
        config:{
          text: '-' + damage,
          x,
          y,
          fill:'red',
          listening:false
        }
      })
    },
    scopeCalc(center, scope, itemList){
      let arr = _.cloneDeep(itemList),
      newArr = arr.filter(item => {
        let {
          distance
        } = this.distanceCalc(center, {...item.config})
        if(distance <= scope){
          return true
        }
      })
      return newArr
    },
    closestCalc(center, itemList){
      let arr = _.cloneDeep(itemList),
      cacheDis = 99999,
      newItem = null

      arr.forEach(item => {
        let {
          distance
        } = this.distanceCalc(center, {...item.config})
        if(distance < cacheDis){
          cacheDis = distance
          newItem = item
        }
      })
      return newItem
    },
    distanceCalc(center, target){
      let {
        x,
        y
      } = center,
      tx = target.x,
      ty = target.y,
      xDis = Math.abs(x - tx),
      yDis = Math.abs(y - ty),
      distance = Math.sqrt(Math.pow(xDis,2) + Math.pow(yDis,2)),
      oxDis = x - tx,
      oyDis = y - ty

      let obj = {
        xDis,
        yDis,
        distance,
        oxDis,
        oyDis
      }
      return obj
    },
    expHandle(enemy){
      this.roleInfo.exp += enemy.exp
      if(this.roleInfo.exp >= this.roleInfo.maxExp){
        this.pauseHandle('pause')
        this.damageList = []
        this.roleInfo.level++
        setTimeout(() => {
          // this.showExpDialog = true
          this.specialReward = 0
          this.showRogueDialog = true
          setTimeout(() => {
            this.$message({
              message:'升级啦!~~~~~~~~~~~',
              type:'success',
              center:true,
              duration: 1500
            })
          })
        },1)
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
          this.roleInfo.originalSpeed += 0.5
          this.roleInfo.speed = this.fpsUnifyHandle(this.roleInfo.originalSpeed)
          break
        case 'maxhp':
          this.roleInfo.maxhp += 10
          this.roleInfo.hp += 10
          break
        case 'hp':
          this.roleInfo.hp = this.roleInfo.maxhp
          break
        case 'skill.damage':
          this.roleInfo.skill.damage += 40
          break
        case 'skill.maxScope':
          this.roleInfo.skill.maxScope += 30
          break
        case 'skill.cd':
          if(this.roleInfo.skill.cd <= 0.5){
            return this.roleInfo.skill.cd = 0.5
          }
          this.roleInfo.skill.cd -= 1.5
          break
        case 'passive.damage':
          this.roleInfo.passive.damage += 20
          break
        case 'passive.duration':
          this.roleInfo.passive.duration += 2
          break
        case 'passive.cd':
          if(this.roleInfo.passive.cd <= 0.3)return
          this.roleInfo.passive.cd = Number((this.roleInfo.passive.cd - 0.3).toFixed(1))
          break
        case 'reflection.damage':
          this.roleInfo.reflection.damage += 20
          break
        case 'reflection.duration':
          this.roleInfo.reflection.duration += 2
          break
        case 'reflection.cd':
          if(this.roleInfo.reflection.cd <= 0.3)return
          this.roleInfo.reflection.cd = Number((this.roleInfo.reflection.cd - 0.3).toFixed(1))
          break
        case 'reflection.speed':
          this.roleInfo.reflection.speed += 0.3
          break
      }
      this.showExpDialog = false

      if(this.gameState !== 'pause')return
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
    rogueHandle(selectItem){
      selectItem.handle(this.roleInfo, {
        fpsUnifyHandle:this.fpsUnifyHandle
      })
      switch(selectItem.class){
        case 'skill':
        case 'passive':
        case 'reflection':
        case 'light':
          this.roleInfo[selectItem.class].get = true
          break
      }
      this.showRogueDialog = false

      if(this.gameState !== 'pause')return
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
      let {
        width,
        height
      } = this.configKonva
      if(this.centerP.x <= 0){
        this.centerP.x = 0
      }
      if(this.centerP.x >= width){
        this.centerP.x = width
      }
      if(this.centerP.y <= 0){
        this.centerP.y = 0
      }
      if(this.centerP.y >= height){
        this.centerP.y = height
      }
    },
    keyDown(){
      if(this.operatingMode !== '2')return
      document.body.onkeydown = (e) => {
        //事件对象兼容
        let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
        //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
        if(e1){
          let keys = [37, 38, 39, 40, 90]
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
    virtualBtnDown(key){
      // console.log('virtualBtnDown', key)
      let keys = [37, 38, 39, 40, 90],
      newkeys = []
      if(key.indexOf(',') > -1){
        newkeys = key.split(',')
      }else{
        newkeys = [key]
      }
      newkeys.forEach(item => {
        let numKey = Number(item)
        if(keys.includes(numKey) && !this.keyCode.includes(numKey)){
          this.keyCode.push(numKey)
        }
      })
    },
    virtualBtnUp(key){
      // console.log('virtualBtnUp', key)
      let newkeys = []
      if(key.indexOf(',') > -1){
        newkeys = key.split(',')
      }else{
        newkeys = [key]
      }
      newkeys.forEach(item => {
        let numKey = Number(item)
        if(this.keyCode.includes(numKey)){
          this.keyCode.splice(this.keyCode.indexOf(numKey), 1)
        }
      })
    },
    dragBoundFunc(pos){
      // console.log('dragBoundFunc', pos)
      let cachePoint = { ...this.centerP },
      {
        x,
        y
      } = pos.target.attrs,
      {
        width,
        height
      } = this.configKonva,
      rlx = cachePoint.x,
      rly = cachePoint.y

      if(x >= 0 && x <= width){
        rlx = x
      }
      if(y >= 0 && y <= height){
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
    virtualJoyFn(joyP, configP, type){
      if(type !== 'end'){
        let cachePoint = { ...this.centerP }
        this.lastCenterP = {
          x: cachePoint.x,
          y: cachePoint.y
        }
      }

      let {
        x,
        y
      } = joyP,
      {
        wx,
        hy
      } = configP,
      {
        speed
      } = this.roleInfo,
      xDis = Math.abs(x - wx),
      yDis = Math.abs(y - hy),
      xStep = 0,
      yStep = 0

      if(xDis === 0){
        yStep = speed
      }else{
        xStep = Math.cos(Math.atan(yDis / xDis)) * speed
        yStep = Math.sin(Math.atan(yDis / xDis)) * speed
      }
      
      if(x < wx){
        xStep *= -1 
      }
      if(y < hy){
        yStep *= -1
      }
      
      this.joyStep = {
        xStep,
        yStep,
        type
      }
    },
    pauseHandle(gameState){
      if(gameState === 'pause' && this.gameState !== 'operation')return
      this.gameState = gameState
      this.enableDrag = false
      cancelAnimationFrame(this.roleRafId)
      this.roleRafId = null

      for(let i=0, l=this.rafIds.length;i<l;i++){
        cancelAnimationFrame(this.rafIds[i])
      }
      this.rafIds = []

      // this.bulletList = this.bulletList.filter(item => {
      //   return this.masterTime - item.createTime < this.fps * 8.5
      // })
    },
    launchHandle(launchType){
      if(launchType !== 'start' && this.gameState !== 'pause')return
      this.gameState = 'operation'
      this.enableDrag = Boolean(this.operatingMode === '1')

      for(let i=0, l=this.enemyList.length;i<l;i++){
        if(!this.enemyList[i]){
          console.log(i, this.enemyList[i], this.enemyList)
          continue
        }
        this.enemyAnimationHandle(this.enemyList[i])
      }
      for(let i=0, l=this.skillList.length;i<l;i++){
        this.skillAnimationHandle(this.skillList[i])
      }
      for(let i=0, l=this.bulletList.length;i<l;i++){
        this.bulletAnimationHandle(this.bulletList[i])
      }
      for(let i=0, l=this.reflectionList.length;i<l;i++){
        this.reflectionAnimationHandle(this.reflectionList[i])
      }
      for(let i=0, l=this.aroundList.length;i<l;i++){
        this.aroundAnimationHandle(this.aroundList[i])
      }
      for(let i=0, l=this.explosionList.length;i<l;i++){
        this.explosionAnimationHandle(this.explosionList[i])
      }
      for(let i=0, l=this.lightList.length;i<l;i++){
        this.lightAnimationHandle(this.lightList[i])
      }
      for(let i=0, l=this.treasureList.length;i<l;i++){
        this.treasureAnimationHandle(this.treasureList[i])
      }
      this.startCreate()
    },
    fpsUnifyHandle(num, decimal, type){
      if(!type){
        if(!decimal){
          return num * 60 / this.fps
        }else{
          return Number((num * 60 / this.fps).toFixed(decimal))
        }
      }else{
        if(!decimal){
          return num * (this.fps / 60)
        }else{
          return Number((num * (this.fps / 60)).toFixed(decimal))
        }
      }
    },
    saveArchive(unMsg){
      let archive = _.cloneDeep(this._data)
      delete archive.bgList
      delete archive.keyCode
      delete archive.rafIds
      delete archive.damageList
      delete archive.explosionList
      delete archive.gameState
      localStorage.setItem('archive', JSON.stringify(archive))
      if(!unMsg){
        this.$message({
          message:'保存成功',
          type:'success',
          center:true
        })
      }
    },
    readArchive(){
      let archive = JSON.parse(localStorage.getItem('archive'))
      Object.assign(this._data, archive)
      this.$refs.treasure_box.getNode().cache()
      
      this.gameState = 'pause'
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
    handleCommand(command){
      switch(command){
        case 'pauseHandle':
          this.pauseHandle('pause')
          break
        case 'showSkillInfo':
          this.showSkillInfo = !this.showSkillInfo
          break
        default:
          this[command]()
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.TD_box{
  overflow: hidden;
  position: relative;
  .stage_box{
    background-color: #eee;
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;
    border: 2px solid #333;
    overflow: hidden;
    position: relative;
  }
  .stage{
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    // transition: transform 0.3s;
    // transition-timing-function: linear;
    transform: translate3d(var(--stageLeft), var(--stageTop), 0);
    /deep/ .konvajs-content{
      border: 2px solid #ff7e7e;
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
.mobile_role_info{
  width: 150px;
  position: absolute;
  top: 5px;
  left: 5px;
  opacity: 0.5;
}
.skill_info{
  width: 200px;
  display: flex;
  flex-direction: column;
  background-color: rgba($color: #00FFFF, $alpha: 0.2);
  padding: 2px;
  span{
    line-height: 18px;
  }
}
.passive_info{
  background-color: rgba($color: #FFCC00, $alpha: 0.2);
}
.reflection_info{
  background-color: rgba($color: #9900FF, $alpha: 0.2);
}
.light_info{
  background-color: rgba($color: #FF6600, $alpha: 0.2);
}
.mobile_other_info{
  width: 170px;
  overflow: hidden;
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0.5;
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
.mobile_function_btn{
  position: fixed;
  z-index: 1998;
  bottom: 140px;
  right: 10px;
  // .el-button{
  //   padding: 7px;
  // }
  // /deep/ .el-button+.el-button{
  //   margin-left: 5px;
  // }
  &.right_function_btn{
    right: auto;
    left: 10px;
  }
}
</style>

<template>
  <el-dialog
  :title="title"
  :visible="isShow"
  @open="dialogOpen"
  @close="dialogClose"
  class="dialog_box"
  custom-class="dialog_content"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  :show-close="false"
  >
    <div class="content_box">
      <div class="info_area enemy_info" v-show="showEnemyInfo">
        <ul class="states">
          <li class="name">名称: {{realTimeEnemyAttr.descName}}</li>
          <li>等级: {{realTimeEnemyAttr.level}}</li>
          <li>攻击: {{realTimeEnemyAttr.attack}}</li>
          <li>防御: {{realTimeEnemyAttr.defense}}</li>
          <li 
            class="progress_bar"
            :style="{
              '--progressBar':progressBarEnemyHp,
              '--progressColor':'rgb(255, 73, 73)'
            }"
          ><span>血量: {{realTimeEnemyAttr.hp}} / {{realTimeEnemyAttr.maxhp}}</span></li>
          <li>暴击: {{realTimeEnemyAttr.crit | percentageUnit}}</li>
          <li>暴击伤害: {{realTimeEnemyAttr.critDamage | percentageUnit}}</li>
          <li>闪避: {{realTimeEnemyAttr.dodge | percentageUnit}}</li>
          <li>当前状态: 
            <p 
              v-for="(item, index) in realTimeEnemyAttr.buff"
              :key="index"
              :class="item.type"
            >
              <span>【{{item.name}} | {{Math.ceil((item.endTime - masterTime) / 60)}} s】</span>
            </p>
          </li>
        </ul>
      </div>
      <div class="content">
        <div class="enemy_area">
          <RoleBlock
          :data="realTimeEnemyAttr"
          @enterBlock="enterRoleBlock"
          ></RoleBlock>
        </div>
        <div class="protagonist_area">
          <RoleBlock
          :data="realTimeProAttr"
          @enterBlock="enterRoleBlock"
          ></RoleBlock>
        </div>
        <div class="role_progress_box">
          <div class="role_progress_item enemy_progress_area">
            <div
            class="role_item"
            ref="enemyProgressBlock"
            >敌</div>
          </div>
          <div class="role_progress_bar"></div>
          <div class="role_progress_item pro_progress_area">
            <div
            class="role_item"
            ref="proProgressBlock"
            >我</div>
          </div>
        </div>
      </div>
      <div class="info_area protagonist_info">
        <ul class="states">
          <li class="name">角色名: {{realTimeProAttr.name}}</li>
          <li>等级: {{realTimeProAttr.level}}</li>
          <li>攻击: {{realTimeProAttr.attack}}</li>
          <li>防御: {{realTimeProAttr.defense}}</li>
          <li 
            class="progress_bar"
            :style="{
              '--progressBar':progressBarHp,
              '--progressColor':'rgb(255, 73, 73)'
            }"
          ><span>血量: {{realTimeProAttr.hp}} / {{realTimeProAttr.maxhp}}</span></li>
          <li>暴击: {{realTimeProAttr.crit | percentageUnit}}</li>
          <li>暴击伤害: {{realTimeProAttr.critDamage | percentageUnit}}</li>
          <li>闪避: {{realTimeProAttr.dodge | percentageUnit}}</li>
          <li>当前状态: 
            <p
              v-for="(item, index) in realTimeProAttr.buff"
              :key="index"
              :class="item.type"
            >
              <span>【{{item.name}} | {{Math.ceil((item.endTime - masterTime) / 60)}} s】</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
    <div slot="footer" class="dialog_footer">
      <template v-if="showFightBtn">
        <el-button type="primary" plain @click="fightBtnClick('fight')">战斗</el-button>
        <el-button type="primary" plain @click="fightBtnClick('defense')">防御</el-button>
        <el-button type="primary" plain @click="menuClickHandle('box')">道具</el-button>
        <el-button type="primary" plain disabled>技能(暂不可用)</el-button>
        <el-dropdown @command="autoFight">
          <el-button class="auto_fight_btn" type="primary" plain>自动战斗</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="fight">进攻优先</el-dropdown-item>
            <el-dropdown-item command="defense">防御优先</el-dropdown-item>
            <el-dropdown-item command="balance">平衡</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <el-button plain @click="dialogClose">{{status === 'fighting' ? '撤退' : '退出'}}</el-button>
    </div>
    <FightingFigureDialog
    :isShow.sync="showFigureDialog"
    :protagonist="proAttr"
    :dialogConfig="figureDialogConfig"
    @dbClickBlock="dbClickBlock"
    ></FightingFigureDialog>
    <div class="fighting_info" ref="fightList">
      <p
      v-for="(item,index) in fightList"
      :key="index"
      :class="item.identity ? `is_right ${item.specialState}` : `${item.specialState}`"
      >{{item.desc}}</p>
    </div>
  </el-dialog>
</template>
<script>
import fightDescData from '@/common/json/fightDescData.json'
import FightingFigureDialog from './FightingFigureDialog'
import RoleBlock from './RoleBlock'
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

export default {
  name:'MultiFightDialog',
  components: {
    FightingFigureDialog,
    RoleBlock
  },
  props:{
    isShow:{
      type:Boolean,
      default:false
    },
    nowEnemyData:{
      type:Object,
      default:() => {}
    },
    protagonistData:{
      type:Object,
      default:() => {}
    }
  },
  data(){
    return {
      masterTime:0,
      showFightBtn:false,
      isAuto:false,
      fightStyle:'',
      figureDialogConfig:{},
      showFigureDialog:false,
      showEnemyInfo:true,
      title:'战斗中',
      timer:null,
      status:'fighting',//fighting,win,lose
      fightList:[],
      count:1,
      proAttr:{},
      enemyAttr:{},
      realTimeProAttr:{
        buff:[]
      },
      realTimeEnemyAttr:{
        buff:[]
      },
      rafIds:[],
      randomDamageWeight:weightRandom({
        value:[0.9, 1, 1.1],
        weight:[10, 40, 10]
      }),
      proTypeWeight:{
        fight:weightRandom({
          value:['fight', 'defense'],
          weight:[40, 10]
        }),
        defense:weightRandom({
          value:['fight', 'defense'],
          weight:[15, 40]
        }),
        balance:weightRandom({
          value:['fight', 'defense'],
          weight:[25, 10]
        })
      },
      enemyTypeWeight:weightRandom({
        value:['fight', 'defense'],
        weight:[30, 10]
      }),
    }
  },
  filters: {
    percentageUnit:function(value){
      if(value || value + '' === '0'){
        return (value * 100).toFixed() + '%'
      }
      return ''
    }
  },
  computed: {
    progressBarHp(){
      return Math.ceil(this.realTimeProAttr.hp / this.realTimeProAttr.maxhp * 100) + '%'
    },
    progressBarEnemyHp(){
      return Math.ceil(this.realTimeEnemyAttr.hp / this.realTimeEnemyAttr.maxhp * 100) + '%'
    },
  },
  created(){
  },
  mounted() {
  },
  watch: {
    fightList() {
      this.$nextTick(() => {
        let h = this.$refs.fightList
        h.scrollTop = h.scrollHeight
      })
    }
  },
  methods:{
    dialogOpen(){
      this.status = 'fighting'
      //隔离数据
      this.proAttr = _.cloneDeep(this.protagonistData)
      this.enemyAttr = _.cloneDeep(this.nowEnemyData)
      this.proAttr['descName'] = this.protagonistData.name
      this.enemyAttr['descName'] = this.nowEnemyData.name + this.nowEnemyData.classDesc
      this.proAttr['buff'] = []
      this.enemyAttr['buff'] = []
      this.realTimeProAttr = this.proAttr
      this.realTimeEnemyAttr = this.enemyAttr
      this.$nextTick(() => {
        this.battleProgressHandle()
      })
    },
    dialogClose(){
      this.masterTime = 0
      this.isAuto = false
      this.fightStyle = ''
      this.title = '战斗中'
      this.status = 'fighting'
      this.fightList = []
      this.count = 1
      this.proAttr = {}
      this.enemyAttr = {}
      this.realTimeProAttr = {
        buff:[]
      }
      this.realTimeEnemyAttr = {
        buff:[]
      }
      this.$refs.enemyProgressBlock.style.left = 0
      this.$refs.proProgressBlock.style.left = 0

      clearTimeout(this.timer)
      clearInterval(this.timer)
      this.timer = null
      this.$emit('update:isShow',false)
    },
    enterRoleBlock(roleData, mouseType){
      //敌方信息窗口显示
      // if(roleData.isEnemy){
      //   this.showEnemyInfo = mouseType
      // }
    },
    battleProgressHandle(){
      this.showFightBtn = false
      this.rafIds = []
      let eneDom = this.$refs.enemyProgressBlock,
      proDom = this.$refs.proProgressBlock
      this.animationHandle(eneDom, 240, this.realTimeEnemyAttr.attRate)
      this.animationHandle(proDom, 240, this.realTimeProAttr.attRate, true)
    },
    animationHandle(domItem, distance, rate, type){
      let nowLeft = domItem.offsetLeft,
      framesMove = distance / 60 * rate,
      sumMove = 0 + nowLeft,
      rafId = null,
      animationFn = () => {
        sumMove += framesMove
        domItem.style.left = sumMove + 'px'
        if(rafId){
          this.rafIds.splice(this.rafIds.indexOf(rafId), 1)
        }
        rafId = window.requestAnimationFrame(animationFn)
        this.rafIds.push(rafId)
        // console.log(type, rafId, this.rafIds)
        if(type){
          this.masterTime++
        }
        if(this.masterTime % 5 === 0){
          this.buffDelete(type)
        }
        if(sumMove >= distance){
          // console.log('sumMove', sumMove, this.rafIds, this.masterTime)
          domItem.style.left = 0
          this.rafIds.forEach((item, idx) => {
            cancelAnimationFrame(item)
            if(item === rafId){
              this.rafIds.splice(idx, 1)
            }
          })
          if(type){
            if(this.isAuto){
              this.fightBtnClickHandle(this.fightStyle, this.isAuto, true)
            }else{
              this.showFightBtn = true
            }
          }else{
            this.fightBtnClickHandle()
          }
        }
      }
      animationFn()
    },
    autoFight(command){
      this.fightBtnClick(command, true)
    },
    fightBtnClick(type, isAuto){
      if(isAuto){
        this.isAuto = true
        this.fightStyle = type
      }
      this.fightBtnClickHandle(type, isAuto, true)
    },
    fightBtnClickHandle(type, isAuto, who){
      let fightType = type
      if(who){
        if(isAuto){
          fightType = randomValue({ arr:this.proTypeWeight[type] })
        }
      }else{
        fightType = randomValue({ arr:this.enemyTypeWeight })
      }
      this.fighting(fightType, who)
    },
    fighting(type, who){
        let pAttr = _.cloneDeep(this.proAttr),
        eAttr = _.cloneDeep(this.enemyAttr)
        
        let identity = Boolean(who),
        fightParams = {
          identity,
          attr: pAttr,
          otherAttr: eAttr,
          round: (this.count + 1) / 2,
          specialState: '',
          desc: randomValue({ arr:fightDescData.normalAtk })
        }
        if(!identity){
          fightParams.attr = eAttr
          fightParams.otherAttr = pAttr
          fightParams.round = this.count / 2
        }

        let fightData = this.fightHandle(fightParams, type)

        this.count++
        this.fightList.push({
          identity,
          desc:fightData.desc,
          specialState:fightData.specialState
        })

        this.fightStateJudgment()
    },
    fightHandle(data, type){
      let newData = _.cloneDeep(data)

      newData = this.skillHandle(newData)

      if(type === 'defense'){
        newData = this.defenseStateHandle(newData)
      }

      newData = this.buffHandle(newData)

      if(type === 'fight'){
        newData = this.damageHandle(newData)
      }

      if(newData.identity){
        this.proAttr.hp = newData.attr.hp
        this.enemyAttr.hp = newData.otherAttr.hp
        this.proAttr.buff = newData.attr.buff
        this.enemyAttr.buff = newData.otherAttr.buff
        this.realTimeProAttr = newData.attr
        this.realTimeEnemyAttr = newData.otherAttr
      }else{
        this.proAttr.hp = newData.otherAttr.hp
        this.enemyAttr.hp = newData.attr.hp
        this.proAttr.buff = newData.otherAttr.buff
        this.enemyAttr.buff = newData.attr.buff
        this.realTimeProAttr = newData.otherAttr
        this.realTimeEnemyAttr = newData.attr
      }

      return newData
    },
    skillHandle(data){//技能触发处理
      let newData = _.cloneDeep(data)
      newData.attr.skills.forEach(item => {
        if(this.masterTime >= item.cdEnd && Math.random() <= item.chance && item.condition(newData)){
          item.cdEnd = this.masterTime + item.cd
          switch(item.type){
            // case 'damage':{
            //   break
            // }
            case 'debuff':
            {
              newData.otherAttr.buff = this.buffAdd(newData.otherAttr.buff, item, this.masterTime)
              break
            }
            case 'buff':
            {
              newData.attr.buff = this.buffAdd(newData.attr.buff, item, this.masterTime)
              break
            }
            default:{
              item.effect(newData.attr)
            }
          }
          this.fightList.push({
            identity:newData.identity,
            desc:this.descHandle(item.desc,newData.attr.descName, newData.otherAttr.descName),
            specialState:'skill'
          })
        }
      })
      return newData
    },
    damageHandle(data){//伤害计算
      let newData = _.cloneDeep(data),
      critDamage = 1,
      randomDamage = randomValue({ arr:this.randomDamageWeight }),
      desc = newData.desc

      if(Math.random() <= newData.attr.crit){//暴击
        critDamage = newData.attr.critDamage
        newData.specialState = 'crit'
      }

      let damage = Math.floor(newData.attr.attack * (1 - (newData.otherAttr.defense * 0.06)/(newData.otherAttr.defense * 0.06 + 8)) * critDamage * randomDamage)
      
      damage = Math.floor(damage * newData.attr.damageMultiplier)//技能伤害加成

      damage = Math.floor(damage * (1 - newData.otherAttr.reduceDamageMultiplier))//减伤率

      if(damage <= 0){
        damage = 1
      }

      if(Math.random() <= newData.otherAttr.dodge){//闪避
        damage = 0
        newData.specialState = 'dodge'
        desc = randomValue({ arr:fightDescData.dodgeAtk })
      }
      
      newData.otherAttr.hp -= damage
      newData.desc = this.descHandle(desc,newData.attr.descName,newData.otherAttr.descName,damage)
      
      return newData
    },
    defenseStateHandle(data){
      let newData = _.cloneDeep(data),
      defenseSkill = {
        level: 1,
        type: 'buff',
        typeDesc: '防御',
        round:1,
        duration:1 / newData.attr.attRate * 60 - 1,
        cd:0,
        cdEnd:this.masterTime,
        chance:1,
        continueRound:1,
        desc:'@@@展开架势，准备防御$$$的进攻',
        skillDesc:'提高使用者的减伤率，防御一轮',
        effect: function(data){
          let newData = _.cloneDeep(data)
          newData.reduceDamageMultiplier = 0.5
          return newData
        }
      }
      newData.attr.buff = this.buffAdd(newData.attr.buff, defenseSkill, this.masterTime)
      newData.desc = this.descHandle(defenseSkill.desc, newData.attr.descName, newData.otherAttr.descName)
      return newData
    },
    buffAdd(buff, skill, createTime){//buff添加
      let arr = _.cloneDeep(buff),
      flag = _.findIndex(arr,['name',skill.typeDesc]),
      {
        type,
        typeDesc,
        duration,
        effect,
        level,
        cdEnd
      } = skill,
      newBuff = {
        id:randomValue({ min:1, max:99999999 }),
        name: typeDesc,
        type,
        level,
        createTime,
        duration,
        cdEnd,
        endTime:createTime + duration,
        effect
      }
      if(flag > -1){
        arr[flag] = newBuff
      }else{
        arr.push(newBuff)
      }
      return arr
    },
    buffHandle(data){//buff处理
      let newData = _.cloneDeep(data)

      newData.attr.buff.forEach(item => {
        newData.attr = item.effect(newData.attr)
      })
      newData.otherAttr.buff.forEach(item => {
        newData.otherAttr = item.effect(newData.otherAttr)
      })

      return newData
    },
    buffDelete(who){//buff移除
      let identity = who,
      fn = identity ? 'proAttr' : 'enemyAttr'

      if(this[fn].buff && this[fn].buff.length === 0)return

      this[fn].buff.forEach((item, index) => {
        if(this.masterTime >= item.endTime){
          this[fn].buff.splice(index, 1)
        }
      })
    },
    fightStateJudgment(){//战斗结果
      if(this.enemyAttr.hp <= 0 || this.proAttr.hp <= 0){
        let state = Boolean(this.proAttr.hp > 0)
        this.$message({
          message:state ? 'YOU WIN' : 'YOU LOSE',
          type:state ? 'success' : 'error',
          center:true
        })
        this.status = state ? 'win' : 'lose'
        this.title = '战斗结束'
        this.$emit('fightEnd',state,_.cloneDeep(this.proAttr),this.nowEnemyData)
        clearTimeout(this.timer)
        clearInterval(this.timer)
        this.timer = null
        return
      }
      this.battleProgressHandle()
    },
    descHandle(desc,part1,part2,damage){
      let text = desc
      text = text.replace(/(@@@|\$\$\$|&&&)/g,function($0, $1){
        return {
          '@@@': part1,
          '$$$': part2,
          '&&&': damage
        }[$1]
      })
      return text
    },
    menuClickHandle(name){
      this.figureDialogConfig = {
        menuTabName:name
      }
      this.showFigureDialog = true
    },
    dbClickBlock(item){
      switch(item.species){
        case 'medicine':{
          if(this.proAttr.hp === this.proAttr.maxhp)return
          let hp = this.proAttr.hp + item.hp
          if(hp > this.proAttr.maxhp){
            hp = this.proAttr.maxhp
          }
          this.proAttr.hp = hp
          this.realTimeProAttr.hp = hp
          this.boxItemAutoDestroy(item.id)
          break
        }
      }
    },
    boxItemAutoDestroy(id){//背包道具删除
      let boxIndex = _.findIndex(this.proAttr.box,['id',id])
      this.proAttr.box.splice(boxIndex,1)
    },
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 800px;
    .el-dialog__header{
      padding: 10px 20px;
      border-bottom: 1px solid #ddd;
    }
    .el-dialog__body{
      padding: 0;
      position: relative;
    }
    .content_box{
      width: 100%;
      position: relative;
      .info_area{
        width: 200px;
        min-height: 230px;
        position: absolute;
        bottom: 0;
        border: 1px solid #ddd;
        border-bottom: 0;
        padding: 8px;
        box-sizing: border-box;
        color: #333;
        &.protagonist_info{
          right: 0;
        }
        .states{
          li{
            margin-bottom: 3px;
            line-height: 18px;
            box-sizing: border-box;
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
            .buff{
              color: rgb(55, 158, 255);
            }
            .debuff{
              color: rgb(255, 67, 67);
            }
          }
        }
      }
      .content{
        width: 100%;
        height: 450px;
        box-sizing: border-box;
        overflow-y: auto;
        display: flex;
        align-items: center;
        flex-direction: column;
        .enemy_area{
          width: 70%;
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex: 1;
        }
        .protagonist_area{
          flex: 1;
          display: flex;
          align-items: center;
        }
        .role_progress_box{
          height: 70px;
          width: 281.5px;
          border: 1px solid pink;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
          box-sizing: border-box;
          .role_progress_item{
            flex: 1;
            width: 100%;
            position: relative;
            box-sizing: border-box;
            .role_item{
              width: 20px;
              height: 20px;
              background-color: #f50;
              position: absolute;
              top:50%;
              left: 0;
              transform: translateY(-50%);
              color: #fff;
              line-height: 20px;
              text-align: center;
              border-radius: 2px;
              &::after{
                content: '';
                width: 1px;
                height: 5px;
                background-color: #f50;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
              }
            }
            &.enemy_progress_area{
              .role_item{
                &::after{
                  top: 100%;
                }
              }
            }
            &.pro_progress_area{
              .role_item{
                &::after{
                  bottom: 100%;
                }
              }
            }
          }
          .role_progress_bar{
            height: 5px;
            width: 241.5px;
            background-color: pink;
          }
        }
      }
    }
    .el-dialog__footer{
      padding: 10px 20px;
      border-top: 1px solid #ddd;
      .auto_fight_btn{
        margin: 0 10px;
      }
    }
    .fighting_info{
      position: absolute;
      top: 0;
      left: -280px;
      width: 280px;
      height: 450px;
      background-color: #fff;
      flex: 1;
      border: 1px solid #ddd;
      padding: 8px 8px 0 8px;
      box-sizing: border-box;
      overflow-y: auto;
      p{
        font-size: 14px;
        line-height: 16px;
        margin-bottom: 15px;
        color: rgb(202, 0, 0);
        &.is_right{
          color: rgb(0, 37, 201);
          text-align: right;
        }
        &.crit{
          font-weight: bold;
          text-shadow: 0 0 5px rgb(255, 195, 28);
        }
        &.dodge{
          font-weight: bold;
          text-shadow: 0 0 5px rgb(186, 84, 255);
        }
        &.skill{
          font-weight: bold;
          // text-shadow: 0 0 5px rgb(255, 64, 64);
        }
      }
    }
  }
}
</style>

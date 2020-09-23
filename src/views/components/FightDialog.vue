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
      <div class="info_area enemy_info">
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
          <li>闪避: {{realTimeEnemyAttr.dodge | percentageUnit}}</li>
          <li>当前状态: 
            <p 
              v-for="(item, index) in realTimeEnemyAttr.buff"
              :key="index"
              :class="item.type"
            >
              <span>【{{item.name}} | {{item.continueRound}}回合】</span>
            </p>
          </li>
        </ul>
      </div>
      <div class="content" ref="fightList">
        <p
        v-for="(item,index) in fightList"
        :key="index"
        :class="item.identity ? `is_right ${item.specialState}` : `${item.specialState}`"
        >{{item.desc}}</p>
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
          <li>闪避: {{realTimeProAttr.dodge | percentageUnit}}</li>
          <li>当前状态: 
            <p
              v-for="(item, index) in realTimeProAttr.buff"
              :key="index"
              :class="item.type"
            >
              <span>【{{item.name}} | {{item.continueRound}}回合】</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
    <div slot="footer" class="dialog_footer">
      <el-button plain @click="dialogClose">{{status === 'fighting' ? '撤退' : '退出'}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import fightDescData from '@/common/json/fightDescData.json'
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

export default {
  name:'Dialog',
  components: {},
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
      randomDamageWeight:weightRandom({
        value:[0.9, 1, 1.1],
        weight:[10, 40, 10]
      })
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
      this.proAttr = _.cloneDeep(this.protagonistData)
      this.enemyAttr = _.cloneDeep(this.nowEnemyData)
      this.proAttr['descName'] = this.protagonistData.name
      this.enemyAttr['descName'] = this.nowEnemyData.name + this.nowEnemyData.classDesc
      this.proAttr['buff'] = []
      this.enemyAttr['buff'] = []
      this.realTimeProAttr = this.proAttr
      this.realTimeEnemyAttr = this.enemyAttr
      this.fighting()
    },
    dialogClose(){
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

      clearInterval(this.timer)
      this.timer = null
      this.$emit('update:isShow',false)
    },
    fighting(){
      this.timer = setInterval(() => {
        this.buffDelete()
        let pAttr = _.cloneDeep(this.proAttr),
        eAttr = _.cloneDeep(this.enemyAttr)
        
        let identity = this.count % 2,
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

        let fightData = this.fightHandle(fightParams)

        this.count++
        this.fightList.push({
          identity,
          desc:fightData.desc,
          specialState:fightData.specialState
        })

        this.fightStateJudgment()
      },800)
    },
    fightHandle(data){
      let newData = {
        nfd:_.cloneDeep(data),//newFightData
        damageBoost:[]
      }

      newData = this.skillHandle(newData.nfd)

      newData.nfd = this.buffHandle(newData.nfd)

      newData = this.damageHandle(newData)

      if(newData.nfd.identity){
        this.proAttr.hp = newData.nfd.attr.hp
        this.enemyAttr.hp = newData.nfd.otherAttr.hp
        this.proAttr.buff = newData.nfd.attr.buff
        this.enemyAttr.buff = newData.nfd.otherAttr.buff
        this.realTimeProAttr = newData.nfd.attr
        this.realTimeEnemyAttr = newData.nfd.otherAttr
      }else{
        this.proAttr.hp = newData.nfd.otherAttr.hp
        this.enemyAttr.hp = newData.nfd.attr.hp
        this.proAttr.buff = newData.nfd.otherAttr.buff
        this.enemyAttr.buff = newData.nfd.attr.buff
        this.realTimeProAttr = newData.nfd.otherAttr
        this.realTimeEnemyAttr = newData.nfd.attr
      }

      return newData.nfd
    },
    skillHandle(data){//技能触发处理
      let newData = _.cloneDeep(data),
      damageBoost = []
      newData.attr.skills.forEach(item => {
        if(newData.round % item.round === 0 && Math.random() <= item.chance && item.condition(newData)){
          switch(item.type){
            case 'damage':{
              damageBoost.push(item.effect())
              break
            }
            case 'debuff':
            {
              newData.otherAttr.buff = this.buffAdd(newData.otherAttr.buff, item, newData.round)
              break
            }
            case 'buff':
            {
              newData.attr.buff = this.buffAdd(newData.attr.buff, item, newData.round)
              break
            }
            default:{
              newData.attr = item.effect(newData.attr)
            }
          }
          this.fightList.push({
            identity:newData.identity,
            desc:this.descHandle(item.desc,newData.attr.descName, newData.otherAttr.descName),
            specialState:'skill'
          })
        }
      })
      return {
        nfd: newData,
        damageBoost
      }
    },
    damageHandle(data){//伤害计算
      let newData = _.cloneDeep(data),
      critDamage = 1,
      randomDamage = randomValue({ arr:this.randomDamageWeight }),
      desc = newData.nfd.desc

      if(Math.random() <= newData.nfd.attr.crit){
        critDamage = 1.5
        newData.nfd.specialState = 'crit'
      }

      let damage = Math.floor(newData.nfd.attr.attack * (1 - (newData.nfd.otherAttr.defense * 0.06)/(newData.nfd.otherAttr.defense * 0.06 + 8)) * critDamage * randomDamage)
      
      if(newData.damageBoost.length > 0){
        newData.damageBoost.forEach(item => {
          damage = Math.floor(damage * item)
        })
      }

      if(damage <= 0){
        damage = 1
      }

      if(Math.random() <= newData.nfd.otherAttr.dodge){
        damage = 0
        newData.nfd.specialState = 'dodge'
        desc = randomValue({ arr:fightDescData.dodgeAtk })
      }
      
      newData.nfd.otherAttr.hp -= damage
      newData.nfd.desc = this.descHandle(desc,newData.nfd.attr.descName,newData.nfd.otherAttr.descName,damage)
      
      return newData
    },
    buffAdd(buff, skill, createRound){//buff添加
      let arr = _.cloneDeep(buff),
      flag =  _.findIndex(arr,['name',skill.typeDesc]),
      {
        type,
        typeDesc,
        continueRound,
        effect,
        level
      } = skill,
      newBuff = {
        id:randomValue({ min:1, max:99999999 }),
        name: typeDesc,
        type,
        level,
        round: createRound,
        continueRound,
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
    buffDelete(){//buff移除
      let identity = this.count % 2,
      round = identity ? (this.count + 1) / 2 : this.count / 2,
      fn = identity ? 'proAttr' : 'enemyAttr'
      this[fn].buff.forEach((item, index) => {
        if(round - item.round >= item.continueRound){
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
        this.$emit('fightEnd',state,this.proAttr.hp,this.nowEnemyData)
        clearInterval(this.timer)
        this.timer = null
      }
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
    }
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
    }
    .content_box{
      width: 100%;
      display: flex;
      .info_area{
        width: 200px;
        padding: 8px;
        box-sizing: border-box;
        color: #333;
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
        flex: 1;
        border-left: 1px solid #ddd;
        border-right: 1px solid #ddd;
        padding: 8px 8px 0 8px;
        box-sizing: border-box;
        min-height: 300px;
        max-height: 500px;
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
    .el-dialog__footer{
      padding: 10px 20px;
      border-top: 1px solid #ddd;
    }
  }
}
</style>

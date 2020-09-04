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
    <div class="content" ref="fightList">
      <p
      v-for="(item,index) in fightList"
      :key="index"
      :class="item.identity ? `is_right ${item.specialState}` : `${item.specialState}`"
      >{{item.desc}}</p>
    </div>
    <div slot="footer" class="dialog_footer">
      <div class="info">
        <span>{{protagonistData.name}}血量{{php}}</span>
        <span>{{nowEnemyData.name+nowEnemyData.classDesc}}血量{{ehp}}</span>
      </div>
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
      php:0,
      ehp:0,
      count:1,
      randomDamageWeight:weightRandom({
        value:[0.9, 1, 1.1],
        weight:[10, 40, 10]
      })
    }
  },
  computed: {
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
      this.php = this.protagonistData.hp,
      this.ehp = this.nowEnemyData.hp
      this.fighting()
    },
    dialogClose(){
      this.title = '战斗中'
      this.status = 'fighting'
      this.fightList = []
      this.php = 0
      this.ehp = 0
      this.count = 1

      clearInterval(this.timer)
      this.timer = null
      this.$emit('update:isShow',false)
    },
    fighting(){
      let pAttr = _.cloneDeep(this.protagonistData),
      eAttr = _.cloneDeep(this.nowEnemyData)

      pAttr['descName'] = pAttr.name,
      eAttr['descName'] = eAttr.name + eAttr.classDesc

      console.log(`eatk:${eAttr.attack},edef:${eAttr.defense},ecrit:${eAttr.crit},edod:${eAttr.dodge}`)
      this.timer = setInterval(() => {
        pAttr.hp = this.php
        eAttr.hp = this.ehp
        
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
      },1000)
    },
    fightHandle(data){
      let newData = {
        nfd:_.cloneDeep(data),//newFightData
        damageBoost:[]
      }

      newData = this.skillHandle(newData.nfd)

      newData = this.damageHandle(newData)

      if(newData.nfd.identity){
        this.php = newData.nfd.attr.hp
        this.ehp = newData.nfd.otherAttr.hp
      }else{
        this.php = newData.nfd.otherAttr.hp
        this.ehp = newData.nfd.attr.hp
      }

      return newData.nfd
    },
    damageHandle(data){
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
    skillHandle(data){
      let newData = _.cloneDeep(data),
      damageBoost = []
      newData.attr.skills.forEach(item => {
        if(newData.round % item.round === 0 && Math.random() <= item.chance){
          let fightInfoFlag = false
          switch(item.type){
            case 'ascension':{
              if(item.condition()){
                newData.attr = item.effect(newData.attr)
                fightInfoFlag = true
              }
              break
            }
            case 'damage':{
              if(item.condition()){
                damageBoost.push(item.effect())
                fightInfoFlag = true
              }
              break
            }
            case 'reply':{
              if(item.condition(newData.attr)){
                newData.attr = item.effect(newData.attr)
                fightInfoFlag = true
              }
              break
            }
          }
          if(fightInfoFlag){
            this.fightList.push({
              identity:newData.identity,
              desc:this.descHandle(item.desc,newData.attr.name),
              specialState:'skill'
            })
          }
        }
      })
      return {
        nfd: newData,
        damageBoost
      }
    },
    fightStateJudgment(){
      if(this.ehp <= 0 || this.php <= 0){
        let state = Boolean(this.php > 0)
        this.$message({
          message:state ? 'YOU WIN' : 'YOU LOSE',
          type:state ? 'success' : 'error',
          center:true
        })
        this.status = state ? 'win' : 'lose'
        this.title = '战斗结束'
        this.$emit('fightEnd',state,this.php,this.nowEnemyData)
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
    width: 500px;
    .el-dialog__body{
      padding: 0;
    }
    .content{
      width: 100%;
      padding: 0 15px;
      box-sizing: border-box;
      max-height: 400px;
      overflow-y: auto;
      p{
        font-size: 14px;
        line-height: 16px;
        margin-bottom: 20px;
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
          text-shadow: 0 0 5px rgb(255, 64, 64);
        }
      }
    }
    .dialog_footer{
      display: flex;
      justify-content: space-between;
      .info{
        display: flex;
        align-items: center;
        span{
          margin-right: 20px;
        }
      }
    }
  }
}
</style>

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
      }),
      specialState:''
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
      let pAttr = {
        name:this.protagonistData.name,
        atk:this.protagonistData.attack,
        def:this.protagonistData.defense,
        crit:this.protagonistData.crit,
        dodge:this.protagonistData.dodge,
        maxhp:this.protagonistData.maxhp
      },
      eAttr = {
        name:this.nowEnemyData.name + this.nowEnemyData.classDesc,
        atk:this.nowEnemyData.attack,
        def:this.nowEnemyData.defense,
        crit:this.nowEnemyData.crit,
        dodge:this.nowEnemyData.dodge,
        maxhp:this.nowEnemyData.maxhp
      }

      console.log(`eatk:${eAttr.atk},edef:${eAttr.def},ecrit:${eAttr.crit},edod:${eAttr.dodge}`)
      this.timer = setInterval(() => {
        let damage = 0,
        identity = this.count % 2,
        desc = randomValue({ arr:fightDescData.normalAtk })
        this.specialState = ''

        if(identity){
          damage = this.damageHandle(pAttr,eAttr,identity)
          if(this.specialState === 'dodge'){
            desc = randomValue({ arr:fightDescData.dodgeAtk })
          }
          this.ehp = this.ehp - damage
          desc = this.descHandle(desc,pAttr.name,eAttr.name,damage)
        }else{
          damage = this.damageHandle(eAttr,pAttr,identity)
          if(this.specialState === 'dodge'){
            desc = randomValue({ arr:fightDescData.dodgeAtk })
          }
          this.php = this.php - damage
          desc = this.descHandle(desc,eAttr.name,pAttr.name,damage)
        }
        this.count++
        this.fightList.push({
          identity,
          desc,
          specialState:this.specialState
        })

        this.fightStateJudgment()
      },1000)
    },
    damageHandle(attr, otherAttr, identity){
      let skillOut = this.skillHandle({
        time:'after',
        count:this.count,
        identity,
        attr
      }),
      critDamage = 1,
      randomDamage = randomValue({ arr:this.randomDamageWeight }),
      atk = Math.floor(attr.atk * skillOut.atkAscension)

      if(Math.random() <= attr.crit){
        critDamage = 1.5
        this.specialState = 'crit'
      }

      let damage = Math.floor(atk * (1 - (otherAttr.def * 0.06)/(otherAttr.def * 0.06 + 8)) * critDamage * randomDamage)
      damage = Math.floor(damage * skillOut.damageAscension)
      if(damage <= 0){
        damage = 1
      }

      if(Math.random() <= otherAttr.dodge){
        damage = 0
        this.specialState = 'dodge'
      }
      return damage
    },
    skillHandle(data){
      let obj = {
        atkAscension:1,
        damageAscension:1
      },
      fn = 'nowEnemyData',
      round = data.count / 2,
      hpTarget = 'ehp'
      if(data.identity){
        fn = 'protagonistData'
        round = (data.count + 1) / 2
        hpTarget = 'php'
      }

      this[fn].skills.forEach(item => {
        if(round % item.round === 0 && Math.random() <= item.chance){
          let fightInfoFlag = false
          switch(item.type){
            case 'ascension':{
              if(item.condition()){
                obj.atkAscension += item.effect()
                fightInfoFlag = true
              }
              break
            }
            case 'damage':{
              if(item.condition()){
                obj.damageAscension += item.effect()
                fightInfoFlag = true
              }
              break
            }
            case 'reply':{
              if(item.condition({
                hp:this[hpTarget],
                maxhp:data.attr.maxhp
              })){
                let newhp = this[hpTarget] + item.effect(data.attr.maxhp)
                if(newhp > data.attr.maxhp){
                  newhp = data.attr.maxhp
                }
                this[hpTarget] = newhp
                fightInfoFlag = true
              }
              break
            }
          }
          if(fightInfoFlag){
            this.fightList.push({
              identity:data.identity,
              desc:this.descHandle(item.desc,data.attr.name),
              specialState:'skill'
            })
          }
        }
      })
      return obj
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

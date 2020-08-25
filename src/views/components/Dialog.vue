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
      :class="item.identity ? 'is_right' : null"
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
      count:1
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
      let patk = this.protagonistData.attack,
      pdef = this.protagonistData.defense,
      eatk = this.nowEnemyData.attack,
      edef = this.nowEnemyData.defense,
      classDesc = this.nowEnemyData.name + this.nowEnemyData.classDesc
      
      console.log(`patk:${patk},edef:${edef},eatk:${eatk},pdef:${pdef}`)
      this.timer = setInterval(() => {
        let damage = 0,
        identity = this.count % 2,
        desc = fightDescData[this.randomValue({ min:0, max:fightDescData.length - 1 })]

        if(identity){
          damage = this.damageHandle(patk, edef)
          this.ehp = this.ehp - damage
          desc = this.descHandle(desc,this.protagonistData.name,classDesc,damage)
        }else{
          damage = this.damageHandle(eatk, pdef)
          this.php = this.php - damage
          desc = this.descHandle(desc,classDesc,this.protagonistData.name,damage)
        }
        this.count++
        this.fightList.push({
          identity,
          desc
        })

        this.fightStateJudgment()
      },1000)
    },
    damageHandle(atk, def){
      let damage = Math.floor(atk * (1 - (def * 0.06)/(def * 0.06 + 5)) * this.randomValue({min:7, max:11}) / 10)
      if(damage <= 0){
        damage = 1
      }
      return damage
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
    },
    randomValue(config={}){
      let configs = Object.assign({
        min:1,
        max:10,
      },config)
      return Math.floor(Math.random() * ( configs.max - configs.min + 1 ) + configs.min)
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

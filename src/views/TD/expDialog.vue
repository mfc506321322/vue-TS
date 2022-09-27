<template>
  <el-dialog
    title="升级加点"
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
      <ul class="power_list">
        <li class="power_list_list">
          <span>攻击力 + 20</span>
          <el-button type="primary" @click="upgradeHandle('atk')">升级</el-button>
        </li>
        <!-- <li class="power_list_list">
          <span>攻击范围 + 10</span>
          <el-button type="primary" @click="upgradeHandle('maxAtkScope')">升级</el-button>
        </li> -->
        <li class="power_list_list">
          <span>子弹数量 + 0.5</span>
          <el-button type="primary" @click="upgradeHandle('bulletCount')">升级</el-button>
        </li>
        <li class="power_list_list">
          <span>攻击频率 + 0.25次/秒</span>
          <el-button type="primary" @click="upgradeHandle('atkInterval')">升级</el-button>
        </li>
        <li class="power_list_list">
          <span>键盘移动速度 + 30像素/秒</span>
          <el-button type="primary" @click="upgradeHandle('speed')">升级</el-button>
        </li>
        <li class="power_list_list">
          <span>最大血量 + 10</span>
          <el-button type="primary" @click="upgradeHandle('maxhp')">升级</el-button>
        </li>
        <li class="power_list_list reply">
          <span>回复满血量</span>
          <el-button type="primary" @click="upgradeHandle('hp')">回复</el-button>
        </li>
        <li class="power_list_list skill">
          <span>技能伤害 + 40</span>
          <el-button type="primary" @click="upgradeHandle('skill.damage')">升级</el-button>
        </li>
        <li class="power_list_list skill">
          <span>技能范围 + 30像素</span>
          <el-button type="primary" @click="upgradeHandle('skill.maxScope')">升级</el-button>
        </li>
        <li class="power_list_list skill">
          <span>技能cd - 1.5秒</span>
          <el-button type="primary" @click="upgradeHandle('skill.cd')" :disabled="infoData.skill.cd <= 0.5">升级</el-button>
        </li>
        <li class="power_list_list passive">
          <span>被动伤害 + 20</span>
          <el-button type="primary" @click="upgradeHandle('passive.damage')">升级</el-button>
        </li>
        <li class="power_list_list passive">
          <span>被动持续时间 + 2秒</span>
          <el-button type="primary" @click="upgradeHandle('passive.duration')">升级</el-button>
        </li>
        <li class="power_list_list passive">
          <span>被动间隔 - 0.3秒</span>
          <el-button type="primary" @click="upgradeHandle('passive.cd')" :disabled="infoData.passive.cd <= 0.3">升级</el-button>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>
<script>

export default {
  name:'expDialog',
  components: {
  },
  props:{
    isShow:{
      type:Boolean,
      default:false
    },
    infoData:{
      type:Object,
      default:() => {}
    },
  },
  data(){
    return {
    }
  },
  filters: {},
  computed: {
  },
  created() {
  },
  mounted() {
  },
  watch: {},
  methods:{
    dialogOpen(){
    },
    dialogClose(){
      this.$emit('update:isShow',false)
    },
    upgradeHandle(type){
      this.$emit('upgradeHandle', type)
    },
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 300px;
    margin-top: 5vh !important;
    .el-dialog__body{
      padding: 20px 20px 10px;
    }
    .content_box{
      max-height: 520px;
      overflow-y: auto;
      .power_list{
        .power_list_list{
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-left: 5px;
          border-radius: 4px;
          overflow: hidden;
        }
        .skill{
          background-color: rgba($color: #00FFFF, $alpha: 0.2);
        }
        .reply{
          background-color: rgba($color: #ff4400, $alpha: 0.2);
        }
        .passive{
          background-color: rgba($color: #FFCC00, $alpha: 0.2);
        }
      }
    }
  }
}
</style>

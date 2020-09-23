<template>
  <el-dialog
    :visible="isShow"
    @open="dialogOpen"
    @close="dialogClose"
    class="dialog_box"
    custom-class="dialog_content"
    :close-on-click-modal="false"
  >
    <div class="content_box">
      <el-tabs type="card" class="tab_box">
        <el-tab-pane label="背包">
          <div class="box_content">
            <div class="content_left">
              <ul class="select_item">
                <li>
                  <span class="select_item_title">装备武器:</span>
                  <BlockMenu
                    class="select_item_block"
                    :data="[protagonist.selectWeapon]"
                  ></BlockMenu>
                </li>
                <li>
                  <span class="select_item_title">装备防具:</span>
                  <BlockMenu
                    class="select_item_block"
                    :data="[protagonist.selectArmor]"
                  ></BlockMenu>
                </li>
              </ul>
            </div>
            <div class="content_right">
              <BlockMenu
                :data="boxData"
              ></BlockMenu>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="技能">
          <Skill
          :protagonistData="protagonist"
          ></Skill>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import BlockMenu from './BlockMenu'
import Skill from './Skill'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

export default {
  name:'FigureDialog',
  components: {
    BlockMenu,
    Skill
  },
  props:{
    isShow:{
      type:Boolean,
      default:false
    },
    protagonist:{
      type:Object,
      default:() => {}
    }
  },
  data(){
    return {
      boxData:[]
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
  },
  created() {
  },
  mounted() {
    this.boxData = this.boxDataHandle()
  },
  watch: {
  },
  methods:{
    dialogOpen(){
      this.boxData = this.boxDataHandle()
    },
    dialogClose(){
      this.$emit('update:isShow',false)
    },
    boxDataHandle(){
      let arr = _.cloneDeep(this.protagonist.box)
      let nullItem = this.protagonist.maxBox - this.protagonist.box.length
      for(let i=1;i<=nullItem;i++){
        arr.push({})
      }
      console.log(arr,nullItem)
      return arr
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 800px;
    .el-dialog__header{
      padding: 0;
      .el-dialog__headerbtn{
        z-index: 999;
        top: 12px;
      }
    }
    .el-dialog__body{
      color: #333;
      padding: 0;
    }
    .content_box{
      min-height: 300px;
      .tab_box{
        .el-tabs__header{
          margin-bottom: 0;
        }
        .el-tabs__content{
          padding: 10px;
        }
        .box_content{
          min-height: 300px;
          display: flex;
          .content_left{
            width: 150px;
            border-right: 1px solid #666;
            padding-right: 5px;
            .select_item{
              li{
                display: flex;
                .select_item_title{
                  margin-right: 10px;
                }
              }
            }
          }
          .content_right{
            padding-left: 10px;
          }
        }
      }
    }
  }
}
</style>

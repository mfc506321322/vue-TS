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
      <el-tabs type="card" class="tab_box" :value="dialogConfig.menuTabName">
        <el-tab-pane label="背包" name="box">
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
                <li>
                  <span class="select_item_title">装备饰品:</span>
                  <BlockMenu
                    class="select_item_block block_box_vertical"
                    :data="protagonist.selectAccessories"
                    :maxNum="2"
                  ></BlockMenu>
                </li>
              </ul>
            </div>
            <div class="content_right">
              <template v-if="dialogConfig.openTreasure">
                <span class="box_title">宝箱:</span>
                <BlockMenu
                  class="treasure_box"
                  :data="treasureData"
                  :maxNum="treasureBoxMax"
                  @clickBlock="clickBlock"
                ></BlockMenu>
              </template>
              <span class="box_title">背包:</span>
              <BlockMenu
                :data="protagonist.box"
                :maxNum="protagonist.maxBox"
                :openDelete="true"
                @dbClickBlock="dbClickBlock"
                @enterItemDestroy="enterItemDestroy"
              ></BlockMenu>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="技能" name="skill">
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
    },
    treasureData:{
      type:Array,
      default:() => []
    },
    treasureBoxMax:{
      type: Number,
      default: 1
    },
    dialogConfig:{
      type:Object,
      default:() => {}
    }
  },
  data(){
    return {
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
  },
  watch: {},
  methods:{
    dialogOpen(){
    },
    dialogClose(){
      this.$emit('update:isShow',false)
    },
    clickBlock(item){
      this.$emit('treasureBoxClick', item)
    },
    dbClickBlock(item){
      this.$emit('boxItemClick', item)
    },
    enterItemDestroy(item){
      this.$emit('enterItemDestroy', item)
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 680px;
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
            flex-shrink: 0;
            border-right: 1px solid #666;
            padding-right: 5px;
            .select_item{
              li{
                display: flex;
                .select_item_title{
                  margin-right: 10px;
                }
                .block_box_vertical{
                  width: 52px;
                }
              }
            }
          }
          .content_right{
            padding-left: 10px;
            .box_title{
              font-size: 14px;
              margin-bottom: 10px;
              display: block;
            }
            .treasure_box{
              padding-bottom: 5px;
              border-bottom: 1px solid #666;
              margin-bottom: 10px;
            }
          }
        }
      }
    }
  }
}
</style>

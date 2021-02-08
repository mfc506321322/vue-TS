<template>
  <el-dialog
    :visible="isShow"
    @open="dialogOpen"
    @close="dialogClose"
    class="figure_dialog_box"
    custom-class="figure_dialog_content"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="figure_content_box">
      <el-tabs type="card" class="tab_box" :value="dialogConfig.menuTabName">
        <el-tab-pane label="背包" name="box">
          <div class="box_content">
            <div class="content_right">
              <span class="box_title">背包道具:</span>
              <BlockMenu
                :data="box"
                :maxNum="protagonist.maxBox"
                @dbClickBlock="dbClickBlock"
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
  name:'FightingFigureDialog',
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
    box:function(){
      if(!this.protagonist.box)return []
      return this.protagonist.box.filter(item => {
        return item.species === 'medicine'
      })
    }
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
    dbClickBlock(item){
      this.$emit('dbClickBlock', item)
    }
  }
}
</script>
<style lang="scss" scoped>
.figure_dialog_box{
  /deep/ .figure_dialog_content{
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
    .figure_content_box{
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

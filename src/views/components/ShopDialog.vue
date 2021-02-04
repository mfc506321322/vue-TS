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
      <el-tabs type="card" class="tab_box" value="item">
        <el-tab-pane label="道具" name="item">
          <div class="box_content">
            <div class="content_left">
              <span>持有金额：{{protagonist.price}}金</span>
            </div>
            <div class="content_right">
              <span class="box_title">商店:</span>
              <BlockMenu
                class="treasure_box"
                :data="treasureData"
                :maxNum="treasureData.length"
                @dbClickBlock="dbClickBlock"
              ></BlockMenu>
              <span class="box_title">背包:</span>
              <BlockMenu
                :data="protagonist.box"
                :maxNum="protagonist.maxBox"
                @dbClickBlock="boxDbClickBlock"
              ></BlockMenu>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="镶嵌" name="mosaic">
          镶嵌
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import BlockMenu from './BlockMenu'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

export default {
  name:'ShopDialog',
  components: {
    BlockMenu
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
    },
    treasureData:{
      type:Array,
      default:() => []
    },
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
    dbClickBlock(item){
      this.$emit('shopItemClick', item, 'shop')
    },
    boxDbClickBlock(item){
      this.$emit('boxItemClick', item)
    },
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

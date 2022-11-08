<template>
  <el-dialog
    :title="special ? '特殊奖励选择' : '奖励选择'"
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
      <ul class="rogue_list">
        <li
          v-for="(item, idx) in rewardList"
          :key="idx"
          :class="`rogue_item ${item.class}`"
          @click="rogueHandle(item)"
        >
          <div class="item_icon">
            <i :class="item.icon"></i>
          </div>
          <div class="item_desc">
            <span class="item_title">{{item.title}}</span>
            <span class="item_value">{{item.effectDesc}}</span>
            <span class="item_unit">{{item.unit}}</span>
          </div>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'
import rewardConfig from './config/reward'

export default {
  name:'rogueDialog',
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
      rewardList:[],
      special:false
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
      if(this.infoData.level % 5 === 0){
        this.special = true
        this.rewardList = rewardConfig
      }else{
        this.special = false
        do {
          let item = rewardConfig[randomValue({min:0, max:rewardConfig.length -1 })],
          isFind = _.find(this.rewardList, ['title', item.title])
          if(!isFind){
            this.rewardList.push(item)
          }
        } while (this.rewardList.length < 3);
      }
    },
    dialogClose(){
      this.rewardList = []
      this.$emit('update:isShow',false)
    },
    rogueHandle(item){
      this.$emit('rogueHandle', item)
    },
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    // width: 300px;
    margin-top: 5vh !important;
    width: 260px;
    .el-dialog__body{
      padding: 20px 20px 10px;
    }
    .content_box{
      .rogue_list{
        .rogue_item{
          margin-bottom: 20px;
          border-radius: 4px;
          box-shadow: 0 2px 12px 0 rgba($color: #000000, $alpha: 0.1);
          .item_icon{
            width: 100%;
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 45px;
          }
          .item_desc{
            padding: 15px;
            text-align: center;
          }
        }
        .bullet{
          background-color: rgba($color: #00ec00, $alpha: 0.1);
        }
        .skill{
          background-color: rgba($color: #00FFFF, $alpha: 0.1);
        }
        .reply{
          background-color: rgba($color: #ff0000, $alpha: 0.1);
        }
        .passive{
          background-color: rgba($color: #FFCC00, $alpha: 0.1);
        }
        .reflection{
          background-color: rgba($color: #9900FF, $alpha: 0.1);
        }
        .light{
          background-color: rgba($color: #FF6600, $alpha: 0.1);
        }
      }
    }
  }
}
</style>

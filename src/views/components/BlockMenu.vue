<template>
  <div class="block_box">
    <ul class="block_list">
      <li
        v-for="(item, index) in boxData"
        :key="index"
        class="block_item"
      >
        <el-tooltip
          placement="top" 
          effect="light" 
          popper-class="box_tooltip_box"
          :open-delay="200"
          :enterable="false"
          v-if="item.id"
        >
          <div class="tooltip_content" slot="content">
            <span>名称: {{item.typeDesc}}</span>
            <span>物品种类: {{item.speciesDesc}}</span>
            <span>等级: {{item.level}}</span>
            <template v-if="item.species === 'weapon'">
              <span>攻击: {{item.attack}}</span>
              <span v-if="item.crit">暴击: {{item.crit | percentageUnit}}</span>
            </template>
            <template v-if="item.species === 'armor'">
              <span>防御: {{item.defense}}</span>
              <span v-if="item.dodge">闪避: {{item.dodge | percentageUnit}}</span>
            </template>
            <span v-if="item.species === 'medicine'">回血: {{item.hp}}</span>
            <template v-if="item.species === 'skill'">
              <span>冷却回合: {{item.round}}</span>
              <span>持续回合: {{item.continueRound}}</span>
              <span>触发几率: {{item.chance | percentageUnit}}</span>
            </template>
            <span>价格: {{item.price}}金</span>
          </div>
          <div 
            :class="`block_content ${item.styleClass}`"
            @click="clickBlock(item)"
            @dblclick="dbClickBlock(item)"
          >
            <div class="hover_layer">
              <el-popconfirm
                v-if="openDelete"
                class="item_destroy_box"
                confirmButtonText='确定'
                cancelButtonText='取消'
                icon="el-icon-info"
                iconColor="red"
                title="确定要丢弃该道具吗？"
                @onConfirm="enterItemDestroy(item)"
              >
                <el-icon class="el-icon-close item_destroy" slot="reference"></el-icon>
              </el-popconfirm>
            </div>
            <span class="block_title">{{item.speciesDesc}}</span>
            <span class="block_text">{{item.typeDesc}}</span>
          </div>
        </el-tooltip>
        <em>{{index + 1}}</em>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'BlockMenu',
  components: {},
  props: {
    data: {
      type: Array,
      default: () => []
    },
    openDelete: {
      type: Boolean,
      default: false
    },
    maxNum:{
      type: Number,
      default: 1
    }
  },
  data() {
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
    data:{
      handler:function(){
        if(this.data.length <= this.maxNum){
          this.boxData = this.boxDataHandle()
        }
      },
      deep:true
    }
  },
  methods: {
    boxDataHandle(){
      let arr = _.cloneDeep(this.data)
      let nullItem = this.maxNum - this.data.length
      for(let i=1;i<=nullItem;i++){
        arr.push({})
      }
      return arr
    },
    clickBlock(item){
      this.$emit('clickBlock', item)
    },
    dbClickBlock(item){
      this.$emit('dbClickBlock', item)
    },
    enterItemDestroy(item){
      this.$emit('enterItemDestroy', item)
    },
  }
}
</script>
<style lang="scss" scoped>
.weapon_item{
  background-color: #ffb649;
}
.armor_item{
  background-color: #ADD8E6;
}
.medicine_item{
  background-color: #ff7e7e;
}
.skill_item{
  background-color: #83e976;
}
.block_box{
  .block_list{
    display: flex;
    flex-wrap: wrap;
    .block_item{
      width: 45px;
      height: 45px;
      border: 1px solid #666;
      border-radius: 5px;
      margin-right: 5px;
      margin-bottom: 5px;
      position: relative;
      overflow: hidden;
      &:hover{
        border: 1px solid rgb(255, 166, 32);
      }
      .block_content{
        width: 100%;
        height: 100%;
        padding: 4px;
        box-sizing: border-box;
        color: #333;
        cursor: pointer;
        position: relative;
        .hover_layer{
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 999;
          .item_destroy_box{
            position: absolute;
            right: 1px;
            top: 1px;
            display: none;
          }
          &:hover{
            background: rgba(255, 233, 32, 0.25);
            .item_destroy_box{
              display: block;
            }
          }
        }
        &>span{
          display: block;
          font-size: 12px;
        }
        .block_title{
          margin-bottom: 2px;
        }
        .block_text{
          margin-left: -2px;
          transform: scale(0.9);
        }
      }
      em{
        position: absolute;
        right: 2px;
        bottom: 2px;
        z-index: 2;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>

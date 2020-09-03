<template>
  <div class="skill_block">
    <p class="skill_block_title">已掌握技能:</p>
    <ul class="skill_list">
      <li
        v-for="(item, index) in protagonistData.skills"
        :key="index"
      >
        <span class="skill_name">{{item.typeDesc}}</span>
        <img class="skill_img" src="@/assets/skill1.jpg" alt="">
      </li>
    </ul>
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
// import skills from '@/common/json/skills'
// import _ from 'lodash'
// import {
//   randomValue,
//   weightRandom
// } from '@/common/utils'

export default {
  name:'Skill',
  components: {},
  props:{
    protagonistData:{
      type:Object,
      default:() => {}
    }
  },
  data(){
    return {}
  },
  computed: {
    ...mapState('konva',[])
  },
  created(){
  },
  mounted() {},
  watch: {},
  methods:{
    ...mapMutations('konva',[
      'updateState'
    ])
  }
}
</script>
<style lang="scss" scoped>
.skill_block{
  flex: 1;
  .skill_block_title{
    margin-bottom: 5px;
  }
  .skill_list{
    width: 100%;
    height: 100%;
    display: flex;
    max-height: 223px;
    overflow-y: auto;
    flex-wrap: wrap;
    li{
      position: relative;
      margin-right: 5px;
      margin-bottom: 5px;
      .skill_name{
        position: absolute;
        font-size: 12px;
        width: 12px;
        right: 12px;
        top: 13px;
        font-family: "SimSun", "STSong";
      }
      .skill_img{
        width: 80px;
        height: auto;
        display: block;
      }
    }
  }
}
</style>

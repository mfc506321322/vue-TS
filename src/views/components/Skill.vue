<template>
  <div class="skill_block">
    技能
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import skills from '@/common/json/skills'
import _ from 'lodash'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

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
  mounted() {
    skills.damage[0].effect(321)
  },
  watch: {},
  methods:{
    ...mapMutations('konva',[
      'updateState'
    ])
  }
}
</script>
<style lang="scss" scoped>
</style>

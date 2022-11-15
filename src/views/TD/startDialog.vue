<template>
  <el-dialog
    title="开始设置"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="操作模式" prop="operatingMode">
          <el-radio-group v-model="form.operatingMode">
            <el-radio-button label="2">方向键移动</el-radio-button>
            <el-radio-button label="1" disabled>鼠标移动</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.operatingMode === '2' && isMobile" label="按键模式" prop="keysMode">
          <el-radio-group v-model="form.keysMode">
            <el-radio-button label="1">摇杆</el-radio-button>
            <el-radio-button label="2" disabled>按键</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.operatingMode === '2' && form.keysMode === '1' && isMobile" label="摇杆左右" prop="lOrRMode">
          <el-radio-group v-model="form.lOrRMode">
            <el-radio-button label="1">左</el-radio-button>
            <el-radio-button label="2">右</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="游戏模式" prop="gameMode">
          <el-radio-group v-model="form.gameMode">
            <el-radio-button label="level">关卡模式</el-radio-button>
            <el-radio-button label="sandbox">沙盒模式</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="敌人数量" prop="enemyTotal" v-if="form.gameMode === 'sandbox'">
          <el-input-number v-model="form.enemyTotal" :min="1" :max="10000" label="敌人数量"></el-input-number>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog_footer">
      <el-button @click="readArchive">读取存档</el-button>
      <el-button type="primary" @click="updateStartConfigHandle">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>

export default {
  name:'startDialog',
  components: {
  },
  props:{
    isShow:{
      type:Boolean,
      default:false
    },
    isMobile:{
      type:Boolean,
      default:false
    },
  },
  data(){
    return {
      form:{
        enemyTotal:100,
        operatingMode:'2',
        gameMode:'level',
        keysMode:'1',
        lOrRMode:'1'
      },
      rules: {
        enemyTotal: [
          { required: true, message: '请输入敌人数量', trigger: 'blur' }
        ],
        operatingMode: [
          { required: true, message: '请选择操作模式', trigger: 'change' }
        ],
        keysMode: [
          { required: true, message: '请选择按键模式', trigger: 'change' }
        ],
        gameMode: [
          { required: true, message: '请选择游戏模式', trigger: 'change' }
        ],
        lOrRMode: [
          { required: true, message: '请选择摇杆左右', trigger: 'change' }
        ],
      }
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
    updateStartConfigHandle(){
      this.$emit('updateStartConfigHandle', this.form)
      this.dialogClose()
    },
    readArchive(){
      this.$emit('updateStartConfigHandle', this.form, 'read')
      this.dialogClose()
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 350px;
    .content_box{
    }
  }
}
</style>

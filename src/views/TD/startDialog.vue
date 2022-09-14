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
        <el-form-item label="敌人数量" prop="enemyTotal">
          <el-input-number v-model="form.enemyTotal" :min="1" :max="1000" label="敌人数量"></el-input-number>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog_footer">
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
  },
  data(){
    return {
      form:{
        enemyTotal:100
      },
      rules: {
        enemyTotal: [
          { required: true, message: '请输入敌人数量', trigger: 'blur' }
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
  }
}
</script>
<style lang="scss" scoped>
.dialog_box{
  /deep/ .dialog_content{
    width: 300px;
    .content_box{
    }
  }
}
</style>

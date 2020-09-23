<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
.el-tooltip__popper.skill_tooltip_box{
  padding: 5px;
  .tooltip_content{
    width: 100px;
  }
}
.el-tooltip__popper.box_tooltip_box{
  padding: 5px;
  .tooltip_content{
    width: 120px;
    display: flex;
    flex-direction: column;
    &>span{
      margin-bottom: 3px;
    }
  }
}
</style>

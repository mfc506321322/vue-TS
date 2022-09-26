<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
*{
  -webkit-touch-callout:none; /*系统默认菜单被禁用*/
  -webkit-user-select:none; /*webkit浏览器*/
  -khtml-user-select:none; /*早期浏览器*/
  -moz-user-select:none;/*火狐*/
  -ms-user-select:none; /*IE10*/
  user-select:none;
}
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
    span{
      margin-bottom: 3px;
    }
    .propertie_glossary{
      color: red;
      span{
        display: block;
      }
    }
  }
}
</style>

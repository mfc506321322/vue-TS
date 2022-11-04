const rewardConfig = [
  {
    id: 1,
    class: 'role',
    type: 'hp',
    title: '最大血量',
    change: '1', //+-x/
    effect: 10,
    effectDesc: ' + 10',
    unit: '点',
    icon: 'el-icon-user',
    handle: function(item, other){
      item.maxhp += 10
      item.hp += 10
      return item
    }
  },
  {
    id: 2,
    class: 'role',
    type: 'speed',
    title: '键盘移动速度',
    change: '1', //+-x/
    effect: 30,
    effectDesc: ' + 30',
    unit: '像素/秒',
    icon: 'el-icon-d-arrow-right',
    handle: function(item, other){
      this.roleInfo.originalSpeed += 0.5
      this.roleInfo.speed = other.fpsUnifyHandle(this.roleInfo.originalSpeed)
      return item
    }
  },
  {
    id: 3,
    class: 'reply',
    type: 'hp',
    title: '回复满血量',
    change: '1', //+-x/
    effect: 0,
    effectDesc: '',
    unit: '',
    icon: 'el-icon-sugar',
    handle: function(item, other){
      item.hp = item.maxhp
      return item
    }
  },
  {
    id: 4,
    class: 'bullet',
    type: 'count',
    title: '子弹数量',
    change: '1', //+-x/
    effect: 1,
    effectDesc: ' + 1',
    unit: '发',
    icon: 'el-icon-magic-stick',
    handle: function(item, other){
      item.bulletCount += 1
      return item
    }
  },
  {
    id: 5,
    class: 'bullet',
    type: 'interval',
    title: '子弹频率',
    change: '1', //+-x/
    effect: 0.25,
    effectDesc: ' + 0.25',
    unit: '次/秒',
    icon: 'el-icon-odometer',
    handle: function(item, other){
      item.atkInterval = Number((item.atkInterval + 0.25).toFixed(2))
      return item
    }
  },
  {
    id: 6,
    class: 'bullet',
    type: 'damage',
    title: '子弹伤害',
    change: '1', //+-x/
    effect: 20,
    effectDesc: ' + 20',
    unit: '点',
    icon: 'el-icon-lightning',
    handle: function(item, other){
      item.atk += 20
      return item
    }
  },
  {
    id: 7,
    class: 'skill',
    type: 'damage',
    title: '震荡波伤害',
    change: '1', //+-x/
    effect: 40,
    effectDesc: ' + 40',
    unit: '点',
    icon: 'el-icon-sunny',
    handle: function(item, other){
      item.skill.damage += 40
      return item
    }
  },
  {
    id: 8,
    class: 'skill',
    type: 'scope',
    title: '震荡波范围',
    change: '1', //+-x/
    effect: 30,
    effectDesc: ' + 30',
    unit: '像素',
    icon: 'el-icon-bangzhu',
    handle: function(item, other){
      item.skill.maxScope += 30
      return item
    }
  },
  {
    id: 9,
    class: 'skill',
    type: 'cd',
    title: '震荡波冷却',
    change: '2', //+-x/
    minValue: 0.5,
    effect: 1.5,
    effectDesc: ' - 1.5',
    unit: '秒',
    icon: 'el-icon-time',
    handle: function(item, other){
      if(item.skill.cd <= 0.5){
        item.skill.cd = 0.5
      }else{
        item.skill.cd -= 1.5
      }
      return item
    }
  },
  {
    id: 10,
    class: 'passive',
    type: 'damage',
    title: '环绕弹伤害',
    change: '1', //+-x/
    effect: 20,
    effectDesc: ' + 20',
    unit: '点',
    icon: 'el-icon-loading',
    handle: function(item, other){
      item.passive.damage += 20
      return item
    }
  },
  {
    id: 11,
    class: 'passive',
    type: 'duration',
    title: '环绕弹持续时间',
    change: '1', //+-x/
    effect: 2,
    effectDesc: ' + 2',
    unit: '秒',
    icon: 'el-icon-time',
    handle: function(item, other){
      item.passive.duration += 2
      return item
    }
  },
  {
    id: 12,
    class: 'passive',
    type: 'cd',
    title: '环绕弹生成间隔',
    change: '2', //+-x/
    minValue: 0.3,
    effect: 0.3,
    effectDesc: ' - 0.3',
    unit: '秒',
    icon: 'el-icon-pie-chart',
    handle: function(item, other){
      if(item.passive.cd <= 0.3)return item
      item.passive.cd = Number((item.passive.cd - 0.3).toFixed(1))
      return item
    }
  },
  {
    id: 13,
    class: 'reflection',
    type: 'damage',
    title: '反射弹伤害',
    change: '1', //+-x/
    effect: 30,
    effectDesc: ' + 30',
    unit: '点',
    icon: 'el-icon-sort',
    handle: function(item, other){
      item.reflection.damage += 30
      return item
    }
  },
  {
    id: 14,
    class: 'reflection',
    type: 'duration',
    title: '反射弹持续时间',
    change: '1', //+-x/
    effect: 2,
    effectDesc: ' + 2',
    unit: '秒',
    icon: 'el-icon-watch',
    handle: function(item, other){
      item.reflection.duration += 2
      return item
    }
  },
  {
    id: 15,
    class: 'reflection',
    type: 'cd',
    title: '反射弹生成间隔',
    change: '2', //+-x/
    minValue: 0.3,
    effect: 0.3,
    effectDesc: ' - 0.3',
    unit: '秒',
    icon: 'el-icon-pie-chart',
    handle: function(item, other){
      if(item.reflection.cd <= 0.3)return item
      item.reflection.cd = Number((item.reflection.cd - 0.3).toFixed(1))
      return item
    }
  },
  {
    id: 16,
    class: 'reflection',
    type: 'speed',
    title: '反射弹速度倍率',
    change: '1', //+-x/
    effect: 0.3,
    effectDesc: ' + 30',
    unit: '%',
    icon: 'el-icon-finished',
    handle: function(item, other){
      item.reflection.speed += 30
      return item
    }
  },
]

export default rewardConfig
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
      item.originalSpeed += 0.5
      item.speed = other.fpsUnifyHandle(item.originalSpeed)
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
    effect: 0.2,
    effectDesc: ' + 0.2',
    unit: '次/秒',
    icon: 'el-icon-odometer',
    handle: function(item, other){
      item.atkInterval = Number((item.atkInterval + 0.2).toFixed(2))
      return item
    }
  },
  {
    id: 6,
    class: 'bullet',
    type: 'damage',
    title: '子弹伤害',
    change: '1', //+-x/
    effect: 10,
    effectDesc: ' + 10',
    unit: '点',
    icon: 'el-icon-lightning',
    handle: function(item, other){
      item.atk += 10
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
    effect: 10,
    effectDesc: ' + 10',
    unit: '点',
    icon: 'el-icon-loading',
    handle: function(item, other){
      item.passive.damage += 10
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
    effect: 15,
    effectDesc: ' + 15',
    unit: '点',
    icon: 'el-icon-sort',
    handle: function(item, other){
      item.reflection.damage += 15
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
      item.reflection.speed = Number((item.reflection.speed + 0.3).toFixed(1))
      return item
    }
  },
  {
    id: 17,
    class: 'light',
    type: 'damage',
    title: '耀斑轰击伤害',
    change: '1', //+-x/
    effect: 15,
    effectDesc: ' + 15',
    unit: '点',
    icon: 'el-icon-place',
    handle: function(item, other){
      item.light.damage += 15
      return item
    }
  },
  {
    id: 18,
    class: 'light',
    type: 'scope',
    title: '耀斑轰击范围',
    change: '1', //+-x/
    effect: 5,
    effectDesc: ' + 5',
    unit: '像素',
    icon: 'el-icon-orange',
    handle: function(item, other){
      item.light.maxScope += 5
      return item
    }
  },
  {
    id: 19,
    class: 'light',
    type: 'cd',
    title: '耀斑轰击间隔',
    change: '2', //+-x/
    minValue: 0.3,
    effect: 0.3,
    effectDesc: ' - 0.3',
    unit: '秒',
    icon: 'el-icon-time',
    handle: function(item, other){
      if(item.light.cd <= 0.3)return item
      item.light.cd = Number((item.light.cd - 0.3).toFixed(1))
      return item
    }
  },
  // {
  //   id: 20,
  //   class: 'treasure',
  //   type: 'probability',
  //   title: '普通宝箱获得概率',
  //   change: '1', //+-x/
  //   maxValue: 0.1,
  //   effect: 0.01,
  //   effectDesc: ' + 1',
  //   unit: '%',
  //   icon: 'el-icon-star-on',
  //   handle: function(item, other){
  //     if(item.treasure.probability >= 0.1)return item
  //     item.treasure.probability = Number((item.treasure.probability + 0.01).toFixed(3))
  //     return item
  //   }
  // },
  // {
  //   id: 21,
  //   class: 'treasure',
  //   type: 'specialProbability',
  //   title: '特殊宝箱获得概率',
  //   change: '1', //+-x/
  //   maxValue: 0.1,
  //   effect: 0.005,
  //   effectDesc: ' + 0.5',
  //   unit: '%',
  //   icon: 'el-icon-star-off',
  //   handle: function(item, other){
  //     if(item.treasure.specialProbability >= 0.1)return item
  //     item.treasure.specialProbability = Number((item.treasure.specialProbability + 0.005).toFixed(3))
  //     return item
  //   }
  // },
  {
    id: 22,
    class: 'treasure',
    type: 'probability',
    title: '幸运',
    change: '1', //+-x/
    maxValue: 0.1,
    effect: 0.005,
    effectDesc: ' + 1',
    unit: '',
    icon: 'el-icon-star-off',
    handle: function(item, other){
      if(item.treasure.probability < 0.1){
        item.treasure.probability = Number((item.treasure.probability + 0.005).toFixed(3))
      }
      if(item.treasure.specialProbability < 0.05){
        item.treasure.specialProbability = Number((item.treasure.specialProbability + 0.005).toFixed(3))
      }
      return item
    }
  },
]

export default rewardConfig
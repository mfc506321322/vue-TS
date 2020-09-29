import cloneDeep from 'lodash/cloneDeep'
const skills = [
  {
    level: 1,
    type: 'buff',
    typeDesc: '天魔大化',
    round:2,
    chance:0.2,
    continueRound:1,
    desc:'@@@施展了天魔大化，攻击力提高',
    skillDesc:'提升使用者当前回合的攻击力',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      ascension = 1 + 0.1 + Number((0.6 * (this.level * 0.01) / (this.level * 0.01 + 0.7)).toFixed(2))
      newData.attack = Math.floor(newData.attack * ascension)
      return newData
    }
  },
  {
    level: 1,
    type: 'damage',
    typeDesc: '沧海渡',
    round:3,
    chance:0.25,
    desc:'@@@施展了沧海渡，造成的伤害提高',
    skillDesc:'提升使用者当前回合对对方造成的伤害',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let ascension = 1 + 0.05 + Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
      data.damageMultiplier = data.damageMultiplier * ascension
    }
  },
  {
    level: 1,
    type: 'reply',
    typeDesc: '无想转生',
    round:3,
    chance:0.25,
    desc:'@@@施展了无想转生，血量回复了',
    skillDesc:'回复使用者的生命值',
    condition: function(data){
      let flag = true
      if(data.attr.hp === data.attr.maxhp){
        flag = false
      }
      return flag
    },
    effect: function(data){
      let reply = Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.5)).toFixed(2))

      data.hp = data.hp + Math.ceil(data.maxhp * reply)
      if(data.hp > data.maxhp){
        data.hp = data.maxhp
      }
    }
  },
  {
    level: 1,
    type: 'buff',
    typeDesc: '阿罗汉神',
    round:2,
    chance:0.15,
    continueRound:2,
    desc:'@@@施展了阿罗汉神，暴击率提高',
    skillDesc:'提升使用者的暴击率，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      ascension = 1 + 0.1 + Number((0.7 * (this.level * 0.01) / (this.level * 0.01 + 0.7)).toFixed(2))
      newData.crit = Number((newData.crit * ascension).toFixed(2))
      return newData
    }
  },
  {
    level: 1,
    type: 'debuff',
    typeDesc: '大智无定',
    round:3,
    chance:0.25,
    continueRound:2,
    desc:'@@@施展了大智无定，$$$暴击率下降了，持续2个回合',
    skillDesc:'降低敌方暴击率，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      lower = 1 - 0.1 - Number((0.7 * (this.level * 0.01) / (this.level * 0.01 + 0.7)).toFixed(2))
      newData.crit = Number((newData.crit * lower).toFixed(2))
      return newData
    }
  },
  {
    level: 1,
    type: 'buff',
    typeDesc: '凌波微步',
    round:2,
    chance:0.2,
    continueRound:2,
    desc:'@@@施展了凌波微步，闪避率提高',
    skillDesc:'提升使用者的闪避率，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      ascension = 1 + 0.1 + Number((0.8 * (this.level * 0.01) / (this.level * 0.01 + 0.7)).toFixed(2))
      newData.dodge = Number((newData.dodge * ascension).toFixed(2))
      return newData
    }
  },
  {
    level: 1,
    type: 'debuff',
    typeDesc: '降龙伏虎',
    round:3,
    chance:0.25,
    continueRound:2,
    desc:'@@@施展了降龙伏虎，$$$闪避率下降了，持续2个回合',
    skillDesc:'降低敌方闪避率，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      lower = 1 - 0.1 - Number((0.8 * (this.level * 0.01) / (this.level * 0.01 + 0.7)).toFixed(2))
      newData.dodge = Number((newData.dodge * lower).toFixed(2))
      return newData
    }
  },
  {
    level: 1,
    type: 'buff',
    typeDesc: '金刚不坏',
    round:2,
    chance:0.15,
    continueRound:2,
    desc:'@@@施展了金刚不坏，防御力提高',
    skillDesc:'提升使用者的防御力，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      ascension = 1 + 0.1 + Number((0.75 * (this.level * 0.01) / (this.level * 0.01 + 0.6)).toFixed(2))
      newData.defense = Math.floor(newData.defense * ascension)
      return newData
    }
  },
  {
    level: 1,
    type: 'debuff',
    typeDesc: '非想天则',
    round:3,
    chance:0.25,
    continueRound:2,
    desc:'@@@施展了非想天则，$$$防御下降了，持续2个回合',
    skillDesc:'降低敌方防御力，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      lower = 1 - 0.1 - Number((0.75 * (this.level * 0.01) / (this.level * 0.01 + 0.6)).toFixed(2))
      newData.defense = Math.floor(newData.defense * lower)
      return newData
    }
  },
]

export default skills
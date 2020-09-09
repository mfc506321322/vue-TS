import cloneDeep from 'lodash/cloneDeep'
const skills = [
  {
    level: 1,
    type: 'buff',
    typeDesc: '天魔大化',
    round:2,
    chance:0.35,
    continueRound:1,
    desc:'@@@施展了天魔大化，攻击力提高',
    skillDesc:'提升使用者当前回合的攻击力',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      ascension = 1 + 0.1 + Number((0.6 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
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
    effect: function(){
      let ascension = 1 + 0.1 + Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
      return ascension
    }
  },
  {
    level: 1,
    type: 'reply',
    typeDesc: '无想转生',
    round:2,
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
      let newData = cloneDeep(data),
      reply = 0.1 + Number((1 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))

      newData.hp = newData.hp + Math.ceil(newData.maxhp * reply)
      if(newData.hp > newData.maxhp){
        newData.hp = newData.maxhp
      }
      return newData
    }
  },
  {
    level: 1,
    type: 'debuff',
    typeDesc: '非想天则',
    round:3,
    chance:0.4,
    continueRound:2,
    desc:'@@@施展了非想天则，$$$防御下降了，持续2个回合',
    skillDesc:'降低敌方防御力，持续2个回合',
    condition: function(data){
      let flag = true
      return flag
    },
    effect: function(data){
      let newData = cloneDeep(data),
      lower = 1 - 0.1 - Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
      newData.defense = Math.floor(newData.defense * lower)
      return newData
    }
  }
]

export default skills
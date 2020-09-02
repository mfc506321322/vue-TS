import cloneDeep from 'lodash/cloneDeep'
const skills = {
  ascension:[
    {
      level: 1,
      type: 'ascension',
      typeDesc: '天魔大化',
      time:2,
      chance:0.2,
      desc:'@@@施展了天魔大化，攻击力提高。',
      condition: function(){
        let flag = true
        return flag
      },
      effect: function(data){
        let newData = cloneDeep(data),
        ascension = 1 + Number((0.6 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
        newData.attr.atk = Math.floor(newData.attr.atk * ascension)
        return newData
      }
    }
  ],
  damage:[
    {
      level: 1,
      type: 'damage',
      typeDesc: '沧海一刀',
      time:4,
      chance:0.2,
      desc:'@@@施展了沧海一刀，造成的伤害提高。',
      condition: function(){
        let flag = true
        return flag
      },
      effect: function(){
        let ascension = 1 + Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
        return ascension
      }
    }
  ],
  reply:[
    {
      level: 1,
      type: 'reply',
      typeDesc: '无想转生',
      time:4,
      chance:0.3,
      desc:'@@@施展了无想转生，血量回复了。',
      condition: function(){
        let flag = true
        return flag
      },
      effect: function(){
        let ascension = 1 + Number((0.5 * (this.level * 0.04) / (this.level * 0.04 + 0.6)).toFixed(2))
        return ascension
      }
    }
  ]
}

export default skills
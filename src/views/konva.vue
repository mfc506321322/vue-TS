<template>
  <div class="content_box">
    <v-stage
      ref="stage"
      :config="configKonva"
      class="stage"
    >
      <v-layer ref="layer">
        <div 
          class="map_box"
          v-for="(item, index) in mapList"
          :key="index"
        >
          <v-rect
            :config="{
              x: item.x,
              y: item.y,
              width: mapRenderParams.cellSize.w,
              height: mapRenderParams.cellSize.h,
              fill: item.bgColor,
              stroke: 'black',
              strokeWidth: 2,
            }"
          />
          <v-text
            @click="cellClick(item)"
            :config="{
              x: item.x,
              y: item.y,
              width: mapRenderParams.cellSize.w,
              height: mapRenderParams.cellSize.h,
              text: item.text,
              fontSize: 12,
              fill: '#000000',
              align: 'center',
              verticalAlign: 'middle'
            }"
          />
          <v-line
            v-for="(val, idx) in item.points"
            :key="idx"
            :config="{
              points: val,
              stroke: 'black',
              strokeWidth: 2,
            }"
          />
        </div>
      </v-layer>
    </v-stage>
    <div class="info_box">
      <div class="title">{{selectCell.text}}</div>
      <div class="describe" v-show="selectCell.describe">{{selectCell.describe}}</div>
      <div class="cell_btn_list">
        <button
          v-for="(item,index) in selectCell.config.furniture"
          :key="index"
          @click="furnitureClick(item)"
        >{{item.text}}</button>
      </div>
      <ul class="cell_content_list" v-show="showBoxList">
        <li
          v-for="(item,index) in selectCell.itemsList"
          :key="index"
        >
          <span>物品种类: {{item.species}}-{{item.type}}</span>
          <span>{{
            item.species === 'weapon' ? `攻击: ${item.attack}` :
            item.species === 'armor' ? `防御: ${item.defense}` :
            item.species === 'medicine' ? `回血: ${item.hp}` : ''
          }}</span>
          <span>价格: {{item.price}}金</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import map from '@/common/json/map.json'
import mapColor from '@/common/json/mapColor.json'
import itemProps from '@/common/json/itemProps.json'
const width = window.innerWidth;
const height = window.innerHeight;
export default {
  name: 'Konva',
  components: {
  },
  data() {
    return {
      mapRenderParams: {},
      mapList: [],
      configKonva: {
        width: 600,
        height: 600,
        draggable: true
      },
      selectCell: {
        config: {
          furniture: []
        }
      },
      showBoxList:false
    };
  },
  mounted() {
    this.initMap()
  },
  watch:{
    'selectCell.id':function(){
      this.showBoxList = false
    }
  },
  methods: {
    initMap(){
      this.mapRenderParams.cellSize = {
        w:80,
        h:40,
        i:30
      }
      this.mapRenderParams.start = {
        x:10,
        y:this.configKonva.height / 2 - this.mapRenderParams.cellSize.h / 2
      }

      this.mapList = map.map((item, index) => {
        let obj = {}
        let coordinates = this.coordinatesComputed(item.id)
        let bgColor = this.mapColorHandle(item)
        let points = this.drawLine(item.id, coordinates, item.passage)
        let itemsList = this.itemHandle(item.config.furniture)
        obj = { 
          ...item,
          bgColor,
          ...coordinates,
          points,
          itemsList
        }
        return obj
      })
    },
    mapColorHandle(item){
      let bgColor = '#FFFFFF'
      if(mapColor[item.species][item.type] instanceof Array){
        bgColor = mapColor[item.species][item.type][item.config.lock]
      }else{
        bgColor = mapColor[item.species][item.type]
      }
      return bgColor
    },
    coordinatesComputed(id){
      let {
        w,
        h,
        i
      } = this.mapRenderParams.cellSize
      let x = 0,
      y = 0
      switch(id.length){
        case 1:
          x = (id[0] - 1) * (w + i)
          y = 0
          break
        case 2:
          x = (id[0] - 1) * (w + i)
          y = id[1] * (h + i)
          break
      }
      return {
        x:x + this.mapRenderParams.start.x,
        y:y + this.mapRenderParams.start.y
      }
    },
    drawLine(id, coordinates, passage){
      let {
        w,
        h,
        i
      } = this.mapRenderParams.cellSize
      let arr = []
      if(id.length >= 1 && passage.after){
        arr.push([
          coordinates.x + w, 
          coordinates.y + h / 2, 
          coordinates.x + w + i, 
          coordinates.y + h / 2
        ])
      }
      if(id.length >= 2 && passage.side){
        if(id[1] > 0){
          arr.push([
            coordinates.x + w / 2, 
            coordinates.y, 
            coordinates.x + w / 2, 
            coordinates.y - i
          ])
        }else{
          arr.push([
            coordinates.x + w / 2, 
            coordinates.y + h, 
            coordinates.x + w / 2, 
            coordinates.y + h + i
          ])
        }
      }
      return arr
    },
    itemHandle(furniture){
      let arr = []
      let boxInfo = furniture.filter(item => {
        return item.label === 'box'
      })
      if(boxInfo.length){
        let boxLevel = boxInfo[0].level
        let sums = this.randomValue({ min:3, max:5 })
        let itemsNum = {
          weapon:0,
          armor:0,
          medicine:0
        }
        itemsNum.medicine = this.randomValue({ min:1, max:(sums - 1) })
        itemsNum.armor = this.randomValue({ min:0, max:(sums - itemsNum.medicine) })
        if((sums - itemsNum.medicine - itemsNum.armor) > 0){
          itemsNum.weapon = this.randomValue({ min:0, max:(sums - itemsNum.medicine - itemsNum.armor) })
        }

        let medicines = this.itemRandomCreate('medicine',boxLevel,itemsNum.medicine)
        let armors = this.itemRandomCreate('armor',boxLevel,itemsNum.armor)
        let weapons = this.itemRandomCreate('weapon',boxLevel,itemsNum.weapon)
        arr = [
          ...medicines,
          ...armors,
          ...weapons
        ]
      }
      return arr
    },
    itemRandomCreate(species,level,num){
      let medicineType = itemProps.medicineTemplate.type
      let armorType = itemProps.armorTemplate.type
      let weaponType = itemProps.weaponTemplate.type
      let arr = []
      for(let i=0;i<num;i++){
        let obj = {}
        switch(species){
          case 'medicine':{
            obj = {
              species,
              type:medicineType[this.randomValue({ min:0, max:medicineType.length - 1 })],
              hp:this.randomValue({ min:5 * level, max:5 + 10 * level })
            }
            obj.price = Math.floor(obj.hp / 3)
            break
          }
          case 'armor':{
            obj = {
              species,
              type:armorType[this.randomValue({ min:0, max:armorType.length - 1 })],
              defense:this.randomValue({ min:5 * level, max:10 + 5 * level })
            }
            obj.price = Math.floor(obj.defense * 1.5)
            break
          }
          case 'weapon':{
            obj = {
              species,
              type:weaponType[this.randomValue({ min:0, max:weaponType.length - 1 })],
              attack:this.randomValue({ min:4 * level, max:10 + 4 * level })
            }
            obj.price = Math.floor(obj.attack * 3)
            break
          }
        }
        arr.push(obj)
      }
      // switch(species){
      //   case 'medicine':{
      //     for(let i=0;i<num;i++){
      //       let obj = {
      //         species,
      //         type:medicineType[this.randomValue({ min:0, max:medicineType.length - 1 })],
      //         hp:this.randomValue({ min:5 * level, max:5 + 10 * level })
      //       }
      //       obj.price = Math.floor(obj.hp / 3) 
      //       arr.push(obj)
      //     }
      //     break
      //   }
      //   case 'armor':{
      //     for(let i=0;i<num;i++){
      //       let obj = {
      //         species,
      //         type:armorType[this.randomValue({ min:0, max:armorType.length - 1 })],
      //         defense:this.randomValue({ min:5 * level, max:10 + 5 * level })
      //       }
      //       obj.price = Math.floor(obj.defense * 1.5) 
      //       arr.push(obj)
      //     }
      //     break
      //   }
      //   case 'weapon':{
      //     for(let i=0;i<num;i++){
      //       let obj = {
      //         species,
      //         type:weaponType[this.randomValue({ min:0, max:weaponType.length - 1 })],
      //         attack:this.randomValue({ min:4 * level, max:10 + 4 * level })
      //       }
      //       obj.price = Math.floor(obj.attack * 3) 
      //       arr.push(obj)
      //     }
      //     break
      //   }
      // }
      return arr
    },
    cellClick(item){
      let obj = _.cloneDeep(item)
      this.selectCell = obj
    },
    furnitureClick(data){
      switch(data.label){
        case 'box':{
          this.showBoxList = !this.showBoxList
          break
        }
        case 'bed':{
          break
        }
      }
    },
    randomValue(config={}){
      let configs = Object.assign({
        min:1,
        max:10,
      },config)
      return Math.floor(Math.random() * ( configs.max - configs.min + 1 ) + configs.min)
    }
  },
}

</script>
<style lang="scss" scoped>
.content_box{
  border: 2px solid #000;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  .stage{
  }
  .info_box{
    box-sizing: border-box;
    width: 300px;
    height: 600px;
    background-color: #FFF5EE;
    border-left: 2px solid #999;
    padding: 10px;
    font-size: 14px;
    .title{
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .describe{
      background-color: #f0f0f0;
      border: 2px solid #999;
      padding: 5px;
      line-height: 20px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .cell_btn_list{
      button{
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }
    .cell_content_list{
      background-color: #fff;
      border: 2px solid #999;
      padding: 5px;
      border-radius: 4px;
      font-size: 12px;
      li{
        cursor: pointer;
        background-color: #ADD8E6;
        padding: 5px;
        border-radius: 4px;
        line-height: 16px;
        margin-bottom: 10px;
        &:last-child{
          margin-bottom: 0;
        }
        span{
          display: inline-block;
          margin: 0 10px 0 0;
        }
      }
    }
  }
}
</style>

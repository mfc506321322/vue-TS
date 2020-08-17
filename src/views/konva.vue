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
            @dblclick="protagonistMove(item)"
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
          @click="itemClick(item, selectCell)"
        >
          <span>物品种类: {{item.speciesDesc}}-{{item.typeDesc}}</span>
          <span>{{
            item.species === 'weapon' ? `攻击: ${item.attack}` :
            item.species === 'armor' ? `防御: ${item.defense}` :
            item.species === 'medicine' ? `回血: ${item.hp}` : ''
          }}</span>
          <span>价格: {{item.price}}金</span>
        </li>
        <li class="cell_content_list_empty" v-if="selectCell.itemsList.length === 0">空</li>
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
        },
        itemsList:[]
      },
      showBoxList:false,
      protagonist:{
        name: '一',
        level: 1,
        attack: 2,
        maxhp: 50,
        hp: 50,
        coordinate:[1],
        box: []
      }
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
      if(this.protagonist.coordinate.join('') === item.id.join('')){
        bgColor = '#FFFF00'
      }
      return bgColor
    },
    redrawMapColor(){
      let arr = this.mapList.map((item, index) => {
        let obj = {}
        let bgColor = this.mapColorHandle(item)
        obj = Object.assign({}, item, { bgColor })
        return obj
      })
      this.mapList = _.cloneDeep(arr)
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
        let id = Math.floor(Math.random() * 899999999 + 100000000)
        switch(species){
          case 'medicine':{
            obj = {
              id,
              species,
              speciesDesc:'药',
              type:medicineType[this.randomValue({ min:0, max:medicineType.length - 1 })].name,
              typeDesc:medicineType[this.randomValue({ min:0, max:medicineType.length - 1 })].desc,
              hp:this.randomValue({ min:5 * level, max:5 + 10 * level })
            }
            obj.price = Math.floor(obj.hp / 3)
            break
          }
          case 'armor':{
            obj = {
              id,
              species,
              speciesDesc:'防具',
              type:armorType[this.randomValue({ min:0, max:armorType.length - 1 })].name,
              typeDesc:armorType[this.randomValue({ min:0, max:armorType.length - 1 })].desc,
              defense:this.randomValue({ min:5 * level, max:10 + 5 * level })
            }
            obj.price = Math.floor(obj.defense * 1.5)
            break
          }
          case 'weapon':{
            obj = {
              id,
              species,
              speciesDesc:'武器',
              type:weaponType[this.randomValue({ min:0, max:weaponType.length - 1 })].name,
              typeDesc:weaponType[this.randomValue({ min:0, max:weaponType.length - 1 })].desc,
              attack:this.randomValue({ min:4 * level, max:10 + 4 * level })
            }
            obj.price = Math.floor(obj.attack * 3)
            break
          }
        }
        arr.push(obj)
      }
      return arr
    },
    cellClick(item){
      let obj = _.cloneDeep(item)
      this.selectCell = obj
    },
    protagonistMove(item){
      this.protagonist.coordinate = item.id
      this.redrawMapColor()
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
    itemClick(row, selectCell){
      this.protagonist.box.push(row)
      let index = ''
      let arr = this.mapList.map(item => {
        if(item.id.join('') === selectCell.id.join('')){
          index = _.findIndex(item.itemsList,['id',row.id])
          item.itemsList.splice(index,1)
        }
        return item
      })
      this.selectCell.itemsList.splice(index,1)
      this.mapList = _.cloneDeep(arr)
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
        &.cell_content_list_empty{
          background-color: #FFF;
          text-align: center;
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

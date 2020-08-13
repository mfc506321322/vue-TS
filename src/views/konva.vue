<template>
    <v-stage
      ref="stage"
      :config="configKonva"
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
  </div>
</template>

<script>
import _ from 'lodash'
import map from '@/common/json/map.json'
import mapColor from '@/common/json/mapColor.json'
const width = window.innerWidth;
const height = window.innerHeight;
export default {
  name: 'Konva',
  components: {
  },
  data() {
    return {
      mapRenderParams:{},
      mapList: [],
      configKonva: {
        width: 800,
        height: 600
      }
    };
  },
  mounted() {
    this.initMap()
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
        obj = { 
          ...item,
          bgColor,
          ...coordinates,
          points
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
    }
  },
}

</script>
<style lang="scss" scoped>
</style>

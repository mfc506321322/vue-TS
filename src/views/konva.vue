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
        let points = this.drawLine(item.id, coordinates)
        obj = { 
          ...item, 
          ...coordinates,
          points
        }
        return obj
      })
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
    drawLine(id, coordinates){
      let {
        w,
        h,
        i
      } = this.mapRenderParams.cellSize
      let arr = []
      if(id.length >= 1){
        arr.push([
          coordinates.x + w, 
          coordinates.y + h / 2, 
          coordinates.x + w + i, 
          coordinates.y + h / 2
        ])
      }
      if(id.length >= 2){
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

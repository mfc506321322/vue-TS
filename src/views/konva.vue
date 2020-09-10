<template>
  <div class="content_box">
    <span class="current_level">当前关卡：{{currentLevel+1}}</span>
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
            @click="protagonistMove(item)"
            @dblclick="cellClick(item)"
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
        <el-popconfirm
          confirmButtonText='干'
          cancelButtonText='溜了'
          icon="el-icon-info"
          iconColor="red"
          title="确定要进入战斗吗？"
          v-for="(item,index) in selectCell.enemy"
          :key="index+100"
          @onConfirm="enterBattle(item)"
        >
          <button 
          class="enemy_btn" 
          slot="reference"
          @click="enemyClick(item)"
          >{{`${item.name}${item.classDesc}`}}</button>
        </el-popconfirm>
      </div>
      <ul class="cell_content_list" v-show="showBoxList">
        <li
          v-for="(item,index) in selectCell.itemsList"
          :key="index"
          @click="itemClick(item, selectCell)"
          :class="item.styleClass"
        >
          <span>物品种类: {{item.speciesDesc}}-{{item.typeDesc}}</span>
          <template v-if="item.species === 'weapon'">
            <span>攻击: {{item.attack}}</span>
            <span v-if="item.crit">暴击: {{item.crit | percentageUnit}}</span>
          </template>
          <template v-if="item.species === 'armor'">
            <span>防御: {{item.defense}}</span>
            <span v-if="item.dodge">闪避: {{item.dodge | percentageUnit}}</span>
          </template>
          <span v-if="item.species === 'medicine'">回血: {{item.hp}}</span>
          <span v-if="item.species === 'skill'">等级: {{item.level}}</span>
          <span>价格: {{item.price}}金</span>
        </li>
        <li class="cell_content_list_empty" v-if="selectCell.itemsList.length === 0">空</li>
      </ul>
      <button
        v-if="showPassBtn"
        class="pass_btn"
        @click="passForward"
      >点击前往下一关卡</button>
      <!-- <button
        class="pass_btn"
        @click="passForward"
      >点击前往下一关卡</button> -->
    </div>
    <div class="protagonist_info_area">
      <div class="info_block">
        <ul class="states">
          <li class="name">角色名: {{protagonist.name}}</li>
          <li>等级: {{protagonist.level}}</li>
          <li>攻击: {{protagonist.attack}}
            <span 
            class="attr_detail" 
            v-if="protagonist.selectWeapon.attack"
            >(基本:{{protagonist.basisAttack}}+武器:{{protagonist.selectWeapon.attack}})</span>
          </li>
          <li>防御: {{protagonist.defense}}
            <span 
            class="attr_detail"
            v-if="protagonist.selectArmor.defense"
            >(基本:{{protagonist.basisDefense}}+防具:{{protagonist.selectArmor.defense}})</span>
          </li>
          <li 
            class="progress_bar"
            :style="{
              '--progressBar':progressBarHp,
              '--progressColor':'rgb(255, 73, 73)'
            }"
          ><span>血量: {{protagonist.hp}} / {{protagonist.maxhp}}</span></li>
          <li 
            class="progress_bar"
            :style="{
              '--progressBar':progressBarExp,
              '--progressColor':'rgb(255, 220, 0)'
            }"
          ><span>经验: {{protagonist.exp}} / {{protagonist.maxExp}}</span></li>
          <li>暴击: {{protagonist.crit | percentageUnit}}</li>
          <li>闪避: {{protagonist.dodge | percentageUnit}}</li>
          <li>背包: {{protagonist.box.length}} / {{protagonist.maxBox}}</li>
        </ul>
      </div>
      <div class="info_block">
        <ul class="cell_content_list">
          <li
            v-for="(item,index) in protagonist.box"
            :key="index"
            @dblclick="boxItemClick(item)"
            :class="item.styleClass"
          >
            <span>{{item.typeDesc}}</span>
            <template v-if="item.species === 'weapon'">
              <span>{{item.attack}}atk</span>
              <span v-if="item.crit">{{item.crit | percentageUnit}}crit</span>
            </template>
            <template v-if="item.species === 'armor'">
              <span>{{item.defense}}def</span>
              <span v-if="item.dodge">{{item.dodge | percentageUnit}}dod</span>
            </template>
            <span v-if="item.species === 'medicine'">{{item.hp}}hp</span>
            <span v-if="item.species === 'skill'">{{item.level}}级</span>
            <span>{{item.price}}金</span>
            <el-popconfirm
              class="item_destroy_box"
              confirmButtonText='确定'
              cancelButtonText='取消'
              icon="el-icon-info"
              iconColor="red"
              title="确定要丢弃该道具吗？"
              @onConfirm="enterItemDestroy(item)"
            >
              <el-icon class="el-icon-close item_destroy" slot="reference"></el-icon>
            </el-popconfirm>
          </li>
          <li class="cell_content_list_empty" v-if="protagonist.box.length === 0">空</li>
        </ul>
      </div>
      <div class="info_block">
        <div class="select_equip">
          装备武器: <div class="select_equip_box" v-if="protagonist.selectWeapon.typeDesc">
            <span>{{protagonist.selectWeapon.typeDesc}}</span>
            <span> / {{protagonist.selectWeapon.attack}}攻击</span>
            <span v-if="protagonist.selectWeapon.crit"> / {{protagonist.selectWeapon.crit | percentageUnit}}暴击</span>
          </div>
        </div>
        <div class="select_equip">
          装备防具: <div class="select_equip_box" v-if="protagonist.selectArmor.typeDesc">
            <span>{{protagonist.selectArmor.typeDesc}}</span>
            <span> / {{protagonist.selectArmor.defense}}防御</span>
            <span v-if="protagonist.selectArmor.dodge"> / {{protagonist.selectArmor.dodge | percentageUnit}}闪避</span>
          </div>
        </div>
      </div>
      <Skill
      :protagonistData="protagonist"
      ></Skill>
    </div>
    <div class="function_area">
      <div class="function_btn_box">
        <el-popconfirm
          confirmButtonText='确定'
          cancelButtonText='取消'
          icon="el-icon-info"
          iconColor="green"
          title="确定要保存当前状态吗？"
          @onConfirm="saveOrReadArchive()"
        >
          <button class="function_btn" slot="reference">保存存档</button>
        </el-popconfirm>
        <el-popconfirm
          confirmButtonText='确定'
          cancelButtonText='取消'
          icon="el-icon-info"
          iconColor="#FFCC00"
          title="确定要读取存档吗？"
          @onConfirm="saveOrReadArchive(true)"
        >
          <button class="function_btn" slot="reference">载入存档</button>
        </el-popconfirm>
      </div>
      <div class="archive_info" v-if="archiveShowInfo">
        <span class="archive_title">存档</span>
        <span>关卡：{{archiveShowInfo.currentLevel + 1}}</span>
        <span>所在地图：{{archiveShowInfo.mapName}}</span>
        <span>人物血量：{{archiveShowInfo.hp}}</span>
      </div>
    </div>
    <div class="update_info">
      <el-collapse v-model="insNames" class="ins_box">
        <el-collapse-item title="操作说明" name="1">
          <p>移动：<span>点击地图区块，每次只能移动一格，未连接区块无法移动</span></p>
          <p>获取道具：<span>点击右侧功能区箱子按钮打开道具列表，点击道具获取</span></p>
          <p>丢弃道具：<span>点击下方信息区背包道具列表里的道具”X“键，丢弃道具</span></p>
          <p>使用道具&穿戴装备&学习技能：<span>双击下方信息区背包道具列表里的道具进行使用或装备</span></p>
          <p>进行战斗：<span>点击右侧功能区红色敌人按钮进入战斗</span></p>
          <p>战斗撤退：<span>战斗中途可以随时点击战斗窗口右下角“撤退”按钮退出战斗</span></p>
          <p>进入下一关卡：<span>当前地图敌人全部清除后会提示是否进入下一关卡，或者点击右侧“前往下一关卡“按钮</span></p>
        </el-collapse-item>
      </el-collapse>
      <div class="update_title">更新信息</div>
      <div class="time_line_box">
        <el-timeline class="time_line" :reverse="true">
          <el-timeline-item
            v-for="(item, index) in updateInfo"
            :key="index"
            :timestamp="item.timestamp"
            :color="index === updateInfo.length - 1 ? '#00AE7E' : null"
          >
            {{item.content}}
          </el-timeline-item>
        </el-timeline>
      </div>
      <div class="thanks">鸣谢：@季--提供数值系统支持</div>
    </div>
    <div class="dialog">
      <!-- <Dialog
      :nowEnemyData="nowEnemyData"
      :protagonistData="protagonist"
      :isShow.sync="showBattleDialog"
      @fightEnd="fightEnd"
      ></Dialog> -->
      <FightDialog
      :nowEnemyData="nowEnemyData"
      :protagonistData="protagonist"
      :isShow.sync="showBattleDialog"
      @fightEnd="fightEnd"
      ></FightDialog>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import map from '@/common/json/map.js'
import mapColor from '@/common/json/mapColor.json'
import itemProps from '@/common/json/itemProps.json'
import enemyDatas from '@/common/json/enemy.json'
import enlessModeMap from '@/common/json/mapData/enlessModeMap.json'
import Dialog from '@/views/components/Dialog'
import FightDialog from '@/views/components/FightDialog'
import Skill from '@/views/components/Skill'
import updateInfo from '@/common/json/updateInfo.json'
import skills from '@/common/json/skills'
import {
  randomValue,
  weightRandom
} from '@/common/utils'

const width = window.innerWidth;
const height = window.innerHeight;
let localStorage = window.localStorage
export default {
  name: 'Konva',
  components: {
    Dialog,
    Skill,
    FightDialog
  },
  data() {
    return {
      insNames:[],
      updateInfo:updateInfo,
      initMapData:[],
      currentLevel:0,
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
        itemsList: []
      },
      showBoxList:false,
      protagonist:{
        name: '主角',
        level: 1,
        attack: 8,
        defense: 6,
        basisAttack: 8,
        basisDefense: 6,
        maxhp: 50,
        hp: 50,
        crit: 0,
        dodge: 0,
        exp: 0,
        maxExp: 200,
        coordinate: [1],
        maxBox: 15,
        box: [],
        selectWeapon: {},
        selectArmor: {},
        skills:[]
      },
      nowEnemyData:{},
      showBattleDialog:false,
      showPassBtn:false,
      archiveShowInfo:null,
      boxLevelWeight:weightRandom({
        value:[-2, -1, 0, 1, 2],
        weight:[50, 40, 30, 20, 10]
      }),
      itemWeight:weightRandom({
        value:[1, 2, 3, 4],
        weight:[15, 25, 85, 10]
      }),
      enemyLevelWeight:weightRandom({
        value:[-2, -1, 0, 1, 2],
        weight:[20, 40, 30, 20, 10]
      })
    };
  },
  mounted() {
    this.initMapData = map
    this.initMap()
    this.archiveShowInfo = JSON.parse(localStorage.getItem('archiveShowInfo'))
  },
  filters: {
    percentageUnit:function(value){
      if(value || value + '' === '0'){
        return (value * 100).toFixed() + '%'
      }
      return ''
    }
  },
  computed:{
    progressBarHp(){
      return Math.ceil(this.protagonist.hp / this.protagonist.maxhp * 100) + '%'
    },
    progressBarExp(){
      return Math.ceil(this.protagonist.exp / this.protagonist.maxExp * 100) + '%'
    }
  },
  watch:{
    'selectCell.id':function(){
      this.showBoxList = false
    },
    'protagonist.box':function(val){
      // val.forEach(item => {
      //   switch(item.species){
      //     case 'armor':{
      //       this.protagonist.defense = this.protagonist.basisDefense + item.defense
      //       break
      //     }
      //     case 'weapon':{
      //       this.protagonist.attack = this.protagonist.basisAttack + item.attack
      //       break
      //     }
      //   }
      // })
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
      this.mapList = this.initMapData[this.currentLevel].map((item, index) => {
        let obj = {}
        let coordinates = this.coordinatesComputed(item.id)
        let bgColor = this.mapColorHandle(item)
        let points = this.drawLine(item.id, coordinates, item.passage)
        let itemsList = this.itemHandle(item.config.furniture)
        let enemy = this.enemyRandomCreate(item)
        obj = { 
          ...item,
          bgColor,
          ...coordinates,
          points,
          itemsList,
          enemy
        }
        this.initData(obj)
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
    initData(item){
      if(this.protagonist.coordinate.join('') === item.id.join('')){
        this.selectCell = item
      }
    },
    itemHandle(furniture){
      let arr = []
      let boxInfo = furniture.filter(item => {
        return item.label === 'box'
      })
      if(boxInfo.length){
        let boxLevel = this.protagonist.level + randomValue({ arr:this.boxLevelWeight }),
        sums = randomValue({ min:3, max:5 }),
        itemsNum = []

        for(let j=1;j<=sums;j++){
          itemsNum.push(randomValue({ arr:this.itemWeight }))
        }
        if(boxLevel <= 1){
          boxLevel = 1
        }
        arr = this.itemRandomCreate(boxLevel,itemsNum)
      }
      return arr
    },
    itemRandomCreate(level,itemsNum){
      let weaponType = itemProps.weaponTemplate.type,
      armorType = itemProps.armorTemplate.type,
      medicineType = itemProps.medicineTemplate.type,
      arr = itemsNum.map(item => {
        let obj = {}
        switch(item){//1:武器 2:防具 3:药瓶 4:技能
          case 1:{
            let typeInfo = randomValue({ arr:weaponType }),
            id = randomValue({ min:10000000, max:19999999 }),
            descRdm = randomValue({ min:1, max:99999 }).toString(36)
            obj = {
              id,
              styleClass:'weapon_item',
              species:'weapon',
              speciesDesc:'武器',
              type:typeInfo.name,
              typeDesc:typeInfo.desc + descRdm,
              attack:level * randomValue({ min:6, max:9})
            }
            obj.crit = 0
            if(Math.random() <= 0.25){
              obj.crit = Number((0.7 * (level * 0.04) / (level * 0.04 + 0.6)).toFixed(2))
            }
            obj.price = Math.floor(obj.attack * 2.5)
            break
          }
          case 2:{
            let typeInfo = randomValue({ arr:armorType }),
            id = randomValue({ min:20000000, max:29999999 }),
            descRdm = randomValue({ min:100000, max:199999 }).toString(36)
            obj = {
              id,
              styleClass:'armor_item',
              species:'armor',
              speciesDesc:'防具',
              type:typeInfo.name,
              typeDesc:typeInfo.desc + descRdm,
              defense:level * randomValue({ min:6, max:9 })
            }
            obj.dodge = 0
            if(Math.random() <= 0.25){
              obj.dodge = Number((0.4 * (level * 0.04) / (level * 0.04 + 0.6)).toFixed(2))
            }
            obj.price = Math.floor(obj.defense * 2)
            break
          }
          case 3:{
            let typeInfo = randomValue({ arr:medicineType }),
            id = randomValue({ min:30000000, max:39999999 })
            obj = {
              id,
              styleClass:'medicine_item',
              species:'medicine',
              speciesDesc:'药',
              type:typeInfo.name,
              typeDesc:typeInfo.desc,
              hp:level * randomValue({ min:15, max:25 })
            }
            obj.price = Math.floor(obj.hp / 5)
            break
          }
          case 4:{
            let typeInfo = randomValue({ arr:skills }),
            id = randomValue({ min:40000000, max:49999999 })
            obj = {
              id,
              styleClass:'skill_item',
              species:'skill',
              speciesDesc:'技能'
            }
            Object.assign(obj, typeInfo)
            obj.level = level
            obj.price = level * 20
            break
          }
        }
        return obj
      })
      return arr
    },
    enemyRandomCreate(item){
      if(item.type !== 'room' || Math.random() > 0.4){
        return []
      }
      let plevel = this.protagonist.level,
      num = randomValue({ min:1, max:3 }),
      arr = [],
      names = enemyDatas.name,
      classData = enemyDatas.class

      for(let i = 1;i <= num;i++){
        let obj = {
          id:randomValue({ min:1, max:9999999 }).toString(36),
          pid:item.id,
          name: randomValue({ arr:names }),
          class: 0,
          classDesc: '',
          level: 1,
          attack: 2,
          defense: 10,
          hp: 50,
          maxhp: 50,
          crit: 0,
          dodge: 0,
          exp: 100,
          box:[],
          skills:[],
          buff:[]
        }
        if(Math.random() <= 0.3){
          let classArr = classData.filter(item => {
            return item.class <= Math.ceil(plevel / 10)
          })
          let randomClass = randomValue({ arr:classArr })
          obj.class = randomClass.class
          obj.classDesc = randomClass.desc
        }

        obj.level = plevel + randomValue({ arr:this.enemyLevelWeight })
        if(obj.level <= 1){
          obj.level = 1
        }
        obj.level = obj.level + obj.class
        let levelRelated = Math.floor(Math.pow(obj.level, 1.4))
        obj.attack = 5 + Math.floor(levelRelated * randomValue({ min:2, max:2.8, decimal:1 }))
        obj.defense = 3 + Math.floor(levelRelated * randomValue({ min:2, max:2.8, decimal:1 }))
        obj.hp = 20 + Math.floor(levelRelated * randomValue({ min:12, max:17, decimal:1 }))
        obj.maxhp = obj.hp
        obj.crit = Number((0.4 * (obj.level * 0.04) / (obj.level * 0.04 + 0.6)).toFixed(2))
        obj.dodge = Number((0.2 * (obj.level * 0.04) / (obj.level * 0.04 + 0.6)).toFixed(2))
        obj.exp = obj.level * 120
        arr.push(obj)
      }
      return arr
    },
    cellClick(item){
      // if(this.protagonist.coordinate.join('') !== item.id.join('')){
      //   return
      // }
      // let obj = _.cloneDeep(item)
      // this.selectCell = obj
    },
    protagonistMove(item){
      let coordinate = this.protagonist.coordinate,
      itemId = item.id,
      pSide = this.selectCell.passage.side,
      iSide = item.passage.side

      if(coordinate.join('') === itemId.join(''))return

      if(this.protagonist.coordinate.length === 1){
        coordinate = this.protagonist.coordinate.concat([0])
      }
      if(item.id.length === 1){
        itemId = item.id.concat([0])
      }

      let xDiff = Math.abs(coordinate[0] - itemId[0]),
      yDiff = Math.abs(coordinate[1] - itemId[1])
      if( xDiff > 1 || yDiff > 1 || (xDiff === 1 && yDiff === 1) ){
        return this.$message({
          message:'超过移动距离',
          type:'error',
          center:true
        })
      }
      if(xDiff === 1){
        if((itemId[0] - coordinate[0] === 1 && !this.selectCell.passage.after) || 
        (itemId[0] - coordinate[0] === -1 && !item.passage.after)){
          return this.$message({
            message:'不可移动',
            type:'error',
            center:true
          })
        }
      }
      
      let flag = false
      if(yDiff === 1){
        if(coordinate[1] === 0){
          flag = !iSide
        }else{
          if(itemId[1] === 0){
            flag = !pSide
          }else{
            if(coordinate[1] - itemId[1] === 1){
              flag = coordinate[1] < 0 ? !iSide : !pSide
            }else{
              flag = coordinate[1] > 0 ? !iSide : !pSide
            }
          }
        }
      }
      if(flag){
        return this.$message({
          message:'不可移动',
          type:'error',
          center:true
        })
      }

      if(this.selectCell.enemy.length > 0){
        return this.$message({
          message:'当前区域敌人尚未清除，无法前往下一区域',
          type:'error',
          center:true
        })
      }

      let obj = _.cloneDeep(item)
      this.selectCell = obj
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
    enemyClick(item){
      this.showBoxList = false
    },
    enterBattle(item){
      this.nowEnemyData = item
      this.showBattleDialog = true
    },
    itemClick(row, selectCell){
      if(this.protagonist.box.length >= this.protagonist.maxBox){
        return this.$message({
          message:'背包已满',
          type:'error',
          center:true
        })
      }
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
    boxItemClick(item){
      switch(item.species){
        case 'medicine':{
          if(this.protagonist.hp === this.protagonist.maxhp)return
          let hp = this.protagonist.hp + item.hp
          if(hp > this.protagonist.maxhp){
            hp = this.protagonist.maxhp
          }
          this.protagonist.hp = hp
          this.boxItemAutoDestroy(item.id)
          break
        }
        case 'armor':{
          this.protagonist.selectArmor = item
          this.protagonist.defense = this.protagonist.basisDefense + item.defense
          this.protagonist.dodge = item.dodge
          break
        }
        case 'weapon':{
          this.protagonist.selectWeapon = item
          this.protagonist.attack = this.protagonist.basisAttack + item.attack
          this.protagonist.crit = item.crit
          break
        }
        case 'skill':{
          let arr = this.protagonist.skills,
          index = _.findIndex(arr,['typeDesc',item.typeDesc])
          if(index > -1){
            arr[index] = item
          }else{
            arr.push(item)
          }
          this.protagonist.skills = _.cloneDeep(arr)
          this.boxItemAutoDestroy(item.id)
          this.$message({
            message:'已学习技能',
            type:'success',
            center:true
          })
          break
        }
      }
    },
    boxItemAutoDestroy(id){
      let boxIndex = _.findIndex(this.protagonist.box,['id',id])
      this.protagonist.box.splice(boxIndex,1)
    },
    enterItemDestroy(item){
      if(item.species === 'armor' || item.species === 'weapon'){
        if(item.id === this.protagonist.selectWeapon.id || item.id === this.protagonist.selectArmor.id){
          return this.$message({
            message:'当前道具已装备，无法丢弃',
            type:'error',
            center:true
          })
        }
      }
      let index = _.findIndex(this.protagonist.box,['id',item.id])
      this.protagonist.box.splice(index,1)
    },
    fightEnd(type,hp,enemy){
      if(type){
        this.protagonist.hp = hp
        let index = ''
        let arr = this.mapList.map(item => {
          if(item.id.join('') === enemy.pid.join('')){
            index = _.findIndex(item.enemy,['id',enemy.id])
            item.enemy.splice(index,1)
          }
          return item
        })
        this.selectCell.enemy.splice(index,1)
        this.mapList = _.cloneDeep(arr)

        this.expHandle(enemy)
        this.passJudgment()
      }else{
        this.$confirm('胜败乃兵家常事，大侠请重新来过', '征程失利', {
          confirmButtonText: '读取本关存档',
          cancelButtonText: '重新开始'
        }).then(() => {
          this.saveOrReadArchive(true)
        }).catch(() => {
          location.reload()
        })
      }
    },
    passJudgment(){
      let flag = this.mapList.every(item => {
        return item.enemy.length === 0
      })
      if(flag){
        this.showPassBtn = true
        this.$confirm('当前关卡内敌人已清除殆尽，是否前往下一关卡', '关卡通关', {
          confirmButtonText: '确定',
          cancelButtonText: '取消，稍后手动前往'
        }).then(() => {
          this.passForward()
        })
      }
    },
    passForward(){
      if(this.currentLevel === (this.initMapData.length - 1)){
        let arr = []
        arr[this.currentLevel + 1] = this.endlessMode()
        this.initMapData = arr
      }
      ++this.currentLevel
      this.protagonist.coordinate = [1]
      this.showBattleDialog = false
      this.showPassBtn = false
      this.initMap()
      this.$nextTick(() => {
        this.saveOrReadArchive()
      })
    },
    expHandle(enemy){
      let {
        exp,
        maxExp,
        level
      } = this.protagonist
      let eExp = enemy.exp
      if(enemy.level > level){
        eExp = enemy.exp * 1.5
      }else if(enemy.level < level){
        eExp = enemy.exp * 0.8
      }

      exp = exp + eExp
      if(exp >= maxExp){
        exp = exp - maxExp
        ++this.protagonist.level
        this.protagonist.maxExp = 100 * Math.pow(this.protagonist.level,2) + 100

        let attack = randomValue({min:6,max:9}),
        defense = randomValue({min:4,max:6}),
        hp = randomValue({min:50,max:60})

        this.protagonist.basisAttack += attack
        this.protagonist.basisDefense += defense
        this.protagonist.attack += attack
        this.protagonist.defense += defense
        this.protagonist.maxhp += hp
        this.protagonist.hp = this.protagonist.maxhp
        if(this.protagonist.level % 5 === 0){
          this.protagonist.maxBox++
        }
        setTimeout(() => {
          this.$message({
            message:'等级提升!!!',
            type:'success',
            center:true
          })
        })
      }
      this.protagonist.exp = exp
    },
    endlessMode(){
      let arr = [],
      mapNum = randomValue({min:6,max:8})
      for(let i = 1;i<=mapNum;i++){
        let obj = {
          id: [i],
          passage: {
            after: 1
          },
          text: '',
          describe: '',
          species: 'build',
          type: 'room',
          config: {
            furniture: []
          }
        },
        childArr = [],
        mapText = this.randomMapContent()

        if(i === mapNum)obj.passage.after = 0
        Object.assign(obj, mapText)
        childArr.push(obj)
        if(Math.random() <= 0.2){
          let childNum = randomValue({min:1, max:4}),
          startNum = randomValue({min:-4, max:-1})
          if(Math.random() <= 0.5){
            if(Math.random() <= 0.5){
              startNum = 1
            }else{
              childNum = -1
            }
          }
          for(let j=startNum;j<=childNum;j++){
            if(j === 0)continue
            let childObj = _.cloneDeep(obj)
            childObj.id = [i, j]
            childObj.passage = {
              after: 0,
              side: 1
            }
            Object.assign(childObj, this.randomMapContent())
            childArr.push(childObj)
          }
        }

        arr = arr.concat(childArr)
      }
      return arr
    },
    randomMapContent(){
      let text = randomValue({ arr:enlessModeMap.name }),
      config = {}

      if(Math.random() <= 0.3){
        config = {
          config: {
            furniture: [
              {
                text: '箱子',
                label: 'box',
                level: randomValue({min:1, max:5})
              }
            ]
          }
        }
      }

      let obj = {
        ...text,
        ...config
      }
      return obj
    },
    saveOrReadArchive(flag){
      if(flag){
        this.showBattleDialog = false
        this.protagonist = JSON.parse(localStorage.getItem('protagonist'))
        this.mapList = JSON.parse(localStorage.getItem('mapList'))
        this.selectCell = JSON.parse(localStorage.getItem('selectCell'))
        this.currentLevel = JSON.parse(localStorage.getItem('currentLevel'))
        this.$message({
          message:'读取存档成功',
          type:'success',
          center:true
        })
      }else{
        let protagonist = JSON.stringify(this.protagonist),
        mapList = JSON.stringify(this.mapList),
        selectCell = JSON.stringify(this.selectCell)
        localStorage.setItem('protagonist',protagonist)
        localStorage.setItem('mapList',mapList)
        localStorage.setItem('selectCell',selectCell)
        localStorage.setItem('currentLevel',this.currentLevel)
        this.archiveShowInfo = {
          currentLevel:this.currentLevel,
          mapName:this.selectCell.text,
          hp:this.protagonist.hp
        }
        localStorage.setItem('archiveShowInfo',JSON.stringify(this.archiveShowInfo))
        this.$message({
          message:'已存档',
          type:'success',
          center:true
        })
      }
    }
  },
}

</script>
<style lang="scss" scoped>
button{
  cursor: pointer;
}
.weapon_item{
  background-color: #ffb649;
}
.armor_item{
  background-color: #ADD8E6;
}
.medicine_item{
  background-color: #ff7e7e;
}
.skill_item{
  background-color: #83e976;
}
.content_box{
  border: 2px solid #000;
  width: 900px;
  position: relative;
  .current_level{
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #fff;
    z-index: 99;
  }
  .stage{
    display: inline-block;
  }
  .info_box{
    display: inline-block;
    vertical-align: top;
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
        &.enemy_btn{
          background-color:rgb(255, 78, 78);
          border: 1px solid rgb(255, 143, 143);
          color: #fff;
        }
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
        padding: 5px;
        border-radius: 4px;
        line-height: 16px;
        margin-bottom: 10px;
        &:last-child{
          margin-bottom: 0;
        }
        &.cell_content_list_empty{
          text-align: center;
          margin-bottom: 0;
        }
        span{
          display: inline-block;
          margin: 0 10px 0 0;
        }
      }
    }
    .pass_btn{
      width: 100%;
      line-height: 30px;
      margin-top: 20px;
    }
  }
  .protagonist_info_area{
    box-sizing: border-box;
    width: 100%;
    min-height: 100px;
    background-color: #FFF5EE;
    border-top: 2px solid #999;
    padding: 10px;
    font-size: 14px;
    display: flex;
    .info_block{
      min-height: 80px;
      width: 220px;
      margin-right: 10px;
    }
    .states{
      li{
        margin-bottom: 3px;
        line-height: 18px;
        box-sizing: border-box;
        padding-left: 2px;
        &:last-child{
          margin-bottom: 0;
        }
        &.progress_bar{
          background-color: rgb(202, 202, 202);
          position: relative;
          z-index: 1;
          span{
            position: relative;
            z-index: 99;
          }
          &::after{
            content: '';
            display: block;
            width: var(--progressBar);
            height: 100%;
            background-color: var(--progressColor);
            position: absolute;
            z-index: 2;
            top: 0;
            left: 0;
          }
        }
        .attr_detail{
          color: #1bb8ec;
          font-size: 12px;
        }
      }
    }
    .cell_content_list{
      background-color: #fff;
      border: 2px solid #999;
      padding: 5px;
      border-radius: 4px;
      font-size: 12px;
      max-height: 160px;
      overflow-y: auto;
      li{
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        line-height: 16px;
        margin-bottom: 10px;
        &:last-child{
          margin-bottom: 0;
        }
        &.cell_content_list_empty{
          text-align: center;
          margin-bottom: 0;
        }
        span{
          display: inline-block;
          margin: 0 10px 0 0;
          &.item_destroy_box{
            margin: 0;
            float: right;
          }
        }
      }
    }
    .select_equip{
      margin-bottom: 10px;
    }
  }
  .update_info{
    width: 300px;
    max-height: 860px;
    position: absolute;
    right: -302px;
    top: -2px;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .ins_box{
      margin-bottom: 15px;
      p{
        font-weight: bold;
        span{
          color: #333;
          font-weight: normal;
        }
      }
    }
    .update_title{
      margin-bottom: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .time_line_box{
      flex: 1;
      overflow-y: auto;
      padding: 5px 0 0 5px;
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    .thanks{
      font-size: 14px;
      color: #666666;
    }
  }
  .function_area{
    background-color: #FFF5EE;
    padding: 10px;
    border-top: 2px solid #999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .function_btn_box{
      .function_btn{
        margin-right: 10px;
      }
    }
    .archive_info{
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border: 2px solid #00CCFF;
      font-size: 14px;
      padding: 0 5px;
      span{
        line-height: 20px;
        margin-right: 10px;
        &.archive_title{
          border-right: 2px solid #00CCFF;
          margin-right: 5px;
          padding-right: 5px;
        }
        &:last-child{
          margin-right: 0;
        }
      }
    }
  }
}
</style>



<template>
  <div id="map-container" class="main-map Map"></div>
</template>
<script>
import mapmost from "@mapmost/mapmost-webgl";
import * as turf from "@turf/turf";
import { bus_obj, trafficType, trafficCarTypeNum } from "@/common/model.js";
import TWEEN from "@tweenjs/tween.js";
import { P2W, W2P } from "@/utils/coordinateTransformation.js";
import { interpolateDistance, calculateAngle } from "@/utils/methods.js";
import treeData from "@/assets/treeData.js";

let otherVehicleLayer = {};
window.otherVehicleModelSet = {};
window.busGroup = null;
window.busLayer = null;

export default {
  name: "MapInfo",
  data() {
    return {
      map: null,
      rotationY: 0,
      timeStamp: 0,
      carIds: {},
    };
  },
  mounted() {
    this.lastTimeBearing = 0;
    window.busGroup = null; //保存全局车辆
    this.lastTimeRotationY = 0;
    //初始化地图
    this.initMap();
    this.isFirst = true;
    this.num = 0; //
    this.previousPosition = [];
    this.number = 0; //
  },
  methods: {
    //初始化地图
    initMap() {
      let map = new mapmost.Map({
        container: "map-container",
        style: "https://www.mapmost.com/cdn/styles/sample_data.json",
        center: [120.71923008473078, 31.29446443371741],
        zoom: 19,
        pitch: 68,
        bearing: 85.13519050946822,
        antialias: true,
        sky: "light",
        userId:""
      });

      map.on("load", () => {
        this.loadBUS(map);
        // 加载其它交通工具
        this.loadOtherVehicleOnOneLayer(map);
        this.addTreeModal(map);
        this.$emit("on-map-loaded");
      });
      this.map = map;
    },

    //加载树模型
    addTreeModal(map) {
      let options = {
        id: "model_id",
        type: "model",
        exposure: 2,
        sky: "./venice_fixed5_1.hdr",
        callback: function (group, layer) {
          layer.addBatchModel(
            {
              type: "model",
              model: {
                type: "glb",
                url: "./model/Tree.glb",
              },
              scale: 0.04,
              data: [...treeData],
            },
            function (models) {
              console.log(models);
              models.children.forEach((item) => {
                item.translateY(0.02);
              });
            }
          );
        },
      };
      map.addLayer(options);
    },

    //加载蓝色公交车模型
    loadBUS(map) {
      let busOBJ = {
        id: "model_car",
        type: "model",
        models: bus_obj,
        exposure: 1.7,
        center: [0, 0],
        sky: "./venice_sunset_2k_fixed5_1.hdr",
        defaultLights: false,
        callback: (group, layer) => {
          group.children[0].scale.x = 3;
          group.children[0].scale.y = 2.5;
          group.children[0].scale.z = 2.5;
          //group.setTranslate({ x: -3, y: -0.5, z: 10 });
          window.busGroup = group;
          window.busLayer = layer;
        },
      };
      map.addLayer(busOBJ);
    },

    //将其他车辆加载到同一个图层上
    loadOtherVehicleOnOneLayer(map) {
      let options = {
        id: "carLayer",
        type: "model",
        project: "3857",
        exposure: 1.8,
        sky: "./venice_sunset_2k_fixed5_1.hdr",
        center: [120.488421, 29.682504],
        callback: (group, layer) => {
          otherVehicleLayer = layer;
        },
      };
      map.addLayer(options);
      // 需要缩放的车类型
      let scaleCar = [26, 55];
      for (let key in trafficCarTypeNum) {
        let data = [];
        for (let num = 0; num < trafficCarTypeNum[key]; num++) {
          data.push({
            coordinate: [0, 0, 0],
          });
        }
        otherVehicleLayer.addBatchModel(
          {
            type: "model",
            model: trafficType[key][0],
            scale: 1,
            sky: "./venice_sunset_2k_fixed5_1.hdr",
            data,
          },
          (models) => {
            let model = models;
            if (key === "10") {
              model.children.forEach((item) => {
                item.scale.x = 0.08;
                item.scale.y = 0.08;
                item.scale.z = 0.08;
              });
            }
            if (scaleCar.indexOf(Number(key)) != -1) {
              model.children.forEach((item) => {
                item.scale.x = 0.1;
                item.scale.y = 0.1;
                item.scale.z = 0.1;
              });
            }
            otherVehicleModelSet["carLayer" + key] = {
              models: model,
              layer: otherVehicleLayer,
              center: data[0].coordinate,
            };
          }
        );
      }
    },

    //更新其他车辆的位置
    updateOtherVehiclePosition(RVMSG) {
      let trafficCarIndex = {};
      let carNameIndex;
      if (this.number % 3 === 0) {
        this.otherCarNum = RVMSG.length;
        RVMSG?.forEach((item) => {
          if (trafficCarIndex[item.vehicleType]) {
            trafficCarIndex[item.vehicleType].push(item);
          } else {
            trafficCarIndex[item.vehicleType] = [item];
          }
        });
        this._restVehiclePosition(RVMSG);
        RVMSG.forEach((item) => {
          carNameIndex = "carLayer" + item.vehicleType;
          let findModel = null;
          if (otherVehicleModelSet[carNameIndex]) {
            findModel = otherVehicleModelSet[carNameIndex].models.children.find(
              (carItem) =>
                carItem.userData.sid === `${item.vehicleType}-${item.sid}`
            );
          }
          // 如果没有指定类型的模型userData.sid 为item.sid 时，给模型添加userData.sid 并返回当前模型
          if (!findModel) {
            findModel = this.getModelFromSid(carNameIndex, item);
          }
          findModel.visible = true;
          let childTb = otherVehicleModelSet[carNameIndex].layer.tb;
          let childCenter = otherVehicleModelSet[carNameIndex].center;
          let childCenterTb = P2W(childCenter);
          let pos = P2W([item.pos.longitude, item.pos.latitude, 0]);
          let startPoint = W2P({
            x: findModel.position.x,
            y: findModel.position.y,
            z: 0,
          });
          let distance = this._getDistance(
            [item.pos.longitude, item.pos.latitude],
            [startPoint[0], startPoint[1]]
          );
          let endPoint = {
            x: pos.x - childCenterTb.x,
            y: pos.y - childCenterTb.y,
            z: pos.z - childCenterTb.z,
          };
          if (distance >= 30) {
            findModel.position.set(endPoint.x, endPoint.y, endPoint.z);
            findModel.rotation.y =
              (item.heading / 180) * Math.PI + Math.PI * 1.5;
          } else {
            let tween = new TWEEN.Tween({
              x: findModel.position.x,
              y: findModel.position.y,
              z: 0,
            });
            tween
              .to({ x: endPoint.x, y: endPoint.y, z: 0 }, 350)
              .onUpdate((pos) => {
                if (!isNaN(pos.x)) {
                  if (!isNaN(pos.y)) {
                    let res = new mapmost.THREE.Vector3(pos.x, pos.y, 0);
                    findModel.position.copy(res);
                  }
                }
              });
            findModel.rotation.y =
              (item.heading / 180) * Math.PI + Math.PI * 1.5;
            tween.start();
            findModel.userData.TWEEN = tween;
          }
        });
      }
      this.number++;
    },

    //根据id获取模型
    getModelFromSid(carNameIndex, item) {
      let modelsChildren = otherVehicleModelSet[carNameIndex].models.children;
      let sidModel = null;
      // 找出sid 为 null 的数据，
      for (let i = 0; i < modelsChildren.length; i++) {
        if (modelsChildren[i].userData.sid == null) {
          modelsChildren[i].userData.sid = `${item.vehicleType}-${item.sid}`;
          sidModel = modelsChildren[i];
          break;
        }
      }
      // 防止sidModel为null （表示所有的model均有destroyTimeStamp）
      // 筛选出最小的destroyTimeStamp 时间
      if (!sidModel) {
        sidModel = modelsChildren.reduce(function (prev, curr) {
          return prev.userData.destroyTimeStamp < curr.userData.destroyTimeStamp
            ? prev
            : curr;
        });
      }
      return sidModel;
    },

    //获取2个经纬度之间的距离
    _getDistance(p1, p2) {
      const distance =
        turf.distance(turf.point(p1), turf.point(p2), {
          units: "kilometers",
        }) * 1000;
      return distance;
    },

    // 重置车辆位置
    _restVehiclePosition(RVMSG) {
      let rvmsgId = RVMSG.map((item) => {
        // 每一次接收数据时，将carId 和 type 保存至 this.carIds
        this.carIds[`${item.vehicleType}-${item.sid}`] = {
          carId: item.sid,
          type: item.vehicleType,
        };
        return `${item.vehicleType}-${item.sid}`;
      });
      let id = [];
      for (let key in this.carIds) {
        if (rvmsgId.indexOf(key) === -1) {
          id.push(key);
          delete this.carIds[key];
        }
      }
      id.forEach((item) => {
        let modelGroup = otherVehicleModelSet[`carLayer${item.split("-")[0]}`];
        let resModel = modelGroup.models.children.find(
          (modelItem) => modelItem.userData.sid === item
        );
        if (resModel) {
          // 停止stop()动画，防止set(0,0,0)设置后，tween.js 动画还在执行
          if (resModel.userData.TWEEN) {
            resModel.userData.TWEEN.stop();
            resModel.userData.TWEEN = null;
          }
          resModel.position.set(0, 0, 0);
          resModel.visible = false;
          resModel.userData.sid = null;
          resModel.userData.destroyTimeStamp = +new Date(); // 保存车辆销毁的时间
        }
      });
    },

    //更新公交的位置
    _updateBusPosition({ HVMSG, speed }) {
      let { pos, heading } = HVMSG;
      let poc = [pos.longitude, pos.latitude];
      // 初始化没有小车
      if (!window.busGroup) return;
      //设置方向
      let rotationY = parseFloat(((heading / 180) * Math.PI).toFixed(2)); // 保留两位小数
      if (this.num % 10 === 0) {
        let tempBearing = parseInt(heading) + 180;
        let bearing = 0;
        let timeStamp = +new Date();
        let durationComputed = timeStamp - this.timeStamp;
        if (durationComputed > 2000) {
          durationComputed = 700;
        }
        if (this.isFirst) {
          durationComputed = 0;
        }
        let difBearing = Math.abs(this.lastTimeBearing - tempBearing);
        if (difBearing >= 4) {
          bearing = tempBearing;
        } else {
          bearing = this.lastTimeBearing;
        }

        let { x, y, z } = P2W(this.previousPosition);
        let endPos = P2W([poc[0], poc[1], 0]);
        var position = { x, y, z: 0 };
        let tween = new TWEEN.Tween(position);
        tween
          .to({ x: endPos.x, y: endPos.y, z: 0 }, durationComputed)
          .onUpdate((pos) => {
            let res = new mapmost.THREE.Vector3(pos.x, pos.y, 0);
            window.busGroup.position.copy(res);
            this.previousPosition = W2P(pos);
          });
        tween.start();
        /*
          解决问题：当旋转角度大于360 时，需要将start 和 end 同时减掉 360 
        */
        if (this.lastTimeRotationY >= 2 * Math.PI && rotationY >= 2 * Math.PI) {
          window.busGroup.children[0].rotation.y -= 2 * Math.PI;
          rotationY -= 2 * Math.PI;
        }
        if (
          this.lastTimeRotationY <= -2 * Math.PI &&
          rotationY <= -2 * Math.PI
        ) {
          window.busGroup.children[0].rotation.y += 2 * Math.PI;
          rotationY += 2 * Math.PI;
        }
        let rotationTween = null;
        rotationTween = new TWEEN.Tween(window.busGroup.children[0].rotation);
        rotationTween.to({ y: rotationY }, durationComputed);
        rotationTween.start();
        this.map.easeTo({
          center: poc,
          bearing: heading,
          duration: durationComputed + 200,
          pitch: 70,
          essential: true,
          easing: (t) => t,
        });
        this.lastTimeBearing = bearing;
        this.timeStamp = timeStamp; // 用于 计算两次执行所消耗的时间
        this.isFirst = false;
      }
      this.lastTimeRotationY = rotationY;
      this.num++;
    },
  },
};
</script>

<style lang="scss" scoped>
.main-map {
  position: absolute;
  width: 100%;
  height: 100vh;
  border: 2px solid;
  border-image: linear-gradient(to top, #1f4b80, rgba(0, 0, 0, 0)) 1;
  clip-path: inset(0 round 5px);
  color: rgb(255, 217, 0);
}
</style>

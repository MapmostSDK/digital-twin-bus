
<template>
  <div class="box">
    <div class="main-site">
      <SiteInfo :tips="tips" :isShow="isShow"></SiteInfo>
      <div class="left">
        <div class="left-title">为您推荐终点附近停车场</div>
        <div class="left-content">
          <div class="info">
            <i></i>
            <div class="information">
              <p class="title">桑格玛地下停车场</p>
              <p>88米</p>
            </div>
          </div>
          <div class="info">
            <i></i>
            <div class="information">
              <p class="title">知春路47号院停车场</p>
              <p>156米</p>
            </div>
          </div>
          <div class="info">
            <i></i>
            <div class="information">
              <p class="title">大厦停车场</p>
              <p>253米</p>
            </div>
          </div>
        </div>
        <div class="left-btn">
          <div>取消</div>
          <div class="btn">去停车</div>
        </div>
      </div>
    </div>
    <div class="right-bar">
      <div class="bar-inner" ref="barInnerRefs"></div>
      
    </div>
    <div class="right-bar-info">
      全程
    </div>
    <div>
      <MapInfo ref="map" @on-map-loaded="onMapLoaded"> </MapInfo>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import TWEEN from "@tweenjs/tween.js";

import SiteInfo from "./SiteInfo/index.vue";
import MapInfo from "./MapInfo/index.vue";
export default {
  name: "Map",
  components: {
    SiteInfo,
    MapInfo,
  },
  data() {
    return {
      speed: 0, //当前速度
      tips: "",
      isShow: false,
    };
  },
  methods: {
    onMapLoaded() {
      function render(time) {
        requestAnimationFrame(render);
        //更新Tween
        TWEEN.update(time);
      }
      render();
      setTimeout(() => {
        this.initScene();
      }, 3000);
    },

    //初始化场景
    initScene() {
      axios.get(`./data/res.json`).then((response) => {
        let result = response.data;
        let obu_result = result.filter((item) => item.body.msgType === "OBU");
        let count = 0; //1265

        this.timer = setInterval(() => {
          this.updateRightBar(count);
          if (count >= 1265) count = 0;
          if (count === 200) {
            this.isShow = true;
            this.tips = "即将汇入匝道";
          }
          if (count === 300) {
            this.isShow = false;
          }
          if (count === 900) {
            this.isShow = true;
            this.tips = "即将右转";
          }
          if (count === 1000) {
            this.isShow = false;
          }
          let obu_parseMessage = obu_result[count].body;
          let parseMessage = result[count].body;
          if (!parseMessage) return;
          if (obu_parseMessage) {
            this.moveVehicle(obu_parseMessage);
          }
          count++;
        }, 100);
      });
    },

    //开始让车动起来
    moveVehicle(obj) {
      let { data } = obj;
      let { HVMSG, RVMSG } = data;
      //当前车速
      if (!HVMSG) return;
      this.speed = HVMSG.speed;
      this.$refs?.map?.updateOtherVehiclePosition(RVMSG); // 周围车
      // 计算是否在这个范围内，
      this.$refs?.map?._updateBusPosition({
        HVMSG,
        speed: this.speed,
      });
    },
    updateRightBar(count) {
      let res = 100 - (count / 1265) * 100;
      this.$refs.barInnerRefs.style.transform = `translateY(${res}%)`;
    },
  },
  destroyed() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped lang="scss">
.box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000818;
  z-index: 3;
  .main-site {
    width: 400px;
    height: 70vh;
    box-sizing: border-box;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;

    position: absolute;
    left: 20px;
    top: 4vh;
    z-index: 10;

    background-repeat: no-repeat;
    .left {
      width: 100%;
      height: 280px;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 10;
      background-color: rgba($color: #334772, $alpha: 1);
      border-radius: 20px;
      box-sizing: border-box;
      padding: 20px;
      color: #fff;
      font-weight: 600;
      .left-title {
        font-size: 20px;
        margin-bottom: 10px;
      }
      .left-content {
        .info {
          height: 40px;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding-left: 10px;
          i {
            display: inline-block;
            width: 30px;
            height: 30px;
            background-image: url("../assets/images/停车场.png");
            background-size: 100% 100%;
            margin-right: 10px;
          }
          p {
            color: rgba($color: #fff, $alpha: 0.5);
            font-size: 12px;
          }
          .information {
            .title {
              font-size: 14px;
              color: #fff;
            }
          }
          cursor: pointer;
          &:hover {
            background-color: #243252;
          }
          transition: all 0.5s;
        }
      }
      .left-btn {
        display: flex;
        color: #000;
        margin-top: 30px;
        div {
          background-color: #fff;
          padding: 10px 30px;
          margin-right: 10px;
          border-radius: 10px;
          cursor: pointer;
          &:hover {
            background-color: #f2f2f2;
          }
          &.btn {
            padding: 10px 100px;
            background-color: #5671f5;
            color: #fff;
            &:hover {
              background-color: #3353f4;
            }
          }
        }
      }
    }
  }
  .right-bar {
    position: absolute;
    width: 16px;
    border-radius: 10px;
    height: 500px;
    background-color: #cdcdcd;
    border: 1px solid #fff;
    box-shadow: 0 0 4px 3px rgba(0,0,0,.05);
    z-index: 1000;
    right: 30px;
    top: 120px;
    overflow: hidden;
    .bar-inner {
      position: absolute;
      border-radius: 10px;
      height: 100%;
      width: 100%;
      transform: translateY(100%);
      background-color: rgb(65, 177, 101);
      transition: all 0.3s;
    }
    
  }

  .right-bar-info {
    position: absolute;
    top: 630px;
    right: 25px;
    z-index: 10001;
    text-align: center;
    font-size: 14px;
  }
}
</style>
<template>
  <div class="site-info">
    <div class="speed">
      <div>20</div>
      <span>KM/h</span>
    </div>
    <div class="tips" :class="isShow ? 'show' : ''">
      <i></i>
      <span>{{ tips }}</span>
    </div>
    <div class="site-info-middle">
      <div class="arrive-site">
        <div class="arrive-site-logo">
          <img src="../../assets/images/icon_daozhan.png" alt="定位" />
        </div>
        <div class="arrive-site-distance">
          <div class="arrive-site-tips">
            <span ref="arriveTipsRef">前方到站</span>
          </div>
        </div>
      </div>
      <div class="arrive-site-name">
        <span>园区二实小</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "SiteInfo",
  props: {
    tips: String,
    isShow: Boolean,
  },
};
</script>
<style lang="scss" scoped>
.site-info {
  width: 100%;
  height: 240px;
  background-color: rgba($color: #334772, $alpha: 1);
  box-sizing: border-box;
  padding: 28px 20px;
  border-radius: 20px;
  z-index: 1000;
 
  .speed {
    width: 62px;
    height: 50px;
    font-size: 28px;
    font-weight: 600;
    background-image: url("./images/ybp.png");
    background-size: 100% 100%;
    position: absolute;
    right: -70px;
    top: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-shadow: 1px 1px 4px 3px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    padding-top: 20px;
    span {
      font-size: 14px;
    }
  }
  .tips {
    width: 200px;
    height: 80px;
    background-color: #ecf4fa;
    border-radius: 10px;
    position: absolute;
    right: -210px;
    top: 10px;
    display: flex;
    align-items: center;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    transition: all 0.5s;
    opacity: 0;
    transform: translateX(-100%);
    &.show {
      opacity: 1;
      transform: translateX(0);
    }
    i {
      display: inline-block;
      width: 50px;
      height: 50px;
      background-image: url("./images/right.png");
      background-size: 100% 100%;
      margin-left: 20px;
    }
    span {
      font-weight: 600;
      margin-left: 10px;
    }
  }
  .site-info-middle {
    margin-top: 15px;
    .arrive-site {
      width: 380px;
      box-sizing: border-box;
      padding-right: 60px;
      display: flex;
      justify-content: space-between;
      height: 100%;

      .arrive-site-logo {
        width: 30px;
        margin-left: 50px;
        img {
          margin-top: 10px;
          width: 30px;
        }
      }
      .arrive-site-distance {
        width: 220px;
        text-align: center;
        margin-left: 10px;
        .arrive-site-tips {
          span {
            font-size: 40px;
            font-family: "SourceHanSansCN-Bold";
            font-weight: 600;
            color: #ffffff;
            letter-spacing: 6px;
            background: linear-gradient(
              360deg,
              rgba(255, 255, 255, 0.4) 0%,
              #ffffff 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        .arrive-site-long {
          box-sizing: border-box;
          display: flex;
          // justify-content: space-around;
          padding-left: 20px;
          align-items: center;
          span {
            font-size: 30px;
            font-family: "SourceHanSansCN-Regular";
            font-weight: 400;
            color: #9faab9;
            letter-spacing: 2px;
          }
          i {
            display: inline-block;
            width: 44px;
            height: 44px;
            background-image: url("./images/icon_juli.png");
            background-size: 100% 100%;
            margin-right: 30px;
          }
        }
      }
    }
    .arrive-site-name {
      width: 380px;
      display: flex;
      text-align: center;
      justify-content: center;
      align-items: center;
      font-size: 50px;
      font-family: "SourceHanSansCN-Bold";
      font-weight: 600;
      height: 104px;
      line-height: 104px;
      background-image: url("./images/dz_xiahuaxian.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      span {
        background: linear-gradient(
          360deg,
          rgba(0, 197, 212, 0.38) 0%,
          #18fffb 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
}
</style>
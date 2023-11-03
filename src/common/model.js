/*
 * @Descripttion:模型路径和类型配置
 * @Author: 朱东帅
 * @Date: 2023-10-30 13:19:27
 * @LastEditors: 朱东帅
 * @LastEditTime: 2023-10-30 17:56:52
 */

//公交模型
let bus_obj = ["./model/Bus.glb"].map((item) => ({
  type: "glb",
  url: item,
}));
// 货车模型
let truck_obj = ["./model/货车.glb"].map((item) => ({
  type: "glb",
  url: item,
}));
//小车模型
let car = ["./model/小车.glb"].map((item) => ({
  type: "glb",
  url: item,
}));
//校车
let school_obj = ["./model/校车.glb"].map((item) => ({
  type: "glb",
  url: item,
}));

//其他交通类型 vehicleType
let trafficType = {
  10: car, //小车
  26: truck_obj, //其它卡车
  55: school_obj, //校车
};
// 每一种类型对应的个数,其他车辆
const trafficCarTypeNum = {
  10: 200,
  26: 50,
  55: 50,
};
export { bus_obj, trafficType, trafficCarTypeNum };

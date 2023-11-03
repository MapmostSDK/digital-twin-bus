// 计算两个经纬度点之间的距离（单位：千米）
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（单位：千米）

  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
    Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

// 将角度转换为弧度
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

// 将距离按照等距离分隔成指定数量的点
function interpolateDistance(startPoint, endPoint, stepSize) {
  let { lng1, lat1 } = startPoint
  let { lng2, lat2 } = endPoint
  const totalDistance = getDistance(lat1, lng1, lat2, lng2);
  const numSteps = Math.floor(totalDistance / stepSize);

  const points = [];

  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    const lat = interpolate(lat1, lat2, fraction);
    const lon = interpolate(lng1, lng2, fraction);
    points.push({ lat, lon });
  }
  // 计算两个点之间的方向
  let result = []
  for (let i = 0; i < points.length - 1; i++) {
    let item = points[i];
    let nextItem = points[i + 1]
    const heading = calculateAngle([item.lon, item.lat], [nextItem.lon, nextItem.lat])
    result.push({
      lon: item.lon,
      lat: item.lat,
      heading
    })
  }
  return result;
}

// 在两个值之间进行插值
function interpolate(value1, value2, fraction) {
  return value1 + (value2 - value1) * fraction;
}

// 根据相邻两点计算模型的方位角
function calculateAngle(startPoint, endPoint) {
  let bearing;
  if (endPoint[0] === startPoint[0]) {
    bearing = endPoint[1] > startPoint[1] ? 0 : 180;
  } else {
    let k = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0])
    let radian = Math.atan(k);
    if (startPoint[0] < endPoint[0]) {
      bearing = -radian + Math.PI / 2;
    } else {
      bearing = -radian + Math.PI * 3 / 2;
    }
  }

  return bearing * 180 / Math.PI;
}

export { interpolateDistance, calculateAngle }
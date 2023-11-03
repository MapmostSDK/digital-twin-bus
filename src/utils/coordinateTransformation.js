import mapmost from "@mapmost/mapmost-webgl";
const WORLD_SIZE = 1024000;
const MERCATOR_A = 6378137.0;
const FOV_ORTHO = (0.1 / 180) * Math.PI;
const FOV = Math.atan(3 / 4);
const EARTH_RADIUS = 6371008.8;
const EARTH_CIRCUMFERENCE_EQUATOR = 40075017;
const Constants = {
  WORLD_SIZE: WORLD_SIZE,
  PROJECTION_WORLD_SIZE: WORLD_SIZE / (EARTH_RADIUS * Math.PI * 2),
  MERCATOR_A: EARTH_RADIUS,
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  EARTH_RADIUS: EARTH_RADIUS,
  EARTH_CIRCUMFERENCE: 2 * Math.PI * EARTH_RADIUS,
  EARTH_CIRCUMFERENCE_EQUATOR: EARTH_CIRCUMFERENCE_EQUATOR,
  FOV_ORTHO: FOV_ORTHO,
  FOV: FOV,
  FOV_DEGREES: (FOV * 180) / Math.PI,
  TILE_SIZE: 512,
};

function projectedUnitsPerMeter(latitude) {
  var _0x3a8d = ["abs", "EARTH_CIRCUMFERENCE"];
  var _0x12f0 = function (_0x3a8d5f, _0x12f0b6) {
    _0x3a8d5f = _0x3a8d5f - 0x0;
    var _0x10d647 = _0x3a8d[_0x3a8d5f];
    return _0x10d647;
  };
  return Math[_0x12f0("0x0")](
    Constants["WORLD_SIZE"] /
      Math["cos"](Constants["DEG2RAD"] * latitude) /
      Constants[_0x12f0("0x1")]
  );
}
// 投影坐标转世界坐标
function P2W(coords) {
  var _0x1689 = [
    "DEG2RAD",
    "PROJECTION_WORLD_SIZE",
    "push",
    "MERCATOR_A",
    "log",
  ];
  var _0xb039 = function (_0x168906, _0xb03962) {
    _0x168906 = _0x168906 - 0x0;
    var _0x103e43 = _0x1689[_0x168906];
    return _0x103e43;
  };
  var projected = [
    -Constants[_0xb039("0x3")] *
      Constants[_0xb039("0x0")] *
      coords[0x0] *
      Constants[_0xb039("0x1")],
    -Constants["MERCATOR_A"] *
      Math[_0xb039("0x4")](
        Math["tan"](
          Math["PI"] * 0.25 + 0.5 * Constants["DEG2RAD"] * coords[0x1]
        )
      ) *
      Constants[_0xb039("0x1")],
  ];
  if (!coords[0x2]) projected[_0xb039("0x2")](0x0);
  else {
    var pixelsPerMeter = projectedUnitsPerMeter(coords[0x1]);
    projected["push"](coords[0x2] * pixelsPerMeter);
  }
  var result = new mapmost["THREE"]["Vector3"](
    projected[0x0],
    projected[0x1],
    projected[0x2]
  );
  return result;
}
// 世界坐标转投影坐标
function W2P(worldUnits) {
  var _0x4f7b = [
    "DEG2RAD",
    "PROJECTION_WORLD_SIZE",
    "push",
    "exp",
    "MERCATOR_A",
  ];
  var _0x2d64 = function (_0x4f7b7b, _0x2d6480) {
    _0x4f7b7b = _0x4f7b7b - 0x0;
    var _0x10ead0 = _0x4f7b[_0x4f7b7b];
    return _0x10ead0;
  };
  var unprojected = [
    -worldUnits["x"] /
      (Constants[_0x2d64("0x4")] *
        Constants[_0x2d64("0x0")] *
        Constants[_0x2d64("0x1")]),
    (0x2 *
      (Math["atan"](
        Math[_0x2d64("0x3")](
          worldUnits["y"] /
            (Constants[_0x2d64("0x1")] * -Constants[_0x2d64("0x4")])
        )
      ) -
        Math["PI"] / 0x4)) /
      Constants[_0x2d64("0x0")],
  ];
  var pixelsPerMeter = projectedUnitsPerMeter(unprojected[0x1]);
  var height = worldUnits["z"] || 0x0;
  unprojected[_0x2d64("0x2")](height / pixelsPerMeter);
  return unprojected;
}
export { P2W, W2P };

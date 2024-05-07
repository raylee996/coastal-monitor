/**
 * 声明在 src/global.d.ts，public/index.html 引入。Leaflet 全局
 */
declare var L: any;

/** 声明在src/global.d.ts，axios实例的baseURL属性，在环境变量REACT_APP_BASE_URL中设置，在public/index.html引入。 */
declare const BASE_URL: string;

/** 声明在src/global.d.ts，token在请求头部当中自定义的键名称，在环境变量REACT_APP_HEADER_TOKEN_KEY中设置，在public/index.html引入。 */
declare const TOKEN_KEY: string;

/** 声明在src/global.d.ts，axios实例的WebsocketURL属性，在环境变量REACT_APP_WEBSOCKET_URL中设置，在public/index.html引入。 */
declare const WEBSOCKET_URL: string;

/**
 * 声明在 src/global.d.ts，public/index.html 引入。
 * 一个处理地理坐标系的 JS 库，用来修正百度地图、高德地图及其它互联网地图坐标系不统一的问题
 */
declare var gcoord: any;

declare var pixi: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。*/
declare var axios: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var CryptoJS: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var Mock: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var Qs: any;

/** 声明在src/global.d.ts，public/index.html引入。
 * proj4全局
 * */
declare var proj4: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var flvjs: any;

declare var echarts: any;
/*  */
declare var SVGA: any;
/* CA登录 */
declare var $QCA: any;
// declare var SzcaPki: any;
declare var Base64: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。
 * 用于将 WKT 几何转换为 GeoJSON 几何的工具，反之亦然
 * */
interface ITerraformer {
  /** geojson to wkt */
  geojsonToWKT: (geojson: any) => any;
  /** wkt to geojson */
  wktToGeoJSON: (wkt: any) => any;
}
declare var Terraformer: ITerraformer;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var turf: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var Hls: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare var ZLMRTCClient: any;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare const warningMp3Src: string;

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare const Jessibuca: any

/** 声明在src/global.d.ts，使用CDN在public/index.html引入。 */
declare const JessibucaPro: any
import _ from "lodash";
import { MapType } from "./map/crsUtil";
import StreetMapImgSrc from "images/mapType/map1.png";
import SatelliteMapImgSrc from "images/mapType/map2.png";
import SeaMapImgSrc from "images/mapType/map3.png";
import { MapTileType } from "./Map2D";
import common from "./common";

import place1_src from "images/place/1.svg"
import place2_src from "images/place/2.svg"
import place3_src from "images/place/3.svg"
import place4_src from "images/place/4.svg"
import place5_src from "images/place/5.svg"
import place6_src from "images/place/6.svg"
import place7_src from "images/place/7.svg"
import place8_src from "images/place/8.svg"
import place9_src from "images/place/9.svg"
import place10_src from "images/place/10.svg"
import place11_src from "images/place/11.svg"
import place99_src from "images/place/99.svg"

import huochuan_g from "images/ship/map/huochuan_g.svg"
import huochuan_o from "images/ship/map/huochuan_o.svg"
import huochuan_r from "images/ship/map/huochuan_r.svg"
import huochuan_y from "images/ship/map/huochuan_y.svg"
import jiayouchuan_g from "images/ship/map/jiayouchuan_g.svg"
import jiayouchuan_o from "images/ship/map/jiayouchuan_o.svg"
import jiayouchuan_r from "images/ship/map/jiayouchuan_r.svg"
import jiayouchuan_y from "images/ship/map/jiayouchuan_y.svg"
import kechuan_g from "images/ship/map/kechuan_g.svg"
import kechuan_o from "images/ship/map/kechuan_o.svg"
import kechuan_r from "images/ship/map/kechuan_r.svg"
import kechuan_y from "images/ship/map/kechuan_y.svg"
import qitachuan_g from "images/ship/map/qitachuan_g.svg"
import qitachuan_o from "images/ship/map/qitachuan_o.svg"
import qitachuan_r from "images/ship/map/qitachuan_r.svg"
import qitachuan_y from "images/ship/map/qitachuan_y.svg"
import teshuchuan_g from "images/ship/map/teshuchuan_g.svg"
import teshuchuan_o from "images/ship/map/teshuchuan_o.svg"
import teshuchuan_r from "images/ship/map/teshuchuan_r.svg"
import teshuchuan_y from "images/ship/map/teshuchuan_y.svg"
import tuochuan_g from "images/ship/map/tuochuan_g.svg"
import tuochuan_o from "images/ship/map/tuochuan_o.svg"
import tuochuan_r from "images/ship/map/tuochuan_r.svg"
import tuochuan_y from "images/ship/map/tuochuan_y.svg"
import youting_g from "images/ship/map/youting_g.svg"
import youting_o from "images/ship/map/youting_o.svg"
import youting_r from "images/ship/map/youting_r.svg"
import youting_y from "images/ship/map/youting_y.svg"
import yuchuan_g from "images/ship/map/yuchuan_g.svg"
import yuchuan_o from "images/ship/map/yuchuan_o.svg"
import yuchuan_r from "images/ship/map/yuchuan_r.svg"
import yuchuan_y from "images/ship/map/yuchuan_y.svg"
import zuoyechuan_g from "images/ship/map/zuoyechuan_g.svg"
import zuoyechuan_o from "images/ship/map/zuoyechuan_o.svg"
import zuoyechuan_r from "images/ship/map/zuoyechuan_r.svg"
import zuoyechuan_y from "images/ship/map/zuoyechuan_y.svg"
import zhifachuan from "images/ship/map/zhifachuan.svg"


export interface Type<T> {
  /** 字典名 */
  name: string;
  /** 字典值 */
  value: T;
}

/** 每层条数 */
export const nodeLevelDict: Type<number>[] = [
  { name: "5", value: 5 },
  { name: "6", value: 6 },
  { name: "7", value: 7 },
  { name: "8", value: 8 },
  { name: "9", value: 9 },
  { name: "10", value: 10 },
];

// 同行数据类型
export const followRelationType: Type<number>[] = [
  { name: "不限", value: 6 },
  { name: "AIS", value: 4 },
  { name: "雷达", value: 5 },
]
export const follwoRelationTime: Type<string>[] = [
  { name: '近一周', value: '1' },
  { name: '近一月', value: '2' },
  { name: '近三月', value: '3' }
]

/** 查询时段 */
export const searchTimeRangeDict: Type<number>[] = [
  { name: "近一周", value: 0 },
  { name: "近一月", value: 1 },
  { name: "近三月", value: 2 },
  { name: "近半年", value: 3 },
];

/** 风险等级*/
// export const riskLevelDict: Type<number>[] = [
//   { name: "全部", value: 0 },
//   { name: "低风险", value: 1 },
//   { name: "中风险", value: 2 },
//   { name: "高风险", value: 3 },
//   { name: "无风险", value: 3 },
// ];

/** 船舶风险分布总风险等级*/
export const ShipRiskDict: Type<number>[] = [
  { name: "高风险", value: 1 },
  { name: "中风险", value: 2 },
  { name: "低风险", value: 3 },
  { name: "无风险", value: 4 },
];

/** 船型 */
export const shipTypeDict: Type<number>[] = [
  { name: "重点船舶", value: 2 },
  { name: "关注船舶", value: 3 },
  { name: "一般船舶", value: 4 },
];

/** 车辆类型 */
export const carDescTypeDict: Type<number>[] = [
  { name: "重点车辆", value: 2 },
  { name: "关注车辆", value: 3 },
  { name: "一般车辆", value: 4 },
];

/** 公开方式*/
export const publicMethod: Type<number>[] = [
  { name: "所有人可见", value: 1 },
  { name: "本部门可见", value: 2 },
  { name: "本人可见", value: 3 },
];

/** 风险类别*/
export const riskType: Type<number>[] = [
  { name: "走私船舶", value: 0 },
  { name: "偷渡船舶", value: 1 },
];

/** 船型列表类型 */
export const shipListTypeDict: Type<any>[] = [
  { name: "全部", value: -1 },
  { name: "重点船舶", value: 2 },
  { name: "关注船舶", value: 3 },
  { name: "一般船舶", value: 4 },
];

/** 船型列表类型 */
export const shipTableTypeDict: Type<string>[] = [
  { name: "重点船舶", value: '2' },
  { name: "关注船舶", value: '3' },
  { name: "一般船舶", value: '4' },
  { name: "南山船舶", value: '6' },
];

/** 人员列表类型 */
export const personTypeDict: Type<number>[] = [
  { name: "重点人员", value: 2 },
  { name: "关注人员", value: 3 },
  { name: "一般人员", value: 4 },
];
/** 实时预警（带全部）*/
export const realTimeWarningDict: Type<number>[] = [
  { name: "全部", value: 0 },
  { name: "已开启", value: 1 },
  { name: "已关闭", value: 2 },
];

//实时预警（无全部选项）
export const realTimeWarning: Type<number>[] = [
  { name: "关闭", value: 0 },
  { name: "开启", value: 1 },
];

// 风险等级筛选条件
export const riskLevelOptions: Type<number>[] = [
  // { value: 0, name: "无风险" },
  { value: 3, name: "低风险" },
  { value: 2, name: "中风险" },
  { value: 1, name: "高风险" },
];

// 船舶分类筛选条件
export const focusTypeDict: Type<string>[] = [
  { value: '', name: "全部" },
  { value: '2', name: "重点" },
  { value: '3', name: "关注" },
];

// AIS目标状态筛选条件
export const aisStatusOptions: Type<number>[] = [
  { value: 0, name: "航行" },
  { value: 1, name: "静止" },
];

// 雷达目标状态筛选条件
export const radarStatusOptions: Type<number>[] = [
  { value: 0, name: "运动" },
  { value: 1, name: "静止" },
];

// AIS目标船长筛选（米）条件
export const shipLengthOptions: Type<number>[] = [
  { value: 0, name: "1-50" },
  { value: 1, name: "51-100" },
  { value: 2, name: "101-150" },
  { value: 3, name: "大于150" },
];

// 设备图层筛选条件
export const deviceLayerOptions: Type<number>[] = [
  { value: 0, name: "摄像机" },
  { value: 1, name: "人脸识别" },
  { value: 2, name: "车辆卡口" },
  { value: 3, name: "AIS" },
  { value: 4, name: "无人机" },
  { value: 5, name: "电子区域防控" },
  { value: 6, name: "海防雷达" },
  { value: 7, name: "激光雷达" },
  { value: 8, name: "红外周扫" },
  { value: 9, name: "探照灯" },
  { value: 10, name: "IP音柱" },
  { value: 11, name: "无人船" },
];
// 设备类型
export const deviceListOptions: Type<number>[] = [
  { value: 1, name: "摄像机" },
  { value: 4, name: "AIS" },
  { value: 11, name: "无人机" },
  { value: 8, name: "电子区域防控" },
  { value: 5, name: "海防雷达" },
  { value: 6, name: "激光雷达" },
  { value: 7, name: "红外周扫" },
  { value: 10, name: "探照灯" },
  { value: 9, name: "IP音柱" },
];

// 设备来源
export const deviceSourceDict: Type<number>[] = [
  { value: 0, name: "自建" },
  { value: 1, name: "视综" }
];

// 数据图层筛选条件
export const dataLayerOptions: Type<string>[] = [
  { value: "1", name: "AIS数据" },
  { value: "2", name: "雷达数据" },
  { value: "3", name: "融合数据" },
  { value: "4", name: "回波数据" },
];

// 风险等级筛选条件
export const shipLevelOptions: Type<string>[] = [
  { value: "1", name: "高风险" },
  { value: "2", name: "中风险" },
  { value: "3", name: "低风险" },
  { value: "4", name: "无风险" },
];

// 船舶大小筛选条件
export const shipSizeOptions: Type<string>[] = [
  { value: "1", name: "小船(20米内)" },
  { value: "2", name: "中型船(20-50米)" },
  { value: "3", name: "大型船(50米以上)" },
];

// 船舶运动状态筛选条件
export const shipStateOptions: Type<string>[] = [
  { value: "1", name: "运动船舶" },
  { value: "0", name: "静止船舶" },
];

// 地图类型
export const MapTypeDict: Type<any>[] = [
  { name: "地图", value: { type: MapType.StreetMap, imgSrc: StreetMapImgSrc } },
  {
    name: "卫图",
    value: { type: MapType.SatelliteMap, imgSrc: SatelliteMapImgSrc },
  },
  { name: "海图", value: { type: MapType.SeaMap, imgSrc: SeaMapImgSrc } },
];

// 布控等级
export const ControlLevelDict: Type<number>[] = [
  { value: 1, name: "高风险" },
  { value: 2, name: "中风险" },
  { value: 3, name: "低风险" },
];

// 作业类型
export const WorkTypeDict: Type<number>[] = [
  { value: 0, name: "渔业捕获" },
  { value: 1, name: "水产养殖" },
  { value: 2, name: "休闲观光" },
  { value: 3, name: "货运" },
  { value: 4, name: "运输" },
  { value: 5, name: "渔业生产运输" },
  { value: 6, name: "养殖" },
  { value: 7, name: "水产运销" },
  { value: 8, name: "客运" },
  { value: 9, name: "休闲旅游观光" },
  { value: 10, name: "渔业辅助" },
  { value: 11, name: "其它" },
];

// 布控类型
export const ControlTypeDict: Type<number>[] = [
  { value: 1, name: "船舶布控" },
  { value: 2, name: "人车布控" },
];

// 人员布控的布控子类型
export const ControlSubTypeDict: Type<number>[] = [
  { value: 0, name: "手机布控" },
  { value: 1, name: "人员布控" },
  { value: 2, name: "车辆布控" },
];

// 布控状态
export const ControlStatusDict: Type<number>[] = [
  { value: 1, name: "待审批" },
  { value: 2, name: "已撤回" },
  { value: 3, name: "已布控" },
  { value: 4, name: "已撤控" },
  { value: 5, name: "已驳回" },
  // { value: 6, name: "续控审批中" },
  // { value: 7, name: "撤控审批中" }
];

// 通用 所有、指定
export const CommonScopeDict: Type<string>[] = [
  { value: "0", name: "所有" },
  { value: "1", name: "指定" },
];

// 通用 所有、指定
export const AlarmConditionDict: Type<string>[] = [
  { value: "0", name: "双向" },
  { value: "1", name: "进入" },
  { value: "2", name: "离开" },
  { value: "3", name: "出现" },
];

// 绘制区域的图形类型
export const graphicalTypeDict: Type<string>[] = [
  { value: "1", name: "线" },
  { value: "2", name: "圆形" },
  { value: "3", name: "矩形" },
  { value: "4", name: "多边形" },
];

// 性别
export const sexDict: Type<string>[] = [
  { value: "0", name: "未知" },
  { value: "1", name: "男" },
  { value: "2", name: "女" },
];

// 性别
export const genderDict: Type<number>[] = [
  { value: 0, name: "未知" },
  { value: 1, name: "男" },
  { value: 2, name: "女" },
];

// 民族
export const nationDict: Type<string>[] = [
  { value: "1", name: "汉族" },
  { value: "2", name: "蒙古族" },
  { value: "3", name: "回族" },
  { value: "4", name: "藏族" },
  { value: "5", name: "维吾尔族" },
  { value: "6", name: "苗族" },
  { value: "7", name: "彝族" },
  { value: "8", name: "壮族" },
  { value: "9", name: "布依族" },
  { value: "10", name: "朝鲜族" },
  { value: "11", name: "满族" },
  { value: "12", name: "侗族" },
  { value: "13", name: "瑶族" },
  { value: "14", name: "白族" },
  { value: "15", name: "土家族" },
  { value: "16", name: "哈尼族" },
  { value: "17", name: "哈萨克族" },
  { value: "18", name: "傣族" },
  { value: "19", name: "黎族" },
  { value: "20", name: "傈僳族" },
  { value: "21", name: "佤族" },
  { value: "22", name: "畲族" },
  { value: "23", name: "高山族" },
  { value: "24", name: "拉祜族" },
  { value: "25", name: "水族" },
  { value: "26", name: "东乡族" },
  { value: "27", name: "纳西族" },
  { value: "28", name: "景颇族" },
  { value: "29", name: "柯尔克孜族" },
  { value: "30", name: "土族" },
  { value: "31", name: "达翰尔族" },
  { value: "32", name: "么佬族" },
  { value: "33", name: "羌族" },
  { value: "34", name: "布朗族" },
  { value: "35", name: "撒拉族" },
  { value: "36", name: "毛南族" },
  { value: "37", name: "仡佬族" },
  { value: "38", name: "锡伯族" },
  { value: "39", name: "阿昌族" },
  { value: "40", name: "普米族" },
  { value: "41", name: "塔吉克族" },
  { value: "42", name: "怒族" },
  { value: "43", name: "乌孜别克族" },
  { value: "44", name: "俄罗斯族" },
  { value: "45", name: "鄂温克族" },
  { value: "46", name: "德昂族" },
  { value: "47", name: "保安族" },
  { value: "48", name: "裕固族" },
  { value: "49", name: "京族" },
  { value: "50", name: "塔塔尔族" },
  { value: "51", name: "独龙族" },
  { value: "52", name: "鄂伦春族" },
  { value: "53", name: "赫哲族" },
  { value: "54", name: "门巴族" },
  { value: "55", name: "珞巴族" },
  { value: "56", name: "基诺族" },
];

// 航行状态
export const navigationStatusDict: Type<number>[] = [
  { value: 0, name: "全部" },
  { value: 1, name: "在航" },
  { value: 2, name: "抛锚" },
  { value: 3, name: "吃水受限" },
];

/**
 * test 临时字典
 * 布控分类
 */
export const controlTypeIdDict: Type<number>[] = [
  { value: 1, name: "治安防范" },
  { value: 2, name: "社区矫正人员" },
  { value: 3, name: "维稳人员" },
  { value: 4, name: "涉毒人员" },
  { value: 5, name: "涉恐人员" },
];

/**
 * 线索类型
 * */
export const clueType: Type<number>[] = [
  { value: 1, name: "船舶" },
  { value: 2, name: "人车" },
];

/**
 * 智能研判状态
 * */
export const judgmentStatusDict: Type<any>[] = [
  { value: "0", name: "已创建" },
  { value: "1", name: "分析中" },
  { value: "2", name: "分析完成" },
  { value: "3", name: "分析失败" },
];
/**
 * 研判对象
 * */
export const judgmentObjType: Type<string>[] = [
  { value: "1", name: "船舶" },
  { value: "2", name: "人车" },
];
/**
 * 研判数据类型
 * */
export const judgmentDataType: Type<any>[] = [
  { value: "01", name: "人脸" },
  { value: "02", name: "车辆" },
  // { value: "03", name: "侦码" },
  { value: "04", name: "AIS" },
  { value: "05", name: "雷达" },
];

/**
 * 0-人脸
  1-车牌
  2-侦码
  3-Imei
  4-Mac
  5-手机
  6-MMSI
  7-雷达批号
  8-目标ID
 */
export const clueContentDict: Type<number>[] = [
  { value: 0, name: "人脸" },
  { value: 1, name: "车牌" },
  { value: 2, name: "侦码" },
  { value: 3, name: "IMEI" },
  { value: 4, name: "MAC" },
  { value: 5, name: "手机" },
  // { value: 6, name: "MMSI" },
  { value: 6, name: "AIS" },
  { value: 7, name: "雷达批号" },
  { value: 8, name: "目标ID" },
  //前端自定义
  { value: 9, name: "视频预警" },
  // { value: 9, name: "船舶档案" },
  { value: 10, name: "人员档案" },
  { value: 11, name: "车辆档案" },
];

/**智慧建模行为记录列表，目标*/
export const recordTargetDict: Type<any>[] = [
  { name: "人脸", value: 0 },
  { name: "车牌", value: 1 },
  /*  { name: "IMSI", value: 2 },
   { name: "IMEI", value: 3 },
   { name: "MAC", value: 4 },
   { name: "手机", value: 5 }, */
  { name: "MMSI", value: 6 },
  { name: "雷达批号", value: 7 },
  { name: "目标ID", value: 8 },
];

/**智慧建模行为记录列表，目标*/
export const dataType: Type<any>[] = [
  { name: "人脸", value: "0" },
  { name: "车牌", value: "1" },
  { name: "IMSI", value: "2" },
  { name: "IMEI", value: "3" },
  { name: "MAC", value: "4" },
  { name: "手机", value: "5" },
  { name: "MMSI", value: "6" },
  { name: "雷达目标", value: "7" },
  { name: "目标ID", value: "8" },
];
export const dataTypeNum: Type<any>[] = [
  { name: "人脸", value: 0 },
  { name: "车牌", value: 1 },
  { name: "IMSI", value: 2 },
  { name: "IMEI", value: 3 },
  { name: "MAC", value: 4 },
  { name: "手机", value: 5 },
  { name: "MMSI", value: 6 },
  { name: "雷达目标", value: 7 },
  { name: "目标ID", value: 8 },
];

// 启动时机
export const startTypeDict: Type<number>[] = [
  { name: '立即启动', value: 1 },
  { name: '进入指定区域启动', value: 2 },
]
/**
 * 配置预案处理方式
 * 1:调用附近摄像机, 2:查看附件车辆, 3:查看附件人员, 4:无人机跟拍, 5:无人船抵近, 6:音柱喊话, 7:通知附近警力, 8:通知值班领导
 * */
export const planDealMethods: Type<number>[] = [
  { value: 1, name: "调用附近摄像机" },
  { value: 2, name: "查看附近车辆" },
  { value: 3, name: "查看附近人员" },
  { value: 4, name: "无人机跟拍" },
  { value: 5, name: "无人船抵近" },
  { value: 6, name: "音柱喊话" },
  { value: 7, name: "通知附近警力" },
  { value: 8, name: "通知值班领导" },
  { value: 9, name: "智能研判" },
];
export const planDealDict: Type<string>[] = [
  { value: "1", name: "视频跟拍" },
  { value: "2", name: "无人机跟拍" },
  { value: "3", name: "喇叭喊话" },
  { value: "4", name: "探照灯跟踪" },
  { value: "5", name: "无人船抵近" },
  { value: "6", name: "派遣警力" },
  { value: "7", name: "派遣专业队" },
];
export const followTypeDict: Type<string>[] = [
  { value: "1", name: "持续跟踪" },
  { value: "2", name: "短暂跟踪" },
];
export const teamTypeDict: Type<number>[] = [
  { value: 1, name: "医疗专业队" },
  { value: 2, name: "消防专业队" },
  { value: 3, name: "环保专业队" },
];
// 无人机
export const noManPlaneDict: Type<number>[] = [
  { value: 1, name: "1号无人机" },
  { value: 2, name: "2号无人机" },
  { value: 3, name: "3号无人机" },
]
// 无人船
export const noManShipDict: Type<number>[] = [
  { value: 1, name: "1号无人船" },
  { value: 2, name: "2号无人船" },
  { value: 3, name: "3号无人船" },
]
// 派遣警力
export const dispatchPolice: Type<number>[] = [
  { value: 1, name: "张三" },
  { value: 2, name: "李四" },
  { value: 3, name: "王五" },
]




/**
 * 预警审批处理类型
 * */
export const warnStatusDict: Type<string>[] = [
  { value: "0", name: "未处理" },
  // { value: "1", name: "处理中" },
  { value: "2", name: "已处理" },
];

/**
 * 车型
 * */
export const carTypeDict: Type<string>[] = [
  { value: "0", name: "大型客车" },
  { value: "1", name: "货车" },
  { value: "2", name: "轿车" },
  { value: "3", name: "面包车" },
  { value: "4", name: "小货车" },
  { value: "5", name: "中型客车" },
  { value: "6", name: "机动车" },
];

/**
 * 车牌颜色
 * */
export const carNumberplateColorDict: Type<string>[] = [
  { value: "0", name: "蓝" },
  { value: "1", name: "绿" },
  { value: "2", name: "黄" },
  { value: "3", name: "白" },
  { value: "4", name: "黑" },
  { value: "5", name: "其它" },
];

/**
 * 车身颜色
 * */
export const carColorDict: Type<string>[] = [
  { value: "0", name: "黑" },
  { value: "1", name: "白" },
  { value: "2", name: "灰" },
  { value: "3", name: "银" },
  { value: "4", name: "黑" },
  { value: "5", name: "红" },
  { value: "6", name: "蓝" },
  { value: "7", name: "深蓝" },
  { value: "8", name: "黄" },
  { value: "9", name: "绿" },
  { value: "10", name: "棕" },
  { value: "11", name: "粉" },
  { value: "12", name: "紫" },
  { value: "13", name: "橙" },
  { value: "14", name: "其它" },
];

// 预警处理意见
export const opinionTypeDict: Type<string>[] = [
  { name: "有警情", value: "01" },
  // { name: "生成任务", value: "02" },
  { name: "无警情", value: "03" },
  { name: '其他', value: "04" }
];

/**
 * 场所类型
 * */
export const placeTypeDict: Type<string>[] = [
  { value: "0", name: "上岸点" },
  { value: "1", name: "油库" },
  { value: "2", name: "水库" },
  { value: "3", name: "关口" },
  { value: "4", name: "港口码头" },
];

/** 用户状态 */
export const userStatusDict: Type<string>[] = [
  { value: "0", name: "启用" },
  { value: "1", name: "停用" },
];

/** 角色状态 */
export const roleStatusDict: Type<string>[] = [
  { value: "0", name: "启用" },
  { value: "1", name: "停用" },
];

/** 菜单类型 */
export const menuTypeDict: Type<string>[] = [
  { value: "M", name: "目录" },
  { value: "C", name: "菜单" },
  { value: "F", name: "按钮" },
];

/** 菜单状态 */
export const menuStatusDict: Type<string>[] = [
  { value: "0", name: "启用" },
  { value: "1", name: "停用" },
];

/** 菜单状态 */
export const deptStatusDict: Type<string>[] = [
  { value: "0", name: "启用" },
  { value: "1", name: "停用" },
];

/** 角色超级管理员类型 */
export const roleAdminDict: Type<boolean>[] = [
  { value: true, name: "是" },
  { value: false, name: "否" },
];

//行为
export const behaviorDict: Type<any>[] = [
  { name: "满足", value: true },
  { name: "不满足", value: false },
];
//处理意见
export const optionApproval: Type<number>[] = [
  { name: "同意", value: 1 },
  { name: "不同意", value: 2 },
  { name: "转审", value: 3 },
];
//操作事项
export const optionOperate: Type<number>[] = [
  { name: "提交申请", value: 1 },
  { name: "处理申请", value: 2 },
];

//模型条件
export const modelConditionDict: Type<number>[] = [
  { name: "未开AIS", value: 0 },
  { name: "超速", value: 1 },
  { name: "怠速", value: 2 },
  { name: "越线", value: 3 },
  { name: "靠岸", value: 4 },
  { name: "...", value: 5 },
];

/** 常规是,否选项,选择仅两个 */
export const commonTFDict: Type<boolean>[] = [
  { value: true, name: "是" },
  { value: false, name: "否" },
];

/** 常规是,否选项 */
export const commonIntIsDict: Type<number>[] = [
  { value: 1, name: "是" },
  { value: 0, name: "否" },
];

/** 常规是,否选项,选择仅两个 */
export const ageRangeDict: Type<string>[] = [
  // { name: "全部", value: "0" },
  { name: "婴幼儿", value: "1" },
  { name: "儿童", value: "2" },
  { name: "少年", value: "3" },
  { name: "青少年", value: "4" },
  { name: "青年", value: "5" },
  { name: "壮年", value: "6" },
  { name: "中年", value: "7" },
  { name: "中老年", value: "8" },
  { name: "老年", value: "9" },
  { name: "未", value: "10" },
];

/** 上衣类型 */
export const clothesTypeDict: Type<string>[] = [
  { name: "短袖", value: "0" },
  { name: "长袖", value: "1" },
  { name: "未知", value: "2" },
];

/** 下装类型 */
export const bottomsTypeDict: Type<string>[] = [
  { name: "短裤", value: "0" },
  { name: "长裤", value: "1" },
  { name: "裙子", value: "2" },
];

/** 方向 */
export const directionDict: Type<string>[] = [
  { name: "上", value: "0" },
  { name: "下", value: "1" },
  { name: "左", value: "2" },
  { name: "右", value: "3" },
  { name: "未知", value: "4" },
];

/** 大小 */
export const sizeDict: Type<string>[] = [
  { name: "大", value: "0" },
  { name: "中", value: "1" },
  { name: "小", value: "2" },
  { name: "未知", value: "3" },
];

/** 头发 */
export const hairTypeDict: Type<string>[] = [
  { name: "短发", value: "0" },
  { name: "长发", value: "1" },
  { name: "未知", value: "2" },
];

/** 背包 */
export const knapsackTypeDict: Type<string>[] = [
  { name: "短发", value: "0" },
  { name: "长发", value: "1" },
  { name: "未知", value: "2" },
];

/** 白名单是否运行建档 */
export const allowDict: Type<boolean>[] = [
  { name: "允许", value: true },
  { name: "不允许", value: false },
];

/** 任务状态 */
export const approvalStatusDesc: Type<number>[] = [
  { name: "待审批", value: 0 },
  { name: "审批通过", value: 1 },
  { name: "审批不通过", value: 2 },
  // { name: "转审批", value: 3 },
];

/** 点位类型 */
export const pointTypeDict: Type<string>[] = [
  { name: "卡口", value: "1" },
  { name: "侦码", value: "2" },
];

/** 案件来源 */
export const caseSourceDict: Type<string>[] = [
  { name: "国保", value: "0" },
  { name: "经侦", value: "1" },
  { name: "治安", value: "2" },
  { name: "边防", value: "3" },
];

/** 专案标识 */
export const caseFlagDict: Type<string>[] = [
  { name: "部级", value: "0" },
  { name: "省市级", value: "1" },
];

/** 案件类别 */
export const caseTypeDict: Type<string>[] = [
  { name: "走私案", value: "0" },
  { name: "偷渡案", value: "1" },
  { name: "涉恐案", value: "2" },
];

/** 操作日志业务类型 */
export const busTypeDict: Type<number>[] = [
  { name: "其它", value: 0 },
  { name: "新增", value: 1 },
  { name: "修改", value: 2 },
  { name: "删除", value: 3 },
];

/** 登录日志状态类型 */
export const loginStatusDict: Type<string>[] = [
  { name: "成功", value: "0" },
  { name: "失败", value: "1" },
];

/**涉案物品*/
export const caseRelationGoodsDict: Type<string>[] = [
  { name: "损失物品", value: "0" },
  { name: "缴获物品", value: "1" },
  { name: "现场遗留物品", value: "2" },
  { name: "可疑物品", value: "3" },
  { name: "其他", value: "4" },
];

/**各省车牌名称*/
export const carLicensePlateDict: Type<number>[] = [
  { name: "粤", value: 0 },
  { name: "港", value: 1 },
  { name: "澳", value: 2 },
  { name: "京", value: 3 },
  { name: "津", value: 4 },
  { name: "沪", value: 5 },
  { name: "渝", value: 6 },
  { name: "蒙", value: 7 },
  { name: "新", value: 8 },
  { name: "藏", value: 9 },
  { name: "宁", value: 10 },
  { name: "桂", value: 11 },
  { name: "黑", value: 12 },
  { name: "吉", value: 13 },
  { name: "辽", value: 14 },
  { name: "晋", value: 15 },
  { name: "冀", value: 16 },
  { name: "青", value: 17 },
  { name: "鲁", value: 18 },
  { name: "豫", value: 19 },
  { name: "苏", value: 20 },
  { name: "皖", value: 21 },
  { name: "浙", value: 22 },
  { name: "闽", value: 23 },
  { name: "赣", value: 24 },
  { name: "湘", value: 25 },
  { name: "鄂", value: 26 },
  { name: "琼", value: 27 },
  { name: "甘", value: 28 },
  { name: "陕", value: 29 },
  { name: "贵", value: 30 },
  { name: "云", value: 31 },
  { name: "川", value: 32 },
];

/**船舶状态*/
export const shipStatusDict: Type<number>[] = [
  { name: "发动机使用中", value: 0 },
  { name: "锚泊", value: 1 },
  { name: "未操纵", value: 2 },
  { name: "有限适航性", value: 3 },
  { name: "受船舶吃水限制", value: 4 },
  { name: "系泊", value: 5 },
  { name: "搁浅", value: 6 },
  { name: "从事捕捞", value: 7 },
  { name: "航行中", value: 8 },
  { name: "载运C类危险品", value: 9 },
  { name: "载运A类危险品", value: 10 },
  { name: "预留状态", value: 11 },
  { name: "预留状态", value: 12 },
  { name: "预留状态", value: 13 },
  { name: "AIS-SART", value: 14 },
  { name: "未规定", value: 15 },
];

/**船舶状态*/
export const shipDataTypeDict: Type<number>[] = [
  { name: "AIS", value: 1 },
  { name: "雷达", value: 2 },
  // { name: "融合", value: 3 },
  // { name: "无AIS及雷达", value: 4 },
];

/**船舶状态*/
export const noticeTypeDict: Type<string>[] = [
  { name: "通知", value: "1" },
  { name: "公告", value: "2" },
];

/**船舶状态*/
export const noticeStatusDict: Type<string>[] = [
  { name: "正常", value: "0" },
  { name: "关闭", value: "1" },
];

/**指挥状态*/
export const taskStatusDict: Type<number>[] = [
  { name: "进行中", value: 1 },
  { name: "待分配", value: 2 },
  { name: "已完成", value: 3 },
];

/**在职状态*/
export const positionStatusDict: Type<number>[] = [
  { name: "在职", value: 1 },
  { name: "离职", value: 2 },
];

/**字典状态*/
export const dictionaryStatusDict: Type<string>[] = [
  { name: "正常", value: "0" },
  { name: "停用", value: "1" },
];
/**设备状态*/
export const deviceStatues: Type<number>[] = [
  { name: "在线", value: 1 },
  { name: "离线", value: 0 }
];

/**预警类型*/
export const warningTypeDict: Type<string>[] = [
  { name: "总计", value: "03,0104,0101,0102,05" },
  { name: "建模预警", value: "03" },
  { name: "船舶布控预警", value: "0104" },
  { name: "人车布控预警", value: "0101,0102" },
  { name: "视频预警", value: "05" },
];

/**布控类型*/
export const controlDataDict: Type<number>[] = [
  { name: "总计", value: -1 },
  { name: "船舶布控", value: 1 },
  { name: "人车布控", value: 2 },
  { name: "场所布控", value: 3 },
  { name: "智慧建模", value: 4 },
  { name: "视频布控", value: 5 },
  { name: "黑名单布控", value: 6 },
];

/**伴随任务，查询结果状态*/
export const followTaskStatusDict: Type<number>[] = [
  { name: "已创建", value: 0 },
  { name: "分析中", value: 1 },
  { name: "已完成", value: 2 },
  { name: "失败", value: 3 },
];

/**专案标识*/
export const caseMarkDict: Type<string>[] = [
  { name: "部级", value: "1" },
  { name: "省市级", value: "2" },
  { name: "地市级", value: "3" },
  { name: "分县局级", value: "4" },
  { name: "其他", value: "5" },
];

/**白名单是否允许就建档*/
export const whiteArchiveDict: Type<number>[] = [
  { name: "不允许", value: 0 },
  { name: "允许", value: 1 },
];
/**黑名单是否允许预警*/
export const BlackArchiveDict: Type<number>[] = [
  { name: "否", value: 0 },
  { name: "是", value: 1 },
];

/**白名单数据类型*/
export const whiteDataDict: Type<string>[] = [
  // { name: "imsi", value: "1" },
  // { name: "imei", value: "2" },
  // { name: "mac", value: "3" },
  { name: "车牌", value: "4" },
  { name: "MMSI", value: "5" },
];

/** 进出港类型 */
export const isEntryDict: Type<number>[] = [
  { name: "进入", value: 0 },
  { name: "离开", value: 1 },
  { name: "未知", value: 2 },
];

/**地图瓦片类型 */
export const mapTileDict: Type<any>[] = [
  {
    name: "地图",
    value: {
      type: MapTileType.street,
      imgSrc: StreetMapImgSrc,
    },
  },
  {
    name: "卫图",
    value: {
      type: MapTileType.satellite,
      imgSrc: SatelliteMapImgSrc,
    },
  },
  {
    name: "海图",
    value: {
      type: MapTileType.sea,
      imgSrc: SeaMapImgSrc,
    },
  },
];

// 风险等级筛选条件
export const userLevelOptions: Type<number>[] = [
  { value: 1, name: "高" },
  { value: 2, name: "中" },
  { value: 3, name: "低" },
];

/** 进展类型 */
export const caseProgressTypeDict: Type<string>[] = [
  { name: "新增进展", value: "0" },
  { name: "结案", value: "1" },
];

/** 数据回放类型 */
export const dataPlayTypeDict: Type<string>[] = [
  { name: "AIS", value: "1" },
  { name: "雷达", value: "2" },
  // { name: "尾迹", value: "0" },
];

/** 智搜人脸特征 */
export const faceSearchDict: Type<number>[] = [
  // { value: -1, name: "全部" },
  { value: 1, name: "是" },
  { value: 0, name: "否" },
];

/** 智搜人脸种族 */
export const faceRaceDict: Type<number>[] = [
  // { value: 0, name: "全部" },
  { value: 1, name: "汉族" },
  { value: 2, name: "维族" },
  { value: 3, name: "白种人" },
  { value: 4, name: "黑种人" },
  { value: 5, name: "未知" },
];

// 进出港
export const isEntryPortDict: Type<number>[] = [
  { name: "出港", value: 0 },
  { name: "进港", value: 1 },
  { name: "未知", value: 2 },
]

/** 房屋类型
 * 市场商品房:住宅、公寓、商铺、写字楼、别墅、厂房
 * 保障性住房:安居房，经济适用房，廉租房，公租房，限价房
 * 小产权房:农民房 自建房 集资房 军产房 福利房 村委房 违建房 历史遗留违法私房
 * 其它：回迁指标房 法拍房 双限双竞房 合作建房
 */
export const houseTypeDict: Type<string>[] = [
  { value: "1", name: "住宅" },
  { value: "2", name: "公寓" },
  { value: "3", name: "别墅" },
  { value: "4", name: "商铺" },
  { value: "5", name: "写字楼" },
  { value: "6", name: "厂房" },
  { value: "7", name: "公租房" },
  { value: "8", name: "安居房" },
  { value: "9", name: "经济适用房" },
  { value: "10", name: "廉租房" },
  { value: "11", name: "限价房" },
  { value: "12", name: "农民房" },
  { value: "13", name: "自建房" },
  { value: "14", name: "集资房" },
  { value: "15", name: "军产房" },
  { value: "16", name: "福利房" },
  { value: "17", name: "村委房" },
  { value: "18", name: "违建房" },
  { value: "19", name: "回迁指标房" },
  { value: "20", name: "法拍房" },
  { value: "21", name: "双限双竞房" },
  { value: "22", name: "合作建房" },
];

/** 虚拟资产类型
 */
export const virtualTypeDict: Type<string>[] = [
  { value: "1", name: "网戏" },
  { value: "2", name: "基金" },
  { value: "3", name: "股票" },
  { value: "4", name: "数字人民币" },
];

/** 伴随轨迹类型 */
export const coincidenceDict: Type<boolean>[] = [
  { value: false, name: "全部" },
  { value: true, name: "共轨" },
];

/** 日期范围类型 */
export const DateRangeDict: Type<number>[] = [
  { value: 1, name: "近一天" },
  { value: 2, name: "近一周" },
  { value: 3, name: "近一个月" },
  { value: 4, name: "近三个月" },
];

/** 日期范围类型 */
export const WarnMoreDateRangeDict: Type<number>[] = [
  { value: 1, name: "近一天" },
  { value: 2, name: "近一周" },
  { value: 3, name: "近一个月" },
  { value: 5, name: "近三个月" },
];

/** 日期范围类型，包含一年 */
export const WarnMoreDateRange2Dict: Type<number>[] = [
  { value: 1, name: "近一天" },
  { value: 2, name: "近一周" },
  { value: 3, name: "近一个月" },
  { value: 5, name: "近三个月" },
  { value: 4, name: "近一年" },
];

/** 日期范围类型 */
export const CollectTypeDict: Type<number>[] = [
  { value: 1, name: "人脸" },
  { value: 2, name: "车辆" },
  { value: 3, name: "AIS" },
  { value: 4, name: "雷达" },
];

/**
 * 预警数据类型
 * */
export const warningDataType: Type<any>[] = [
  { value: "01", name: "人脸" },
  { value: "02", name: "车辆" },
  { value: "03", name: "船舶" },
  { value: "04", name: "侦码" },
];

/** 摄像机类型字典数据 */
export const CameraTypeDict: Type<any>[] = [
  { value: 1, name: "远距离光电" },
  { value: 2, name: "高清激光球机" },
  { value: 3, name: "全景网络摄像机" },
  { value: 4, name: "热成像网络摄像机" },
  { value: 5, name: "高清球机" },
  { value: 6, name: "高清枪机" },
  { value: 7, name: "人脸识别" },
  { value: 8, name: "微卡口单元" },
  { value: 9, name: "卡口" },
  { value: 10, name: "无人机" },
];

/** 摄像机类型字典数据, 包含全部选项 */
export const CameraTypeAllDict: Type<any>[] = [
  { value: 0, name: "全部" },
  { value: 1, name: "远距离光电" },
  { value: 2, name: "高清激光球机" },
  { value: 3, name: "全景网络摄像机" },
  { value: 4, name: "热成像网络摄像机" },
  { value: 5, name: "高清球机" },
  { value: 6, name: "高清枪机" },
  { value: 7, name: "人脸识别" },
  { value: 8, name: "微卡口单元" },
  { value: 9, name: "卡口" },
];

/** 预警通知内容类型字典数据 */
export const WarnContentTypeDict: Type<any>[] = [
  { value: 0, name: "人脸" },
  { value: 1, name: "车牌" },
  { value: 2, name: "IMSI" },
  { value: 3, name: "IMEI" },
  { value: 4, name: "MAC" },
  { value: 5, name: "手机" },
  { value: 6, name: "MMSI" },
  { value: 7, name: "雷达目标" },
  { value: 8, name: "目标ID" },
  { value: 9, name: "视频告警" },
];

/** 预警威胁日期时间统计类型 */
export const WarnDangerDateTypeDict: Type<any>[] = [
  { value: 0, name: "当天" },
  { value: 1, name: "近一天" },
  { value: 2, name: "近一周" },
  { value: 3, name: "近一个月" },
  { value: 5, name: "近三个月" },
  { value: 4, name: "近一年" },
  { value: 6, name: "自定义" },
];

/**任务来源*/
export const taskSourceDict: Type<any>[] = [
  { value: 1, name: "人工新增" },
  { value: 2, name: "预警生成任务" },
  { value: 3, name: "案件生成任务" },
  { value: 4, name: "上级指派" },
];

/** 热力图类型字典数据 */
export const HotTypeDict: Type<number>[] = [
  { value: 1, name: "轨迹" },
  { value: 2, name: "点迹" },
];

/** 热力图数据类型字典数据 */
export const HotDateTypeDict: Type<number>[] = [
  { value: 0, name: "全部" },
  { value: 1, name: "AIS" },
  { value: 2, name: "雷达" },
];

/** 热力图数据类型字典数据 */
export const PlaySpeedDict: Type<number>[] = [
  { value: 0.25, name: "0.25X" },
  { value: 0.5, name: "0.5X" },
  { value: 1, name: "1.0X" },
  { value: 2, name: "2.0X" },
  { value: 4, name: "4.0X" },
  { value: 8, name: "8.0X" },
  { value: 16, name: "16.0X" },
  // { value: 8, name: "8.0X" },
  // { value: 16, name: "16.0X" },

  // { value: 0.125, name: "0.125X" }
];

// 任务反馈进展类型
export const TaskTypeDict = [
  { name: "新增进展", value: 1 },
  { name: "结束任务", value: 2 },
];

// 是否开启短信通知
export const OpenSmsDict = [
  { name: "不开通", value: 0 },
  { name: "开通", value: 1 },
];

/** 关系图谱 */
export const PersonRelationDict: Type<number>[] = [
  { name: "爸爸", value: 1 },
  { name: "妈妈", value: 2 },
  { name: "儿子", value: 3 },
  { name: "女儿", value: 4 },
  { name: "亲戚", value: 5 },
  { name: "同学", value: 6 },
  { name: "战友", value: 7 },
];

/** 关系类型 */
export const RelationTypeDict: Type<number>[] = [
  { name: '伴随关系', value: 1 },
  { name: '亲戚关系', value: 2 },
  { name: '朋友关系', value: 3 },
  { name: '同学关系', value: 4 },
  { name: '同事关系', value: 5 },
  { name: '战友关系', value: 6 },
  { name: '犯罪嫌疑人', value: 7 },
  { name: '抓获人员', value: 8 },
  { name: '拥有', value: 9 },
  { name: '母亲', value: 10 },
  { name: '父亲', value: 11 },
  { name: '儿子', value: 12 },
  { name: '女儿', value: 13 },
  { name: '同船东', value: 14 },
  { name: '同港口', value: 15 },
  { name: '同船队', value: 16 },
  { name: '管理', value: 17 },
  { name: '注册', value: 18 },
  { name: '经营', value: 19 },
  { name: '负责', value: 20 },
  { name: '港口标签', value: 21 },
  { name: '船队队员', value: 22 },
]


/** 船舶布控范围字典 */
export const ControlScopeDict: Type<string>[] = [
  { name: '任意船舶', value: '0' },
  { name: '指定船舶', value: '1' }
]

/** 船舶布控类型字典 */
export const ControlTargetTypeDict: Type<number>[] = [
  { name: 'MMSI', value: 1 },
  { name: '船名', value: 2 },
  { name: '船脸', value: 3 }
]

/** 数据回放是否查看尾迹 */
export const DataPackTrackDict: Type<boolean>[] = [
  { name: '是', value: true },
  { name: '否', value: false }
]

// 布控预警条件
export const CtrlWarnDict: Type<number>[] = [{ name: "出现", value: 3 }];

/** 智搜雷达点迹类型字典 */
export const WisdomSearchRadarTrackStatusDict: Type<number>[] = [
  { name: '采集', value: 0 },
  { name: '外推', value: 1 },
  { name: '起批前', value: 2 }
]

/** 预警风险等级 */
export const WarnLevelDict: Type<number>[] = [
  { name: '高风险', value: 1 },
  { name: '中风险', value: 2 },
  { name: '低风险', value: 3 }
]

/** 情指中心关注船舶类型字典 */
export const shipFocusOptions: Type<string>[] = [
  { name: '一般', value: '4' },
  { name: '关注', value: '3' },
  { name: '重点', value: '2' },
  { name: '黑名单', value: '5' },
]

export const PlaceTypeIconDict: Type<string>[] = [
  { value: '1', name: '港口/码头' },
  { value: '2', name: '水域卡口' },
  { value: '3', name: '涵洞' },
  { value: '4', name: '易登陆点' },
  { value: '5', name: '易跳海点' },
  { value: '6', name: '探照灯' },
  { value: '7', name: '案发地' },
  { value: '8', name: '岗亭' },
  { value: '9', name: '冷库' },
  { value: '10', name: '油库' },
  { value: '11', name: '趸船' },
  { value: '99', name: '其他' },
  { value: '1001', name: '蓝色' },
  { value: '1002', name: '绿色' },
  { value: '1003', name: '浅蓝色' },
  { value: '1004', name: '粉红色' },
  { value: '1005', name: '紫色' },
  { value: '1006', name: '红色' },
  { value: '1007', name: '黄色' },
]

export const PlaceIconSrcDict: Type<string>[] = [
  { value: place1_src, name: '港口/码头' },
  { value: place2_src, name: '水域卡口' },
  { value: place3_src, name: '涵洞' },
  { value: place4_src, name: '易登陆点' },
  { value: place5_src, name: '易跳海点' },
  { value: place6_src, name: '探照灯' },
  { value: place7_src, name: '案发地' },
  { value: place8_src, name: '岗亭' },
  { value: place9_src, name: '冷库' },
  { value: place10_src, name: '油库' },
  { value: place11_src, name: '趸船' },
  { value: place99_src, name: '其他' },
]

export const businessDict: Type<string>[] = [
  { value: '1', name: "视频" },
  { value: '2', name: "视频联动" },
  { value: '3', name: "人脸识别" },
  { value: '4', name: "车辆识别" },
  { value: '5', name: "船舶结构化" },
  { value: '6', name: "视频告警" },
]

/** 船舶档案南山船舶标识 */
export const nanShanDict: Type<any>[] = [
  { value: 4, name: "是" },
  { value: '', name: "否" },
];

/** 设备-海防雷达-关联过滤静态目标范围区域类型 */
export const deviceAreaRelationDict: Type<number>[] = [
  { value: 1, name: "线" },
  { value: 2, name: "圆形" },
  { value: 3, name: "矩形" },
  { value: 4, name: "多边形" },
  { value: 5, name: "航道" }
];

/** 智搜轨迹类型 */
export const trackStatusDict: Type<number>[] = [
  { value: 0, name: "采集" },
  { value: 1, name: "外推" },
  { value: 2, name: "起批前" }
];

/** 船舶图标类型 */
export const shipIconType: Type<number>[] = [
  { value: 1, name: huochuan_g },
  { value: 2, name: jiayouchuan_g },
  { value: 3, name: kechuan_g },
  { value: 4, name: qitachuan_g },
  { value: 5, name: teshuchuan_g },
  { value: 6, name: tuochuan_g },
  { value: 7, name: youting_g },
  { value: 8, name: yuchuan_g },
  { value: 9, name: zuoyechuan_g },
  { value: 10, name: zhifachuan }
]


export const shipTypeIcon: Type<number>[] = [
  // 货船
  { value: 1, name: huochuan_g },
  { value: 2, name: huochuan_o },
  { value: 3, name: huochuan_r },
  { value: 4, name: huochuan_y },
  // 加油船
  { value: 5, name: jiayouchuan_g },
  { value: 6, name: jiayouchuan_o },
  { value: 7, name: jiayouchuan_r },
  { value: 8, name: jiayouchuan_y },
  // 客船
  { value: 9, name: kechuan_g },
  { value: 10, name: kechuan_o },
  { value: 11, name: kechuan_r },
  { value: 12, name: kechuan_y },
  // 其他船
  { value: 13, name: qitachuan_g },
  { value: 14, name: qitachuan_o },
  { value: 15, name: qitachuan_r },
  { value: 16, name: qitachuan_y },
  // 特殊船
  { value: 17, name: teshuchuan_g },
  { value: 18, name: teshuchuan_o },
  { value: 19, name: teshuchuan_r },
  { value: 20, name: teshuchuan_y },
  // 拖船
  { value: 21, name: tuochuan_g },
  { value: 22, name: tuochuan_o },
  { value: 23, name: tuochuan_r },
  { value: 24, name: tuochuan_y },
  // 游艇
  { value: 25, name: youting_g },
  { value: 26, name: youting_o },
  { value: 27, name: youting_r },
  { value: 28, name: youting_y },
  // 渔船
  { value: 29, name: yuchuan_g },
  { value: 30, name: yuchuan_o },
  { value: 31, name: yuchuan_r },
  { value: 32, name: yuchuan_y },
  // 作业船
  { value: 33, name: zuoyechuan_g },
  { value: 34, name: zuoyechuan_o },
  { value: 35, name: zuoyechuan_r },
  { value: 36, name: zuoyechuan_y },
]


/**
 * 通用类型名称回显函数，遍历目标数组中的项，根据键名新增对应的类型名称，
 * 新的类型名称在原有键名加后缀"Name"
 * @param targetList 目标数组，需要回显类型名称的数组
 * @param typeList 类型数组，类型名称与值的数组
 * @param key 目标数组中类型对应的键名
 * @param targetName 目标返回名称
 */
const matching = (
  targetList: any[],
  typeList: Type<any>[],
  key: string,
  targetName?: string
) => {
  const _key = targetName || `${key}Name`;
  targetList.forEach((item: any) => {
    if (_.has(item, key)) {
      const value = _.get(item, key);
      const type = typeList.find((ele) => ele.value === value);
      if (type) {
        _.set(item, _key, type.name);
      } else {
        _.set(item, _key, "");
        console.warn(
          "matching",
          "未能在字典数据中根据值到名称",
          item,
          key,
          typeList
        );
      }
    }
  });
};

/**
 * 功能同matching，key是个数组，或者数组字符串，
 * 新的类型名称在原有键名加后缀"Name"
 * @param original 数据源，API中的data:[{},{}...]
 * @param originalKey 数据源中要转换的项，如type
 * @param originalNewName 数据源存储的转换的值项，如把type:1转换成typeName:类型1，
 * @param originalSplitStr 数据源的转换项的分隔符，转换数据源为数组的分隔符

 * @param target 目标源，要在哪个数据源中转换
 * @param targetItem 目标源中要返回的项值，name:指定返回name字段的值
 *
 */
export const matchingByKeyArray = (props: any) => {
  const {
    original,
    originalKey,
    originalSplitStr = ",",
    originalNewName,
    target,
    targetItem = "name",
  } = props;

  const _key = originalNewName || `${originalKey}Name`;

  let keyArr: any = [];
  if (common.isNull(originalKey)) {
    return;
  }

  original.forEach((item: any) => {
    // 存储每一个转换过的值
    let typeArr: any = [];

    let itemKey = item[originalKey];
    if (itemKey.constructor.name.toLowerCase() === "string") {
      //项类型是字符串
      keyArr = itemKey.split(originalSplitStr); // 分隔项数组
    } else {
      keyArr = itemKey;
    }

    if (_.has(item, originalKey)) {
      keyArr.forEach((tlItem: any) => {
        let tempItem = tlItem;

        // 在字典列表中找值
        const typeVal: any = target.find((ele: any) => ele.value === tempItem);

        if (!common.isNull(typeVal)) {
          typeArr.push(typeVal[targetItem]);
        }
      });

      if (typeArr.length !== 0) {
        _.set(item, _key, typeArr.join(","));
      } else {
        _.set(item, _key, "");
        console.warn(
          "matching",
          "未能在字典数据中根据值到名称",
          item,
          originalKey,
          target
        );
      }
    }
  });
};

/**
 * 功能同matching，dicyValueBy指定将typeList的字典传转成与API数据的值一样的类型
 * 新的类型名称在原有键名加后缀"Name"
 * @param targetList 目标数组，需要回显类型名称的数组
 * @param typeList 类型数组，类型名称与值的数组
 * @param key 目标数组中类型对应的键名
 * @param targetName 目标返回名称
 * @param dicyValueBy 指定类型数组（字典的项）项值的类型转换
 */
export const matchingByConvert = (
  targetList: any[],
  typeList: Type<any>[], // 映射的字典值
  key: string,
  targetName?: string,
  dicyValueBy?: any // 字典的值转换的类型
) => {
  const _key = targetName || `${key}Name`;
  targetList.forEach((item: any) => {
    if (_.has(item, key)) {
      const value = _.get(item, key);
      const type = typeList.find((ele) => {
        let itemVal: any = ele.value;
        if (dicyValueBy) {
          switch (dicyValueBy) {
            case "number":
              //将值转成[number]型
              itemVal = Number(ele.value);
              break;
            case "string":
              //将值转成[string]型
              itemVal = `${ele.value}`;
              break;
            default:
              itemVal = ele.value;
              break;
          }
        }
        return itemVal === value;
      });

      if (type) {
        _.set(item, _key, type.name);
      } else {
        _.set(item, _key, "");
        console.warn(
          "matching",
          "未能在字典数据中根据值到名称",
          item,
          key,
          typeList
        );
      }
    }
  });
};

/**
 * 通用类型名称回显函数，遍历目标对象key，根据键名新增对应的类型名称，
 * 新的类型名称在原有键名加后缀"Name"
 * @param data
 * @param key
 * @param typeList
 * @param targetName
 * @param dicyValueBy 指定类型数组（字典的项）项值的类型转换
 */
export const readDictByConvert = (
  data: any,
  key: string,
  typeList: Type<any>[],
  targetName?: string,
  dicyValueBy?: any // 字典的值转换的类型
) => {
  if (_.has(data, key)) {
    const _key = targetName || `${key}Name`;
    const value = _.get(data, key);
    const type = typeList.find((ele) => {
      let itemVal: any = ele.value;
      if (dicyValueBy) {
        switch (dicyValueBy) {
          case "number":
            //将值转成[number]型
            itemVal = Number(ele.value);
            break;
          case "string":
            //将值转成[string]型
            itemVal = `${ele.value}`;
            break;
          default:
            itemVal = ele.value;
            break;
        }
      }
      return itemVal === value;
    });
    if (type) {
      _.set(data, _key, type.name);
    } else {
      _.set(data, _key, "");
      console.warn(
        "[readDict] 匹配字典数据时:未能找到对应类型的字典数据",
        typeList,
        key,
        data
      );
    }
  } else {
    console.warn(
      "[readDict] 匹配字典数据时:未能在数据体中找到存在的key",
      data,
      key
    );
  }
};

/**
 * 通用类型名称回显函数，遍历目标对象key，根据键名新增对应的类型名称，
 * 新的类型名称在原有键名加后缀"Name"
 * @param data
 * @param key
 * @param typeList
 * @param targetName
 */
export const readDict = (
  data: any,
  key: string,
  typeList: Type<any>[],
  targetName?: string
) => {
  if (_.has(data, key)) {
    const _key = targetName || `${key}Name`;
    const value = _.get(data, key);
    const type = typeList.find((ele) => ele.value === value);
    if (type) {
      _.set(data, _key, type.name);
    } else {
      _.set(data, _key, "");
      console.warn(
        "[readDict] 匹配字典数据时:未能找到对应类型的字典数据",
        typeList,
        key,
        data
      );
    }
  } else {
    console.warn(
      "[readDict] 匹配字典数据时:未能在数据体中找到存在的key",
      data,
      key
    );
  }
};

/**
 * 返回字典值对应的名称
 * @param dict Type<any>[] 字典数据
 * @param value any 字典值
 * @returns 字典值对应的名称
 */
export const getDictName = (dict: Type<any>[], value: any) => {
  const result = dict.find((ele) => ele.value === value);
  if (result) {
    return result.name;
  } else {
    console.warn("字典数据", dict, "无法根据value=", value, "找到对应字典");
    return "";
  }
};

/**
 * 返回字典值对应的名称
 * @param dict Type<any>[] 字典数据
 * @param value any 字典值
 * @returns 字典值对应的名称
 */
export const getDictValue = (dict: Type<any>[], name: string) => {
  const result = dict.find((ele) => ele.name === name);
  if (result) {
    return result.value;
  } else {
    console.warn("字典数据", dict, "无法根据name=", name, "找到对应字典");
    return "";
  }
};

export default matching;

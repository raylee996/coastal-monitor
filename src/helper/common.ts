import { message } from "antd";
import dayjs from "dayjs";
import { YMD, YMDHms } from "helper";
import _ from "lodash";
import moment from "moment";


export const defaultImgCar = require("../images/default/car.jpg");
export const defaultImgPeople = require("../images/default/people.png"); // 默认人员图片
export const defaultImgShip = require("../images/default/ship.png"); // 默认船舶图片

let common = {
  defaultImgShip: defaultImgShip,
  defaultImgPeople: defaultImgPeople,

  requestFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
      de.requestFullscreen();
    }
    // else if (de?.mozRequestFullScreen) {
    //   de?.mozRequestFullScreen();
    // } else if (de?.webkitRequestFullScreen) {
    //   de?.webkitRequestFullScreen();
    // }
  },
  exitFullscreen() {
    var de = document;
    if (de.exitFullscreen) {
      de.exitFullscreen();
    }
    // else if (de.mozCancelFullScreen) {
    //  de.mozCancelFullScreen();
    // } else if (de.webkitCancelFullScreen) {
    //     de.webkitCancelFullScreen();
    // }
  },
  isNull(val?: any) {
    if (_.isNull(val) || _.isUndefined(val) || val === "") {
      return true;
    } else {
      return false;
    }
  },
  /**获取图片数组中的路径 */
  getImgPathStr(params: any) {
    let _this = this;
    //let path = params.valise !== undefined ? params.valise : 'path'
    if (_this.isNull(params) || _this.isNull(params.data)) {
      return "";
    }
    let arr: any = [];
    params.data.forEach((ele: any, index: number) => {
      if (ele.constructor.name.toLowerCase() === "string") {
        arr.push(ele);
      } else {
        arr.push(ele[params.valise]);
      }
    });

    return arr.join(",");
  },
  arrayToString(params: any) {
    let _this = this;
    if (_this.isNull(params)) {
      return "";
    }
    let typeName = params.constructor.name.toLowerCase();
    let result = "";
    if (typeName === "array") {
      result = params.join(",");
    } else if (typeName === "string") {
      result = params;
    }
    return result;
  },
  /** 显示消息 */
  /**
   * @param {any} params 消息参数
   */
  showMessage(params?: any) {
    let _this = this;
    if (_this.isNull(params) || _this.isNull(params.msg)) {
      console.log("不显示消息");
      return;
    }
    switch (params.type) {
      case "success":
        message.success(params.msg);
        break;
      case "error":
        message.error(params.msg);
        break;
      case "warning":
        message.warning(params.msg);
        break;
      case "info":
        message.info(params.msg);
        break;
      default:
        message.info(params.msg);
        break;
    }
  },
  /**去除空格 */
  trimString(str: any, mode?: string) {
    let _this = this;
    let result = "";
    if (_this.isNull(str)) {
      result = "";
    }
    if (_this.isNull(mode)) {
      // 默认去两头
      mode = "head";
    }

    switch (mode) {
      case "all":
        result = str.replace(/\s+/g, "");
        break;
      case "left":
        result = str.replace(/^\s/, "");
        break;
      case "right":
        // right
        result = str.replace(/(\s$)/g, "");
        break;
      case "head":
        // 两头
        result = str.replace(/^\s+|\s+$/g, "");
        break;
      default:
        result = str;
        break;
    }

    return result;
  },
  /** 为字典name-value添加label字段，适配antd组件使用 */
  handleLableOptions(data: { label?: string; name: any; value: any }[]) {
    return data
      .filter(({ label }) => !label)
      .map((item) => ({
        ...item,
        label: item.name,
      }));
  },
};
export default common;

/** 显示消息 */
/**
 * @param {any} params 消息参数
 */
export async function showMessage(params?: any) {
  // if ( isNull(params)) {
  //     console.log("不显示消息")
  //     return
  // }
  switch (params.type) {
    case "success":
      message.success(params.msg);
      break;
    case "error":
      message.error(params.msg);
      break;
    case "warning":
      message.warning(params.msg);
      break;
    case "info":
      message.info(params.msg);
      break;
    default:
      message.info(params.msg);
      break;
  }
}

/**
 * 是否为空
 * @param 传入的值
 * @returns 空:true  非空:false
 */
export async function isNull(val?: any) {
  if (_.isNull(val) || _.isUndefined(val) || val === "") {
    return true;
  } else {
    return false;
  }
}

/**
 * 获取时间
 * @param
 * @returns 空:true  非空:false
 */
export async function getDateStr(days: any, mode?: any) {
  let result = "";
  if (common.isNull(days)) {
    result = moment().subtract(30, "days").format(YMDHms); // 7天前
  }

  return result;
}

/**
 * 将日期范围选择器值转换为开始与结束时间
 * @param {any[]} value 日期范围值
 * @param {any[]} keys 开始与结束时间key
 * @param {any} targetObj 保存到目标对象
 * @param {any} timeFormat 转换的时间格式
 * @returns {any}
 */
export async function changeDatePicker(
  value: any[],
  targetObj: any,
  keys: { startTime: string; endTime: string } = {
    startTime: "startTime",
    endTime: "endTime",
  },
  timeFormat?: string
) {
  if (value) {
    value[0] &&
      (targetObj[keys.startTime] = dayjs(value[0]).format(timeFormat || YMD));
    value[1] &&
      (targetObj[keys.endTime] = dayjs(value[1]).format(timeFormat || YMD));
  }
  return targetObj;
}

/**
 * 过滤字符
 * @param
 * @returns
 */
export function replaceTxt(testStr: any, mode?: any) {
  var resultStr = "";
  resultStr = testStr.replace(/[ ]/g, ""); //去掉【空格】
  resultStr = resultStr.replace(/[\r\n]/g, ""); //去掉【回车】换行
  resultStr = resultStr.replace("，", ","); //去掉中文【，】
  return resultStr;
}

/**
 * 过滤
 * @param 传入的值
 * @returns 空:true  非空:false
 */
export function arrayDifferenceBy(orginal: any, target: any, field: string) {
  let temp: any[] = _.differenceBy(orginal, target, field);
  return temp;
}

/**
 * 过滤已存在的数据项
 * @param 传入的值
 * @returns 空:true  非空:false
 */
export function arrayFilterRepeat(orginal: any, target: any, field: string) {
  let arr: any[] = [];
  if (orginal.length !== 0) {
    let targetLen = target.length;
    let orginalLen = orginal.length;

    for (let i = 0; i < targetLen; i++) {
      let targetItem = target[i];
      let flog = false;
      for (let j = 0; j < orginalLen; j++) {
        let orginalItem = orginal[j];
        if (orginalItem[field] === targetItem[field]) {
          flog = true;
          break;
        }
      }
      if (!flog) {
        arr.push(targetItem);
      }
    }
  } else {
    arr = arr.concat(target);
  }
  return arr;
}

/**
 * 从保存的区域代码取出省市区，区 =>【省，市，区】
 * @param {string} data 区代码
 * 
 */
export function handleAreaCode(data: string) {
  const Municipalities = ['11', '12', '31', '50']
  const province = data.substring(0, 2)
  const city = data.substring(0, 4)
  if (Municipalities.includes(province)) {
    return [province + '0000', data]
  }
  else {
    return [province + '0000', city + '00', data]
  }
}

/** 
 * 判断是否为mmsi、雷达批号、目标id
 * @param {number} str 区代码
 * @returns 空:null  非空:{ shipType: number; shipCode: string }
 */
export function checkShipType(str: string) {
  let res: { shipType: number; shipCode: string } | null = null
  if (/^\d{9}$/.test(str)) {
    res = {
      shipType: 6,
      shipCode: str
    }
  }
  else if (str?.split("_")?.length === 3) {
    res = {
      shipType: 7,
      shipCode: str
    }
  }
  else if (str?.substring(0, 2) === 'F-') {
    res = {
      shipType: 8,
      shipCode: str
    }
  }
  return res
}

/** 
 * 按照船舶类型返回label - MMSI 雷达批号 目标id 
 * @param {number} shipType 船舶类型
 * @returns {string} 船舶类型label
 */
export function getLabelName(shipType: number) {
  const keyToProps: { [key: number]: string } = { 6: 'MMSI', 7: '雷达批号', 8: '目标ID' }
  return keyToProps[shipType] || 'MMSI'
}

// el：需要拖拽的元素
// isDragParent: 拖拽当前元素，直接父元素移动
export class DragElement {
  el: any;
  isDragParent: boolean
  constructor(el: any, isDragParent: boolean) {

    this.isDragParent = isDragParent
    this.el = el;

    this.init();
  }
  Down(e: any) {
    let x = e.offsetX;
    let y = e.offsetY;
    let pageX = e.pageX;
    let pageY = e.pageY
    document.onmousemove = this.Move.bind(this, x, y, pageX, pageY)
  }
  Move(x: number, y: number, pageX: number, pageY: number, e: any) {
    /* console.log(pageX, pageY);
    console.log(e.pageX, e.pageY) */
    // 鼠标按下那一刻不移动
    if (pageX === e.pageX && pageY === e.pageY) {
      return
    }
    if (this.isDragParent) {
      // 移动父组件
      this.el.parentNode.style.left = e.pageX - x + 'px';
      this.el.parentNode.style.top = e.pageY - y + 'px';
    } else {
      this.el.style.left = e.pageX - x + 'px';
      this.el.style.top = e.pageY - y + 'px';
    }
  }
  Up() {
    document.onmousemove = null
  }

  init() {
    this.el.onmousedown = this.Down.bind(this)
    document.onmouseup = this.Up
  }

  clear() {
    document.onmousemove = null
    document.onmouseup = null
  }
}
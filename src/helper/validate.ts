export const validatorIdCard = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value.length === 18 || value.length === 15) {
        if (
          value.length === 18 &&
          !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/.test(
            value
          )
        ) {
          return Promise.reject(new Error("请输入18或15位有效身份证号！"));
        }
        if (
          value.length === 15 &&
          !/^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$/.test(
            value
          )
        ) {
          return Promise.reject(new Error("请输入18或15位有效身份证号！"));
        }
        return Promise.resolve();
      } else {
        return Promise.reject(new Error("请输入18或15位有效身份证号！"));
      }
    } else {
      return Promise.resolve();
    }
  },
};

export const validatorHigt = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value < 0 || value > 300) {
        return Promise.reject(new Error("请输入0~300的安装高度！"));
      }
      if (!/^\d{1,3}$/.test(value)) {
        return Promise.reject(new Error("请输入0~300的安装高度！"));
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  },
};

export const validatorData = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value < 0 || value > 359) {
        return Promise.reject(new Error("请输入0~359的水平视角！"));
      }
      if (!/^\d{1,3}$/.test(value)) {
        return Promise.reject(new Error("请输入0~359的水平视角！"));
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  },
};

export const validatorUserName = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value.length < 3 || value.length > 20) {
        return Promise.reject(new Error("请输入3-20个字符！"));
      }
      if (!/^[a-z_A-Z0-9-.!@)(#$%*+=,<>~:|]{3,20}$/.test(value)) {
        return Promise.reject(
          new Error("请输入3-20个字符的数字字母英文字符！")
        );
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  },
};

export const validatorPassword = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (value.length < 8 || value.length > 20) {
        return Promise.reject(new Error("请输入8-20个字符！"));
      }
      if (!/^[a-z_A-Z0-9-.!@&*)(+=,<>~:|]{8,20}$/.test(value)) {
        return Promise.reject(
          new Error("请输入8-20个字符的数字字母英文字符！")
        );
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
}

/**
 * IMSI
 * @param {*} s
 */
export function isIMSI(s: any) {
  return /^460[0,1,2,3,5,6,7]\d{11}$/g.test(s);
}
/**
 * IMEI
 * @param {*} s
 */
export function isIMEI(s: any) {
  return /^\d{15}$/.test(s);
}
/**
 * MAC
 * @param {*} s
 */
export function isMAC(s: any) {
  return /^[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}$/.test(
    s
  );
}
/**
 * 车牌
 * @param {*} s
 */
export const PLATE_RE = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/

export function isPlate(s: any) {
  return PLATE_RE.test(s)
}

/**
 * 数字
 * @param {*} value
 */
 export const  isNumbers = {
  validator: (rule: any, value: any) => {
    if (value) {
      if (!/^\d{1,20}$/.test(value)) {
        return Promise.reject(
          new Error("请输入数字！")
        );
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  },
}
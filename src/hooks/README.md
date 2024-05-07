# React 公共组件库

本库所需依赖项需要由引用该库的项目，对依赖项、以及其他依赖库做引入


## 依赖(npm下载)

react(v18)、typescript(v4)、sass(v1)、antd(v4)、moment(v2)、lodash(v4)

@ant-design/icons


## 引用库依赖 （script src）

flv.min.js


## 其他依赖

/src/helper/dictionary.ts
export interface Type<T> {
  /** 字典名 */
  name: string;
  /** 字典值 */
  value: T;
}
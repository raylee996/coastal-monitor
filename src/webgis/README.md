# 离线地图服务

本库所需依赖项由引用该库的项目，对依赖项、以及其他依赖库做引入

## 依赖

### leaflet(v1.8.0)

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
        integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
        crossorigin="" />
<script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js"
        integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ=="
        crossorigin=""></script>

声明在 src/global.d.ts，public/index.html 引入。
Leaflet 全局
declare var L:any

### proj4(v2.8.0)

<script src="https://unpkg.com/proj4@2.8.0/dist/proj4-src.js"></script>

### proj4Leaflet(v1.0.2)

<script src="https://unpkg.com/proj4leaflet@1.0.2/src/proj4leaflet.js"></script>

### gcoord(0.3.2)

<script src="https://unpkg.com/gcoord@0.3.2/dist/gcoord.js"></script>

声明在 src/global.d.ts，public/index.html 引入。
一个处理地理坐标系的 JS 库，用来修正百度地图、高德地图及其它互联网地图坐标系不统一的问题
declare var gcoord:any;

## 插件依赖

### 鹰眼图

<link rel="stylesheet" href="https://unpkg.com/leaflet-minimap@3.6.1/dist/Control.MiniMap.min.css">
<script src="https://unpkg.com/leaflet-minimap@3.6.1/dist/Control.MiniMap.min.js" type="text/javascript"></script>

## 本地插件（在 map-project）

## 其他依赖

### pixi(v5.1.3)

<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min.js"></script>

声明在 src/global.d.ts，public/index.html 引入。
PIXI 全局
declare var PIXI: any;

import { Spin } from "antd";
import { useState } from "react";
import { doExportFile } from "server/common";
import styles from "./index.module.sass";

interface iExport {
  /**导出API地址 */
  url: string
  /**导出的条件 */
  extra?: any
  /**其它配置参数 conf={{method:'post'}}*/
  conf?: any
  /**按钮字符 */
  txt?: string
  /**下载文件类型 */
  fileType?: string
  /**下载文件名称 */
  fileName?: string
  /** 获取参数方法 */
  extraFunc?: Function
  /**列表的ref，用于获取查询条件 */
  targetRef?: any
  /** 列表Form */
  targetForm?: any
}

const ExportFile: React.FC<iExport> = ({ url, extra, conf, txt, fileType, fileName, extraFunc, targetRef, targetForm }) => {
  console.debug('ExportFile')
  // 数据定义
  const [exportLoading, setExportLoading] = useState(false)

  // 业务处理
  function handleDownLoadFile(blobData: any) {
    // Blob下载文件
    console.debug("下载文件")

    // 文件名
    const downLoadFileName: any = fileName

    // 2.获取请求返回的response对象中的blob 设置文件类型，这里以excel为例
    let blob = new Blob([blobData.data], {
      type: fileType //"application/vnd.ms-excel",
    });

    // 创建a链接
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = URL.createObjectURL(blob); //生成一个Blob URL
    document.body.appendChild(a);
    a.download = downLoadFileName; //a标签的download属性规定下载文件的名称
    a.click();  //模拟在按钮上的一次鼠标单击

    URL.revokeObjectURL(a.href); // 释放URL 对象
    document.body.removeChild(a);
  }

  // 获取文件
  async function handleDownLoad() {
    let formParams = targetForm?.getFieldsValue() || {} // 获取表单选项值
    let params = {}
    extraFunc && (params = await extraFunc())

    setExportLoading(true)
    const vo = await doExportFile({ url, extra: { ...extra, ...params, ...formParams } }, conf)
    setExportLoading(false)
    handleDownLoadFile(vo)
  }

  return (
    <>
      <Spin spinning={exportLoading}>

        <div className={styles.wapper} onClick={() => { handleDownLoad() }} >
          {txt}
        </div>
      </Spin >
    </>
  )
}


// 组件属性默认值
ExportFile.defaultProps = {
  extra: {},
  txt: '导出',
  fileType: 'application/vnd.ms-excel',
  fileName: `down_file_${new Date().getTime()}`
}

export default ExportFile
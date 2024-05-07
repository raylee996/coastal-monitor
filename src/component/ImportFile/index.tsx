import React, { useState } from "react";
import { Button, message, Upload } from 'antd';
import styles from "./index.module.sass";
import { doExportFile, doImportFile } from "server/common";

interface iImportFile {
  /** 导入模板文件下载API地址 */
  templateUrl?: string
  /** 下载导入模板的参数 */
  templateExtra?: any
  /** 下载导入模板的其它配置参数 */
  templateConf?: any
  /** 导入API */
  api: Function
  /** 导入的条件 */
  extra?: any
  /**其它配置参数 */
  conf?: any
  /**导入按钮字符 */
  uploadTxt?: string
  /** 下载模板文件类型 */
  fileType?: string
  /** 下载模板文件名称 */
  fileName?: string
  /** 导入后更新table方法 */
  refreshTable?: Function
  /** 导入文件名 */
  importFileName?: string
  /** 关闭弹窗 */
  onClosePopup?: any
}

const ImportFile: React.FC<iImportFile> = ({ templateUrl, templateExtra, templateConf, api, extra, conf, uploadTxt, fileType, fileName, refreshTable, importFileName, onClosePopup }) => {
  console.debug('ImportFile')

  const [importLoading, setImportLoading] = useState(false)

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
    // 创建a链接，并模拟点击
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = URL.createObjectURL(blob); //生成一个Blob URL
    document.body.appendChild(a);
    a.download = downLoadFileName; //a标签的download属性规定下载文件的名称
    a.click();  //模拟在按钮上的一次鼠标单击
    // 释放URL 对象
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }

  // 导入文件
  const uploadFile = (options: any) => {
    const { file } = options;
    let formData = new FormData();
    formData.append('file', file)
    doImportFile(api, formData).then(res => {
      refreshTable && refreshTable()
      message.success(res || '导入成功')
      onClosePopup && onClosePopup()
    }).finally(() => {
      console.log("上传完成")
    })
  }

  /**下载模板 */
  async function handleDownLoad() {
    setImportLoading(true)
    const vo = await doExportFile({ url: templateUrl, extra: templateExtra }, templateConf)
    setImportLoading(false)
    handleDownLoadFile(vo)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.warrningTxt}>
        <div className={styles.warrningTxtP}>1.下载导入模板，录入需导入的内容</div>
        <div className={styles.warrningTxtP}>2.上传需导入的文件，完成导入</div>
      </div>

      <div className={styles.boxBtn}>

        <Button className={styles.xcBtn} type="primary"
          loading={importLoading}
          onClick={() => {
            handleDownLoad()
          }}>下载导入模板</Button>


        <Upload
          showUploadList={false}
          customRequest={uploadFile}>
          <Button className={styles.xcBtn} type="primary" >{uploadTxt}</Button>
        </Upload>
      </div>

    </div>
  )
}

// 组件属性默认值
ImportFile.defaultProps = {
  extra: {},
  uploadTxt: '导入',
  fileType: 'application/vnd.ms-excel',// 导入文件类型
  fileName: `down_file_${new Date().getTime()}`,
  importFileName: '导入文件默认名称'
}
export default ImportFile
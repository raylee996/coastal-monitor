
import { PlusCircleOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import MapSelectDeviceList from "component/MapSelectDeviceList";
import StretchBox from "component/StretchBox";
import RealTimeMonitor from "features/Core/components/RealTimeMonitor";
import popup from "hooks/basis/Popup";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { addPlaceDeviceList, doGetPlacesAllDevices, doPlaceDelDevice } from "server/place";
import { setDefaultPresetByPlaceId } from "server/preset";
import styles from "./index.module.sass";

interface IEquipmentList {
  /**场所ID */
  placeId: any
  /**自定义样式 */
  customStyle?: any

  updateDevice?: Function
}
const EquipmentList: React.FC<IEquipmentList> = ({ placeId, customStyle, updateDevice }) => {
  console.debug('EquipmentList')


  const [equimentData, setEquimentData] = useState([])


  const getEquimentData = useCallback(() => {
    (async function () {
      try {
        const vo: any = await doGetPlacesAllDevices({ focusPlaceId: placeId })
        setEquimentData(vo.dataGroupBy || [])
        updateDevice && updateDevice(vo.data)
      } catch (error) {
        setEquimentData([])
      }

    }())
  }, [placeId, updateDevice])

  const handleSetPrecast = useCallback(
    async (presetId: number, device: any) => {
      await setDefaultPresetByPlaceId(placeId, presetId, device)
    },
    [placeId]
  )

  const handlePrecast = useCallback(
    (item: any) => {
      const checkCameraList = [item.deviceCode]
      popup(<RealTimeMonitor
        checkCameraList={checkCameraList}
        placeId={placeId}
        onChangePrecast={handleSetPrecast}
      />, {
        title: '配置预置位',
        size: 'large'
      })
    },
    [handleSetPrecast, placeId]
  )


  useEffect(() => {
    getEquimentData()
  }, [getEquimentData])


  // 设备列表添加事件
  function handleEquipmentRightClose() {
    popup(<MapSelectDeviceList placeId={placeId} onFinish={handleAddEquipment} />, { title: '添加设备', size: "middle" })
  }

  // 选择新设备后
  async function handleAddEquipment(data: any) {
    if (data.length > 0) {
      await addPlaceDeviceList(placeId, data)
      getEquimentData()
    }
  }

  // 确认删除设备后
  async function handleDel(data?: any) {
    await doPlaceDelDevice({
      deviceId: data.id,
      focusPlaceId: placeId
    })
    getEquimentData()
  }


  return (
    <StretchBox
      customStyle={customStyle}
      hasClose={true}
      closeComponent={
        <PlusCircleOutlined />
      }
      onClose={handleEquipmentRightClose}
      headTitle={'设备列表'}
      component={
        <>
          {
            equimentData && equimentData.map((equiItem: any, equiIndex: number) => {
              return (
                <React.Fragment key={'equi_' + equiIndex}>
                  <div className={styles.equipmentBox}>
                    <div className={styles.equiHead}>
                      <span className={styles.headIcon}>
                        {
                          equiItem.cameraType === 0 && <span className={`${styles.cameraType} iconfont icon-shexiangtou`}></span>
                        }
                        {
                          equiItem.cameraType === 1 && <span className={`${styles.cameraType} iconfont icon-shishijiankong`}></span>
                        }
                        {
                          equiItem.cameraType === 2 && <span className={`${styles.cameraType} iconfont icon-shishijiankong`}></span>
                        }
                        {
                          equiItem.cameraType === 3 && <span className={`${styles.cameraType} iconfont icon-shishijiankong`}></span>
                        }
                        {
                          equiItem.cameraType === 4 && <span className={`${styles.cameraType} iconfont icon-shishijiankong`}></span>
                        }
                        {
                          equiItem.cameraType === 5 && <span className={`${styles.cameraType} iconfont icon-shishijiankong`}></span>
                        }
                        {
                          equiItem.cameraType === 6 && <span className={`${styles.cameraType} iconfont icon-hongwaiquanjing`}></span>
                        }
                      </span>
                      <span className={styles.headTxt}>{equiItem.name}</span>
                    </div>
                    <div className={styles.equiContent}>
                      {
                        equiItem.node && equiItem.node.map((subItem: any, subIndex: number) => {
                          return (
                            <div className={styles.equiItemRow} key={'equinode_' + subIndex}>
                              <div className={styles.equiItem} title={subItem.name}>{subItem.name}</div>
                              {equiItem.cameraType !== 0 &&
                                <div className={styles.equiItemBtn} >
                                  <span className={styles.btn} onClick={() => handlePrecast(subItem)}>预置位</span>
                                </div>
                              }
                              <div className={styles.equiItemBtn} >
                                <Popconfirm
                                  title="是否删除该设备?"
                                  placement="bottomRight"
                                  onConfirm={() => {
                                    handleDel(subItem)
                                  }}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <span className={styles.btn}>删除</span>
                                </Popconfirm>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          }
        </>
      }
    />
  )
}

export default EquipmentList

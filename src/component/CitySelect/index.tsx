import { Col, Row } from "antd";
import React, { useEffect, useRef, useState } from "react";
import AreaSelect from "./component/AreaSelect";
import styles from "./index.module.sass";

interface ICitySelect {
  onFinish?: any
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
}

const CitySelect: React.FC<ICitySelect> = (props) => {
  console.debug("CitySelect")
  const { onFinish, onChange } = props

  // REF：城市，区
  const cityRef = useRef<any>(null);
  const districtRef = useRef<any>(null);

  //每个级联的值
  const [provinceCode, setProvinceCode] = useState("")
  const [cityCode, setCiteCode] = useState("")
  const [districtCode, setDistrictCode] = useState("")

  useEffect(() => {
    let result = [provinceCode, cityCode, districtCode].join(',')

    // 返回选择的地区值
    onChange && onChange(result)
    onFinish && onFinish(result)
  }, [provinceCode, cityCode, districtCode, onChange, onFinish])

  // 省下拉
  function handleProvinceChange(data: any) {
    handleProvinceClear()
    setProvinceCode(data)

  }

  function handleProvinceClear(data?: any) {
    if (cityRef.current) {
      cityRef.current.resetOption() //城市清除下拉
      setCiteCode("")
    }
    if (districtRef.current) {
      districtRef.current.resetOption() //城市清除下拉
      setDistrictCode("")
    }
  }

  // 市下拉
  function handleCityChange(data: any) {
    handleCityClear()
    setCiteCode(data)
  }
  function handleCityClear(data?: any) {
    if (districtRef.current) {
      districtRef.current.resetOption() //城市清除下拉
      setDistrictCode("")
    }
  }


  // 区下拉
  function handleDistrictChange(data: any) {
    setDistrictCode(data)
  }

  return (
    <div className={styles.wrapper}>
      <Row gutter={{ xs: 8, sm: 16, md: 24}}>
        <Col className={styles.boxSelect} xs={24} sm={24} md={12} lg={8} >
          <AreaSelect level={1} parentCode={''} onFinish={handleProvinceChange} onClear={handleProvinceClear} />
        </Col>
        <Col className={styles.boxSelect} xs={24} sm={24} md={12} lg={8} >
          <AreaSelect ref={cityRef} level={2} parentCode={provinceCode} onFinish={handleCityChange} onClear={handleCityClear} />
        </Col>
        <Col className={styles.boxSelect} xs={24} sm={24} md={12} lg={8} >
          <AreaSelect level={3} ref={districtRef} parentCode={cityCode} onFinish={handleDistrictChange} />
        </Col>
      </Row>
    </div>
  )
}

CitySelect.defaultProps = {
}

export default CitySelect
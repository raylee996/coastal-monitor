import { uploadFileFormData } from "api/file";
import _ from "lodash";

export async function uploadShipArchiveImg(file: any, formMmsi: string, shipInfo?: any) {
  // businessJson：[{"businessType": "","businessId": ""}, {"businessType": "","businessId": ""}]，businessType取值：12_1（ais档案），12_2（雷达档案），businessId为档案id
  // codeType：船舶号码类型，0.人脸 1.车辆 2.IMSI 3.IMEI 4.MAC 5.手机 6.MMSI 7.雷达批号 8.目标ID
  // codeValue：船舶号码
  let businessJson: any  //编辑才有值
  let codeType: any
  let codeValue: any
  let fusionId: any

  let formData = new FormData();


  if (shipInfo) { //编辑
    if (shipInfo.dataType === 1) {
      // ais
      codeType = 6
      codeValue = shipInfo.mmsi;
      businessJson = [{ businessType: '12_1', businessId: shipInfo.id }]
      fusionId = shipInfo.targetId
    } else {
      // 雷达
      codeType = 7
      codeValue = shipInfo.radarNumber;
      businessJson = [{ businessType: '12_2', businessId: shipInfo.id }]
    }
  } else { //新增
    codeType = 6
    codeValue = formMmsi;
  }


  formData.append("file", file)
  formData.append("isFace", '0');
  businessJson && formData.append("businessJson", JSON.stringify(businessJson));
  codeType && formData.append("codeType", codeType);
  codeValue && formData.append("codeValue", codeValue);
  fusionId && formData.append("fusionId", fusionId);


  const vo = await uploadFileFormData(formData);

  return {
    uid: _.uniqueId(),
    url: vo.url,
    name: vo.name
  };
}
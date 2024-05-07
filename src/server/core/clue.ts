import {PageInfo} from "hooks/integrity/TableInterface";
import {addClue, delClue, editClue, getClueList} from "../../api/core/clue";
import matching, {clueContentDict, clueType} from "../../helper/dictionary";


function filterClueByType(contentArr:any,type:number,label:any){
  let arr:any = [];
  let ship:any = [];
  let man:any = [];
  let car:any = [];
  contentArr.forEach((item:any)=>{
    //无自定义的档案，依据codeType来判断
    if (item.codeType === type && (item.archiveType!==3 && item.archiveType!==0 && item.archiveType!==1)){
      if (item.imageUrl){
        //人脸
        arr.push(item.imageUrl)
      }else if(item.codeValue||item.codeType===0 ){
        arr.push(item.codeValue)
      }
    }else{
      //船舶档案
      if (item.archiveType===3 && (item.archiveKind || item.archiveIds)){
        if (item.archiveKind && item.archiveKind.includes(2)){
          ship.push('重点船舶')
        }
        if (item.archiveKind && item.archiveKind.includes(3)){
          ship.push('关注船舶')
        }
        if (item.archiveKind && item.archiveKind.includes(4)){
          ship.push('一般船舶')
        }
        if (item.archiveIds && item.archiveIds.length>0){
          ship.push(...item.archiveIds)
        }
      }else if (item.archiveType===0 && (item.archiveKind || item.archiveIds)){
      // 人员档案
        if (item.archiveKind && item.archiveKind.includes(2)){
          man.push('重点人员')
        }
        if (item.archiveKind && item.archiveKind.includes(3)){
          man.push('关注人员')
        }
        if (item.archiveKind && item.archiveKind.includes(4)){
          man.push('一般人员')
        }
        if (item.archiveIds && item.archiveIds.length>0){
          man.push(...item.archiveIds)
        }
      }else if (item.archiveType === 1 && (item.archiveKind || item.archiveIds)){
      //  车辆档案
        if (item.archiveKind && item.archiveKind.includes(2)){
          car.push('重点车辆')
        }
        if (item.archiveKind && item.archiveKind.includes(3)){
          car.push('关注车辆')
        }
        if (item.archiveKind && item.archiveKind.includes(4)){
          car.push('一般车辆')
        }
        if (item.archiveIds && item.archiveIds.length>0){
          car.push(...item.archiveIds)
        }
      }
    }
  })
  let result:any = ''

  for (let j = 0; j<contentArr.length; j++){
    if ( contentArr[j].archiveType===3 && type=== 9 && ship.length>0){
      if (!result.includes('船舶档案')){
        result += label+ '*' + ship.join(',')
      }
    }else if(contentArr[j].archiveType===0 && type === 10 && man.length>0){
      if (!result.includes('人员档案')){
        result += label+ '*' + man.join(',')
      }
    }else if (contentArr[j].archiveType===1 && type === 11 && car.length > 0){
      if (!result.includes('车辆档案')){
        result += label+ '*' + car.join(',')
      }
    }else if (arr.length>0){
      result = label +'*' + arr.join(',')
    }
  }
  return result
}
//获取线索列表
export async function getClueListAsync(pageInfo:PageInfo,params?:any){
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params
  };
  const vo = await getClueList(dto)
  const data = vo.records;
  matching(data, clueType, "type","typeName");

  for (let i = 0; i<data.length;i++){
    const contentArr = JSON.parse(data[i].content);
    data[i].parseContent = []
    for (let j = 0; j<clueContentDict.length; j++){
      if (filterClueByType(contentArr,clueContentDict[j].value,clueContentDict[j].name)){
        data[i].parseContent.push(filterClueByType(contentArr,clueContentDict[j].value,clueContentDict[j].name))
      }
    }
  }
  return {
    data: data,
    total: vo.total,
  };
}

//删除线索
export async function delClueAsync(id:any){
  await delClue(id)
}

//新增线索
export async function addClueAsync(params: any) {
  let dto = { ...params }
  await addClue(dto)
}

//编辑线索
export async function editClueAsync(params:any){
  let dto = {...params}
  await editClue(dto)
}

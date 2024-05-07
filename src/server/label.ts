import { addLabelUseResponse, editLabel, delLabel, getLabelList, graphqlLabel } from "api/label";
import common from "helper/common";
import { Type } from "helper/dictionary";


export async function getLabelSelectList() {
  const dto = {
    query: `query ($pageInfo: PageInfo){
          selectList(pageInfo: $pageInfo){
              id
              name
              value
            } 
        }`,
    variables: {
    },
  };
  const res = await graphqlLabel(dto);

  let dict: any[] = [];
  res.data.data.selectList.forEach((item: any) => {
    dict.push({ name: item.name, value: item.value });
  });
  return dict
  // return {
  //   data: res.data.data.selectList,
  //   total: 50,
  // };
}


/**获取标签列表 */
export async function getLabelTable(params: any, signal?: AbortController) {

  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  }

  const vo = await getLabelList(dto, { signal });

  return {
    data: vo.records,
    total: vo.total,
  }
}

export async function getPlaceLabelDict(signal?: AbortController) {

  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: 9
  }

  const vo = await getLabelList(dto, { signal });

  const dict = vo.records.map((item: any) => ({ ...item, name: item.labelName, value: item.id }))

  return dict
}



/**获取标签列表,转成下拉数据 */
export async function getLabelTableWith(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);
  if (res.records.length !== 0) {

    res.records.forEach((element: any) => {
      if (common.isNull(element.label)) {
        element.name = element.labelName
      }

      if (common.isNull(element.value)) {
        element.value = element.id
      }
    })
  }
  return res.records;
}

/**获取标签下拉数据 */
export async function getLabelSelect(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);
  if (params.isFilter) {
    let arr: { name: any; value: any; label: any; }[] = []
    res.records.forEach((item: any, index: number) => {
      if (item.isAuto === "0") {
        arr.push({
          name: item.labelName,
          value: item.id,
          label: item.labelName
        })
      }
    });
    return arr
  } else {
    return res?.records?.length ? res.records.map((item: any) => {
      item.name = item.labelName
      item.label = item.labelName
      item.value = item.id
      return item
    }) : []
  }


  // let arr: any = []
  // if (params.isFilter) {
  //   res.records.forEach((item: any, index: number) => {
  //     if (item.isAuto === "0") {
  //       arr.push({
  //         name: item.labelName,
  //         value: item.id
  //       })
  //     }
  //   });

  // } else {
  //   arr = [
  //     {
  //       label: '自定义标签',
  //       options: [],
  //     },
  //     {
  //       label: '系统标签',
  //       options: [],
  //     }
  //   ]
  //   res.records.forEach((item: any, index: number) => {
  //     if (item.isAuto === "0") {
  //       // 自定义标签
  //       arr[0].options.push({
  //         label: item.labelName,
  //         value: item.id
  //       })
  //     } else {
  //       // 系统标签
  //       arr[1].options.push({
  //         label: item.labelName,
  //         value: item.id,
  //         // disabled: true//系统标签编辑时，仅可查看
  //       })
  //     }
  //   });
  // }

  // return arr
}

// 标签下拉数据
export async function getLabelListSelect(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);
  let arr: any[] = [];
  res.records.forEach((item: any) => {
    arr.push({
      name: item.labelName,
      value: item.id
    })
  });
  return arr
}


/**新增标签 */
export async function doAddLabel(params: any) {
  const dto = {
    ...params
  };

  // const vo = await addLabel(dto);
  const result = await addLabelUseResponse(dto);
  return result
}

/**修改标签 */
export async function doEditLabel(params: any) {
  const dto = {
    ...params
  };

  const vo = await editLabel(dto);
  return vo
}


/**删除标签 */
export async function doDelLabel(params: any) {
  const dto = {
    ...params
  };

  const vo = await delLabel(dto);
  return {
    code: vo.includes('成功') ? 200 : 0,
    msg: vo
  }
}

export async function deletePlaceLabelById(id: number) {
  const dto = {
    id
  }
  await delLabel(dto)
}


/**
 * 获取指定类型所有标签字典数据
 * @param type 标签类型 1人员档案 2车辆档案 3手机档案 4船舶档案 5雷达目标 6船舶布控 7建模风险类别 8案件类别 9场所类型 10人员布控 11便签类别 12预案类别
 * @returns Promise<Type<any>[]>
 */
export async function getLabelDict(type: number): Promise<Type<any>[]> {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type,
    delFlag: 0
  };
  const vo = await getLabelList(dto);

  const dict = vo.records.map((item: any) => {
    return {
      name: item.labelName,
      value: item.id
    }
  }) as Type<any>[]

  return dict;
}
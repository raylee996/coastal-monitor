import { Cascader } from 'antd';
import React, { useEffect, useState } from 'react';
import type { SingleCascaderProps as RcSingleCascaderProps } from 'rc-cascader';
import _ from 'lodash';
import { DefaultOptionType } from 'antd/lib/cascader';
import { ValueType } from 'rc-cascader/lib/Cascader';

type OptionValue = string | number | null;

interface Option extends DefaultOptionType {
  parentValue?: OptionValue
}

interface Props extends Omit<RcSingleCascaderProps, 'onChange' | 'value'> {
  remote: () => Promise<Option[]>
  onChange?: Function
  value?: ValueType
  formlabel?: string
}

/**
 * 当传入的value不是路径数组时，会在树型结构数据里根据children遍历得出完整的路径数组，但这不会触发onChange函数。
 * @param props 组件接口
 * @returns CascaderRemote
 */
const CascaderRemote: React.FC<Props> = props => {
  console.debug("CascaderRemote")

  const { formlabel, value, onChange, remote, ...otherProps } = props

  const [placeholder] = useState<string>(() => formlabel ? `请选择${formlabel}` : "请选择")
  const [options, setOptions] = useState<Option[]>([])
  const [realValue, setRealValue] = useState<ValueType>(doValue(options, value))

  useEffect(() => {
    async function main() {
      if (_.isFunction(remote)) {
        const vo = await remote()
        setOptions(vo)
      }
    }
    main()
  }, [remote])

  useEffect(() => {
    const _realValue = doValue(options, value)
    setRealValue(_realValue)
  }, [value, options])

  function doValue(_options: Option[], _value?: ValueType): ValueType {

    const treeToList = (tree: Option[]) => {
      const list: Option[] = []
      const doIterate = (children: Option[], parentId?: OptionValue) => {
        children.forEach(ele => {
          list.push({
            ...ele,
            parentValue: parentId
          })
          if (ele.children) {
            doIterate(ele.children, ele.value)
          }
        })
      }
      doIterate(tree)
      return list
    }

    const upValue = (val: ValueType, list: Option[]): ValueType => {
      const target = list.find(ele => _.isEqual(ele.value, val))
      if (target && target.value) {
        if (target.parentValue) {
          let result: ValueType = [target.parentValue, target.value]
          const doFind = (_parentValue: OptionValue) => {
            const nodeEle = list.find(ele => _.isEqual(ele.value, _parentValue))
            if (nodeEle && nodeEle.parentValue) {
              result = [nodeEle.parentValue, ...result] as ValueType
              doFind(nodeEle.parentValue)
            }
          }
          doFind(target.parentValue)
          return result
        } else {
          return [target.value]
        }
      } else {
        return val
      }
    }

    if (_.isArray(_value)) {
      return _value
    } else if (_value) {
      const list = treeToList(_options)
      const result = upValue(_value, list)
      return result
    } else {
      return []
    }
  }


  function handleChange(val: any) {
    onChange && onChange(val)
  }

  return <Cascader
    value={realValue}
    onChange={handleChange}
    options={options}
    placeholder={placeholder}
    getPopupContainer={triggerNode => triggerNode}
    {...otherProps} />
};

export default CascaderRemote;
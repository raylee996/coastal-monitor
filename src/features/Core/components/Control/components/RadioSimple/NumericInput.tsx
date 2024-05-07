import { Input, Tooltip } from "antd";

interface NumericInputProps {
  /** 样式 */
  style: React.CSSProperties;
  /** 绑定值 */
  value: string;
  /** 获取change值 */
  onChange: (value: string) => void;
  /** antd input组件原生参数 */
  placeholder?: string
  /** 最大长度 */
  maxLength?: number
  /** 单位 */
  suffix?: string
}

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const NumericInput = (props: NumericInputProps) => {
  const { value, onChange } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue);
    }
  };

  // '.' at the end or only '-' in the input box.
  const handleBlur = () => {
    let valueTemp = value;
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
    onChange(valueTemp.replace(/0*(\d+)/, '$1'));
  };

  const title = value ? (
    <span className="numeric-input-title">{value !== '-' ? formatNumber(Number(value)) : '-'}</span>
  ) : (
    props.placeholder || '请输入'
  );

  return (
    <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
      <Input
        placeholder={'请输入'}
        maxLength={16}
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Tooltip>
  );
};

export default NumericInput
import { Button, Form, Radio, DatePicker, InputNumber, message } from "antd"
import { RangePickerProps } from "antd/es/date-picker";
import { useAppDispatch } from "app/hooks";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useState } from "react";
import { historyTrackLoading, setHistoryTrackLoading } from "slice/coreMapSlice";
import styles from './index.module.sass'
import { useAppSelector } from "app/hooks";
const { RangePicker } = DatePicker;

interface Props {
    searchHisotryTrack?: (params: any, data: any) => void
    name?: string
    data?: any
}

const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
    return current && current > dayjs().endOf('day');
};

const ViewHistoryPane: React.FC<Props> = ({
    searchHisotryTrack,
    name,
    data
}) => {
    console.debug('ViewHistoryPane')

    const [replayDay, setReplayDay] = useState<any>(1);
    const [replayCustomTime, setReplayCustomTime] = useState<any>([null, null]);
    const [form] = Form.useForm();
    const dispatch = useAppDispatch()
    const isLoading = useAppSelector(historyTrackLoading)

    // 默认选中预警轨迹，即显示目标预警前后各半小时的轨迹。
    useEffect(() => {
        form.setFieldsValue({
            replayTime: 1,
            aisDateType: 1,
            isShowTimeLabel: true
        })
    }, [form]);

    function handleSubmit() {
        const [target] = data
        let params = form.getFieldsValue()
        if (params.replayTime === 3 && !replayCustomTime[0]) {
            message.error('自定义时间不能为空')
            return
        }
        if (params.replayTime === 1) {
            // 预警轨迹，前后半小时
            params.customTime = [dayjs(target.warnTime).subtract(0.5, 'hours'), dayjs(target.warnTime).add(0.5, 'hours')]
        } else if (params.replayTime === 2) {
            // 最近replayDay天
            params.customTime = [dayjs().subtract(replayDay, 'day'), dayjs()]
        } else {
            params.customTime = replayCustomTime
        }
        _.unset(params, 'replayCustomTime')
        _.unset(params, 'replayDay')
        _.unset(params, 'replayTime')
        params.isUseOldWin = true
        searchHisotryTrack && searchHisotryTrack(data, params)
        // 请求加载中
        dispatch(setHistoryTrackLoading(true))
    }

    return <>
        <Form
            form={form}
            labelCol={{ span: 2 }}
        >
            <Form.Item label='名称' className={styles.formItem}>
                <div>{name}</div>
            </Form.Item>
            <Form.Item label='回放时间' name='replayTime' className={styles.formItem}>
                <Radio.Group value={1} className={styles.returnTime}>
                    <Radio value={1}>
                        <Form.Item className={styles.formItem}>
                            预警轨迹
                        </Form.Item>
                    </Radio>
                    <Radio value={2}>
                        <Form.Item className={styles.formItem}>
                            近<InputNumber
                                min={0}
                                className={styles.input}
                                defaultValue={1}
                                value={replayDay}
                                onChange={(value) => setReplayDay(value)}
                            />天
                        </Form.Item>
                    </Radio>
                    <Radio value={3}>
                        <Form.Item className={styles.formItem}>
                            自定义
                            <RangePicker
                                disabledDate={disabledDate}
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                className={styles.timeSelect}
                                defaultValue={replayCustomTime}
                                onChange={(value: any) => setReplayCustomTime(value)}
                            />
                        </Form.Item>
                    </Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label='轨迹类型' name='aisDateType' className={styles.formItem}>
                <Radio.Group value={1}>
                    <Radio value={1}>融合轨迹</Radio>
                    <Radio value={0}>AIS轨迹</Radio>
                    <Radio value={2}>雷达轨迹</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label='时间标签' name='isShowTimeLabel' className={styles.formItem}>
                <Radio.Group value={true} onChange={handleSubmit}>
                    <Radio value={true}>显示</Radio>
                    <Radio value={false}>隐藏</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item style={{ display: "flex", justifyContent: 'center' }}>
                <Button type="primary" onClick={handleSubmit} loading={isLoading}> 查看 </Button>
            </Form.Item>
        </Form>
    </>
}

export default ViewHistoryPane
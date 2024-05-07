import { Dayjs } from 'dayjs';


export interface Type<T> {
  /** 字典名 */
  name: string;
  /** 字典值 */
  value: T;
}

export type DayjsType = Dayjs | null

export type DayjsRange = [DayjsType, DayjsType] | null

export type DayjsPair = [Dayjs, Dayjs]

export type DayjsRangeString = [string, string]
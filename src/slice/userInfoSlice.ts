import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { local, remove } from '../helper/storage';


const STORAGE_KEY_NAME = 'USER_INFO'

const _userInfo: Info = local(STORAGE_KEY_NAME)

interface Info {
  /**登录成功返回的token值，ajax默认取requestToken为localStorage的键名 */
  token: string,
  /**登录成功返回的基础用户信息 */
  name: string
  /** 用户菜单树 */
  menuList: any[]
}

interface Value extends Info {
  /** 是否全权限 */
  isAllAuth: boolean
}

interface UserInfoState {
  /**存储用户登录的返回数据，状态初始化的会取localStorage里的缓存值 */
  value: Value
}

const initialState: UserInfoState = {
  value: {
    token: _userInfo ? _userInfo.token : '',
    name: _userInfo ? _userInfo.name : '',
    menuList: _userInfo ? _userInfo.menuList : [],
    isAllAuth: false
  }
};

export const userInfoSlice = createSlice({
  name: STORAGE_KEY_NAME,
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Value>) => {
      state.value = action.payload;
      local(STORAGE_KEY_NAME, action.payload)
    },
    setUserInfo: (state, action: PayloadAction<Info>) => {
      const _value: Value = {
        token: action.payload.token,
        name: action.payload.name,
        menuList: action.payload.menuList,
        isAllAuth: state.value.isAllAuth
      }
      state.value = _value
      local(STORAGE_KEY_NAME, _value)
    },
    clear: (state) => {
      state.value = {
        token: '',
        name: '',
        menuList: [],
        isAllAuth: false
      }
      remove(STORAGE_KEY_NAME)
    },
  }
});

export const { set, clear, setUserInfo } = userInfoSlice.actions;

export const selectValue = (state: RootState) => state.userInfo.value;

export default userInfoSlice.reducer;

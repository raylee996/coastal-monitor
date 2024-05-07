import { useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { selectValue } from "slice/userInfoSlice";

/**
 * 根据菜单名称鉴权是否展示
 * @param authList 菜单名称列表
 * @returns 名称列表对应的鉴权结果
 */
const useAuth = (authList: string[]) => {
  console.debug("useAuth");

  const userInfo = useAppSelector(selectValue);

  const result = useMemo(() => {
    const _result: boolean[] = [];
    authList.forEach((item) => {
      const is =
        userInfo.isAllAuth ||
        userInfo.menuList.some((ele) => ele.menuName === item);
      _result.push(is);
    });
    return _result;
  }, [userInfo, authList]);

  return result;
};

export default useAuth;

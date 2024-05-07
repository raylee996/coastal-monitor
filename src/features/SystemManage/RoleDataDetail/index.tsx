
import { useEffect, useState } from "react"
import { Descriptions, Spin, Tree } from 'antd';
import { getMenuTree, getRoleData } from "server/user";
import matching, { commonIntIsDict, roleStatusDict } from "helper/dictionary";
import styles from "./index.module.sass";


interface Props {
	/** 任务id */
	id: number
}


const RoleDataDetail: React.FC<Props> = ({ id }) => {
	console.debug('RoleDataDetail')

	const [initData, setInitData] = useState<any>()
	const [treeData, setTreeData] = useState<any>([])
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['0-0-0', '0-0-1']);
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);


	useEffect(() => {
		async function main() {
			if (id) {
				const res = await getRoleData(id)
				const tree = await getMenuTree(res.hasApprovePermission)

				matching([res], commonIntIsDict, "hasApprovePermission")
				matching([res], roleStatusDict, "status")
				setInitData(res)
				setTreeData(tree)
				setCheckedKeys(res.menuIds)
			}
		}
		main()
	}, [id])



	const onExpand = (expandedKeysValue: React.Key[]) => {

		setExpandedKeys(expandedKeysValue);
		setAutoExpandParent(false);
	};


	const onSelect = (selectedKeysValue: React.Key[], info: any) => {

		setSelectedKeys(selectedKeysValue);
	};

	return (
		<article className={`${styles.wrapper} workDetail`}>
			<Spin tip="Loading" size="large" spinning={treeData.length ? false : true}>

				<Descriptions bordered size='middle'>
					<Descriptions.Item label="角色名称" span={3}><div >{initData?.roleName || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="角色编码" ><div >{initData?.roleKey || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="角色概述" ><div >{initData?.remark || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="角色排序" ><div >{initData?.roleSort || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="状态" ><div >{initData?.statusName || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="审批权限" span={2}><div >{initData?.hasApprovePermissionName || '--'}</div></Descriptions.Item>
					<Descriptions.Item label="菜单权限" span={3}>
						<div>
							<Tree
								checkable
								onExpand={onExpand}
								expandedKeys={expandedKeys}
								autoExpandParent={autoExpandParent}

								checkedKeys={checkedKeys}
								onSelect={onSelect}
								selectedKeys={selectedKeys}
								treeData={treeData}
							/>
						</div>
					</Descriptions.Item>
				</Descriptions>
			</Spin>
		</article>
	)
}

export default RoleDataDetail
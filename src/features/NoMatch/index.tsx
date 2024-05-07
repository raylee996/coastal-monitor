import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';


const NoMatch: React.FC = () => {

    const navigate = useNavigate();

    function handleClick() {
        navigate('/')
    }

    function handleLogin(){
        navigate('/login')
        localStorage.removeItem('_SYSTEM_USER_INFO')
    }
    return (
        <article>
            <Result
                status="404"
                title="抱歉，你没权限操作，请联系管理员"
                extra={<>
                <Button type="primary" onClick={handleClick}>返回首页</Button>
                <Button type="primary" onClick={handleLogin}>返回登录</Button>
                </>}
            />
        </article>
    );
}

export default NoMatch;

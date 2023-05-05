import { Link, useNavigate }         from "react-router-dom";
import { Layout, Space, Typography }                                 from "antd"
import { TeamOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons"
import { Paths }                                                     from "../../paths";
import styles from "./index.module.css"

import { Button }                   from "../button"
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser }       from "../../features/auth/authSlice";

export const Header = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const onLoginClick = () => {
  }
  
  const onLogoutClick = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate( '/login' );
  }
  
  const onRegisterClick = () => {
  }
  
  return (
    <Layout.Header className={ styles.header }>
      <Space>
        <TeamOutlined className={ styles.teamIcon }/>
        <Link to={ Paths.home }>
          <Button type="ghost">
            <Typography.Title level={ 1 }>
              Employees
            </Typography.Title>
          </Button>
        </Link>
      </Space>
      {
        user ? (
          <Button
            type="ghost"
            icon={ <LogoutOutlined/> }
            onClick={ onLogoutClick }
          >Logout</Button>
        ) : (
          <Space>
            <Link to={ Paths.register }>
              <Button
                type="ghost"
                icon={ <UserOutlined/> }
                onClick={ onRegisterClick }
              >
                Register
              </Button>
            </Link>
            <Link to={ Paths.login }>
              <Button
                type="ghost"
                icon={ <LoginOutlined/> }
                onClick={ onLoginClick }
              >
                Login
              </Button>
            </Link>
          </Space>
        )
      }
    </Layout.Header>
  );
}

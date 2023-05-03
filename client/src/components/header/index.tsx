import { Link }   from "react-router-dom";
import { Layout, Space, Typography } from "antd"
import { TeamOutlined } from "@ant-design/icons"
import { Paths }  from "../../paths";
import styles from "./index.module.css"

import { Button } from "../button"

export const Header = () => {
  return (
    <Layout.Header className={styles.header}>
      <Space>
        <TeamOutlined className={styles.teamIcon} />
        <Link to={ Paths.home }>
          <Button type="ghost">
            <Typography.Title level={ 1 }>
              Employees
            </Typography.Title>
          </Button>
        </Link>
      </Space>
      <Space>
        <Link to={ Paths.register }>
          <Button type="ghost">
            Register
          </Button>
        </Link>
        <Link to={ Paths.login }>
          <Button type="ghost">
            Login
          </Button>
        </Link>
      </Space>
    </Layout.Header>
  )
}

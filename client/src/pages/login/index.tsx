import { Layout }                             from "../../components/layout";
import { Card, Form, Row, Space, Typography } from "antd";
import { Input }                              from "../../components/input";
import { InputPassword }          from "../../components/input-password";
import { Button }                 from "../../components/button";
import { Link }                   from "react-router-dom";
import { Paths }                  from "../../paths";

export const Login = () => {
  return (
    <Layout>
      <Row align="middle" justify="center">
        <Card title="Login" style={ { width: "30rem" } }>
          <Form onFinish={ () => null }>
            <Input type="email" name="email" placeholder="Enter your email"/>
            <InputPassword name="password" placeholder="Enter your password"/>
            <Button type="primary" htmlType="submit" loading={ false }>
              Enter
            </Button>
          </Form>
          <Space direction="vertical" size="large">
            <Typography>
              No account? <Link to={ Paths.register }>Register</Link>
            </Typography>
          </Space>
        </Card>
      </Row>
    </Layout>
  );
}

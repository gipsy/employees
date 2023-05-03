import { Layout }                             from "../../components/layout";
import { Card, Form, Row, Space, Typography } from "antd";
import { Input }                              from "../../components/input";
import { InputPassword }          from "../../components/input-password";
import { Button }                 from "../../components/button";
import { Link }                   from "react-router-dom";
import { Paths }                  from "../../paths";

export const Register = () => {
  return (
    <Layout>
      <Row align="middle" justify="center">
        <Card title="Login" style={ { width: "30rem" } }>
          <Form onFinish={ () => null }>
            <Input name="name" placeholder="Enter your name"/>
            <Input type="email" name="email" placeholder="Enter your email"/>
            <InputPassword name="password" placeholder="Enter your password"/>
            <InputPassword name="confirmPassword" placeholder="Repeat your password"/>
            <Button type="primary" htmlType="submit" loading={ false }>
              Register
            </Button>
          </Form>
          <Space direction="vertical" size="large">
            <Typography>
              Already registered? <Link to={ Paths.login }>Login</Link>
            </Typography>
          </Space>
        </Card>
      </Row>
    </Layout>
  );
}

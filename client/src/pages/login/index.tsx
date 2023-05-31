import { Link, useNavigate }                               from "react-router-dom";
import { Paths }                              from "../../paths";
import { useLoginMutation, UserData }         from "../../app/services/auth";
import { useState }                           from "react";
import { isErrorWithMessage }                 from "../../utils/is-error-with-message";
import { Card, Form, Row, Space, Typography } from "antd";
import { Layout }                             from "../../components/layout";
import { Input }                              from "../../components/input";
import { InputPassword }                      from "../../components/input-password";
import { Button }                             from "../../components/button";
import { ErrorMessage }                       from "../../components/error-message";

export const Login = () => {
  const [loginUser, loginUserResult] = useLoginMutation();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const login = async (data: UserData) => {
    try {
      console.log('userData', data);
      await loginUser(data).unwrap();
      console.log('loginUserResult', loginUserResult)
      navigate('/');
    } catch (err) {
      const maybeError = isErrorWithMessage(err);
      
      if (maybeError) {
        setError(err.data.message);
      } else {
        setError("Not known error");
      }
    }
  }
  
  return (
    <Layout>
      <Row align="middle" justify="center">
        <Card title="Login" style={ { width: "30rem" } }>
          <Form onFinish={ login }>
            <Input type="email" name="email" placeholder="Enter your email"/>
            <InputPassword name="password" placeholder="Enter your password"/>
            <Button type="primary" htmlType="submit" loading={ false }>
              Login
            </Button>
          </Form>
          <Space direction="vertical" size="large">
            <Typography.Text>
              No account? <Link to={ Paths.register }>Register</Link>
            </Typography.Text>
            <ErrorMessage message={ error } />
          </Space>
        </Card>
      </Row>
    </Layout>
  );
}

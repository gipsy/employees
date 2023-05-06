import { Link, useNavigate } from "react-router-dom";
import { Paths }             from "../../paths";
import { useRegisterMutation, UserData }      from "../../app/services/auth";
import { useState }                           from "react";
import { isErrorWithMessage }                 from "../../utils/is-error-with-message";
import { Card, Form, Row, Space, Typography } from "antd";
import { Layout }                             from "../../components/layout";
import { Input }                              from "../../components/input";
import { InputPassword }                      from "../../components/input-password";
import { Button }                             from "../../components/button";
import { ErrorMessage }                       from "../../components/error-message";

export const Register = () => {
  const [registerUser, registerUserResult] = useRegisterMutation();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const register = async (data: UserData) => {
    try {
      await registerUser(data).unwrap();
      navigate('/');
    } catch (err) {
      const maybeError = isErrorWithMessage(err);
      
      if (maybeError) {
        setError(err.data.message);
      } else {
        setError( "Unexpected error" );
      }
    }
  }
  
  return (
    <Layout>
      <Row align="middle" justify="center">
        <Card title="Register" style={ { width: "30rem" } }>
          <Form onFinish={ register }>
            <Input name="name" placeholder="Enter your name"/>
            <Input type="email" name="email" placeholder="Enter your email"/>
            <InputPassword name="password" placeholder="Enter your password"/>
            <InputPassword name="confirmPassword" placeholder="Repeat your password"/>
            <Button type="primary" htmlType="submit" loading={ false }>
              Register
            </Button>
          </Form>
          <Space direction="vertical" size="large">
            <Typography.Text>
              Already registered? <Link to={ Paths.login }>Login</Link>
            </Typography.Text>
            <ErrorMessage message={ error } />
          </Space>
        </Card>
      </Row>
    </Layout>
  );
}

import { Employee }          from "@prisma/client";
import { Card, Form, Space } from "antd";
import { Input }             from "../../components/input";
import { ErrorMessage }      from "../../components/error-message";
import { Button }            from "../../components/button";

type Props<T> = {
  onFinish: (values: T) => void,
  btnText: string,
  title: string,
  error?: string,
  employee?: T
}

export const EmployeeForm = ({
  onFinish,
  title,
  btnText,
  error,
  employee,
}: Props<Employee>) => {
  return (
    <Card
      title={ title }
      style={ { width: '30rem' } }
    >
      <Form
        name="employee-form"
        onFinish={ onFinish }
        initialValues={ employee }
      >
        <Input
          type="text"
          name="firstName"
          placeholder="Name"
        />
        <Input
          type="text"
          name="lastName"
          placeholder="Surname"
        />
        <Input
          type="number"
          name="age"
          placeholder="Age"
        />
        <Input
          type="text"
          name="address"
          placeholder="Address"
        />
        <Space>
          <ErrorMessage message={ error }/>
          <Button htmlType="submit">{ btnText }</Button>
        </Space>
      </Form>
    </Card>
  );
}

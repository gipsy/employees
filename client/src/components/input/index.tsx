import { Form, Input as AntInput } from "antd"

type Props = {
  name: string;
  placeholder: string;
  type?: string;
}

export const Input = ({
  name,
  placeholder,
  type = 'text',
}: Props) => {
  return (
    <Form.Item
      name={name}
      shouldUpdate={true}
      rules={[{required: true, message: 'Field is required'}]}
    >
      <AntInput
        placeholder={placeholder}
        type={type}
        size="large"
      />
    </Form.Item>
  )
}

import React from 'react';
import { Button as AntButton, Form } from "antd";

type Props = {
  children: React.ReactNode;
  htmlType?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  type?: "link" | "text" | "ghost" | "default" | "primary" | "dashed" | undefined;
  danger?: boolean;
  loading?: boolean;
  shape?: "default" | "circle" | "round" | undefined;
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  htmlType = 'button',
  type,
  danger,
  loading,
  shape,
  icon,
  onClick,
}: Props) => {
  return (
    <Form.Item>
      <AntButton
        htmlType={ htmlType }
        type={ type }
        danger={ danger }
        loading={ loading }
        shape={ shape }
        icon={ icon }
        onClick={ onClick }
      >{children}</AntButton>
    </Form.Item>
  )
}

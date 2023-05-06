import { Link, Navigate, useNavigate, useParams }         from "react-router-dom";
import { useState }                                       from "react";
import { useGetEmployeeQuery, useRemoveEmployeeMutation } from "../../app/services/employees";
import { selectUser }                                     from "../../features/auth/authSlice";
import { useSelector }                                    from "react-redux";
import { Descriptions, Divider, Modal, Space }            from "antd";
import { Layout }                                         from "../../components/layout";
import { DeleteOutlined, EditOutlined }                   from "@ant-design/icons";
import { Button }                                         from "../../components/button";
import { ErrorMessage }                                   from "../../components/error-message";
import { Paths }                                          from "../../paths";
import { isErrorWithMessage }                             from "../../utils/is-error-with-message";

export const Employee = () => {
  const navigate = useNavigate();
  const [ error, setError ] = useState( '' );
  const params = useParams();
  const [ isModalOpen, setIsModalOpen ] = useState( false );
  const { data, isLoading } = useGetEmployeeQuery( params.id || "" );
  const [ removeEmployee ] = useRemoveEmployeeMutation();
  const user = useSelector(selectUser);
  
  if (isLoading) {
    return <span>Loading...</span>
  }
  
  if (!data) {
    return <Navigate to='/' />
  }
  
  const showModal = () => {
    setIsModalOpen(true);
  }
  
  const hideModal = () => {
    setIsModalOpen(false);
  }
  
  const handleDeleteUser = async () => {
    hideModal();
    try {
      await removeEmployee(data.id).unwrap();
      
      navigate(`${Paths.status}/deleted`);
    } catch (error) {
      const maybeError = isErrorWithMessage(error);
      
      if (maybeError) {
        setError(error.data.message);
      } else {
        setError('Unexpected error');
      }
    }
  }
  
  return (
    <Layout>
      <Descriptions title="Employee info" bordered>
        <Descriptions.Item label="name" span={ 3 }>
          { `${ data.firstName } ${ data.lastName }` }
        </Descriptions.Item>
        <Descriptions.Item label="age" span={ 3 }>
          { data.age }
        </Descriptions.Item>
        <Descriptions.Item label="address" span={ 3 }>
          { data.address }
        </Descriptions.Item>
      </Descriptions>
      { user?.id === data.userId && (
        <>
          <Divider orientation="left">Actions</Divider>
          <Space>
            <Link to={ `/employee/edit/${ data.id }` }>
              <Button
                type="default"
                shape="round"
                icon={ <EditOutlined/> }
                onClick={ () => null }
              >
                Edit
              </Button>
            </Link>
            <Button
              type="default"
              shape="round"
              icon={ <DeleteOutlined/> }
              danger
              onClick={ showModal }
            >
              Delete
            </Button>
          </Space>
        </>
      ) }
      <ErrorMessage message={ error }/>
      <Modal
        title="Confirm deletion"
        open={ isModalOpen }
        onOk={ handleDeleteUser }
        onCancel={ hideModal }
        okText="Confirm"
        cancelText="Decline"
      >
        Are you sure you want to delete employee from collection?
      </Modal>
    </Layout>
  );
};

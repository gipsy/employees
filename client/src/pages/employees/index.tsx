import { PlusCircleOutlined }      from "@ant-design/icons";
import { Table }                   from "antd";
import { Employee }                from "@prisma/client";
import { ColumnsType }             from "antd/es/table";
import { Button }                  from "../../components/button";
import { Layout }                  from "../../components/layout";
import { useGetAllEmployeesQuery } from "../../app/services/employees";
import { Paths }                   from "../../paths";
import { useNavigate }             from "react-router-dom";
import { useSelector }             from "react-redux";
import { selectUser }              from "../../features/auth/authSlice";
import { useEffect }               from "react";


const COLUMNS: ColumnsType<Employee> = [
  {
    title: 'Name',
    dataIndex: 'firstName',
    key: 'firstName'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
];


export const Employees = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { data, isLoading } = useGetAllEmployeesQuery();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);
  
  return (
    <Layout>
      <Button
        type="primary"
        onClick={ () => null }
        icon={ <PlusCircleOutlined/> }
      >
        Add
      </Button>
      <Table
        loading={ isLoading }
        dataSource={ data }
        pagination={ false }
        columns={ COLUMNS }
        rowKey={ (record) => record.id }
        onRow={ (record) => {
          return { onClick: () => navigate( `${ Paths.employee }/${ record.id }` ) }
        } }
      />
    </Layout>
  );
}

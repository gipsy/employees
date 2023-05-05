import { Layout }                 from "../../components/layout";
import { Row }                    from "antd";
import { EmployeeForm }           from "../../components/employee-form";
import { useEffect, useState }    from "react";
import { useNavigate }            from "react-router-dom";
import { useSelector }            from "react-redux";
import { selectUser }             from "../../features/auth/authSlice";
import { Employee }               from "@prisma/client";
import { Paths }                  from "../../paths";
import { isErrorWithMessage }     from "../../utils/is-error-with-message";
import { useAddEmployeeMutation } from "../../app/services/employees";

export const AddEmployee = () => {
  const [ error, setError ] = useState('');
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [addEmployee] = useAddEmployeeMutation();
  
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  })
  
  const handleAppEmployee = async (data: Employee) => {
      try {
        await addEmployee(data).unwrap();
        
        navigate(`${Paths.status}/created`);
      } catch (err) {
        const maybeError = isErrorWithMessage(err);
        if (maybeError) {
          setError(err.data.message);
        } else {
          setError("Unrecognized error")
        }
      }
  }
  
  return (
    <Layout>
      <Row align="middle" justify="center">
        <EmployeeForm
          title="Add a employee"
          btnText="Add"
          onFinish={ handleAppEmployee }
          error={ error }
        />
      </Row>
    </Layout>
  )
}

import { useRefreshQuery } from "../../app/services/auth";

export const Auth = ({ children }: { children: JSX.Element }) => {
  const { isLoading } = useRefreshQuery();
  
  if (isLoading) {
    return <span>Loading...</span>
  }
  return children
}

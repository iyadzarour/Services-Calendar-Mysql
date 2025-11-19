import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface RouteParams {
  [key: string]: string;
}
interface withRouterProps {
  navigate?: (route: string) => void;
  params?: RouteParams;
}

const withRouter = <P extends object>(Component: React.ComponentType<P>) => {
  const Wrapper: React.FC<P & withRouterProps> = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    return <Component {...props as P} navigate={navigate} params={params} />;
  };

  return Wrapper;
};

export default withRouter;

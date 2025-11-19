import React, { ComponentType, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectProfile } from '../redux/selectors';
import { Spin } from 'antd';
import { RootState } from '../redux/store';

interface AuthorizationProps {}

const checkUserAccess = (profile: any) => {
    if(profile && profile._id){
        return true;
    }
  
    return false

}

const withAuthorization = <P extends AuthorizationProps>(
    Component: ComponentType<P>,
) => {
    const WithAuthorization: React.FC<P> = (props) => {
        const navigate = useNavigate();
        const profile = useSelector((state: RootState) => selectProfile(state));
        const [hasAccess, setHasAccess] = useState<boolean>(false)

        useEffect(() => {
            let profile = null;
            const loginResponse = localStorage.getItem("profile");
            if(loginResponse) profile = JSON.parse(loginResponse);
            const access = checkUserAccess(profile);
            setHasAccess(access)

            if (!access) {
                navigate('/login', { replace: true }); 
            }
        }, [profile])

        return hasAccess ? <Component {...props} /> : <Spin spinning={true} />;
    };

    return WithAuthorization;
};

export default withAuthorization;

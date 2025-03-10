import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
      <Component
        {...props}
        params={params}
        navigate={navigate}
        location={location}
        router={{ 
          params, 
          navigate, 
          location,
          // Add convenience methods
          goBack: () => navigate(-1),
          push: (path) => navigate(path),
          replace: (path) => navigate(path, { replace: true })
        }}
      />
    );
  }

  ComponentWithRouterProp.displayName = `WithRouter(${Component.displayName || Component.name || 'Component'})`;
  
  return ComponentWithRouterProp;
}

export default withRouter;

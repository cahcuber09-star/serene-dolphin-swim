import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to login page as the application starts with authentication
  return <Navigate to="/login" replace />;
};

export default Index;
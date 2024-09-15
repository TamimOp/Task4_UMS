import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Make sure your firebase setup is properly imported

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && !loading) {
        <Navigate to="/login" />;
      }
    });

    return () => unsubscribe();
  }, [loading]);

  if (loading) {
    return <div>Loading...</div>; // Optional loading indicator
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

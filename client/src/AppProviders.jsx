import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserProvider";
import { PostViewerProvider } from "./context/PostViewerContext";

export const AppProviders = ({ children }) => (
  <AuthProvider>
    <UserProvider>
      <PostViewerProvider>
        {children}
      </PostViewerProvider>
    </UserProvider>
  </AuthProvider>
);

import { createContext } from "react";

// Create the Auth Context
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: () => { },
  register: () => { },
  logout: () => { },
});
import { useContext } from "react";
import { AuthContext } from "./AuthContextDefinition";

// Custom hook to use the Auth context
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

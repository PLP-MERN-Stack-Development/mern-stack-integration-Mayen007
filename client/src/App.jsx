import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostList from "./components/PostList";
import SinglePost from "./components/SinglePost";
import Navigation from "./components/Navigation";
import { GlobalProvider } from "./context/GlobalContext";
import CreateEditPostForm from "./components/CreateEditPostForm";

const App = () => {
  // SSO callback redirect component
  const SsoRedirect = () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate("/", { replace: true });
    }, [navigate]);
    return null;
  };
  // Show user info in navigation
  const { user } = useUser();
  return (
    <GlobalProvider>
      <Router>
        <Navigation />
        <div className="flex justify-end items-center p-2">
          <SignedIn>
            <span className="mr-2">
              Hello, {user?.firstName || user?.username || "User"}
            </span>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <Routes>
          <Route path="/sign-in/sso-callback" element={<SsoRedirect />} />
          <Route path="/" element={<PostList />} />
          <Route
            path="/sign-in"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  afterSignInUrl="/"
                />
              </div>
            }
          />
          <Route
            path="/sign-up"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <SignUp routing="path" path="/sign-up" afterSignInUrl="/" />
              </div>
            }
          />
          <Route
            path="/create"
            element={
              <SignedIn>
                <CreateEditPostForm />
              </SignedIn>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <SignedIn>
                <CreateEditPostForm />
              </SignedIn>
            }
          />
        </Routes>
      </Router>
    </GlobalProvider>
  );
};

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostList from "./components/PostList";
import SinglePost from "./components/SinglePost";
import Navigation from "./components/Navigation";
import { GlobalProvider } from "./context/GlobalContext";
import CreateEditPostForm from "./components/CreateEditPostForm";

const App = () => {
  return (
    <GlobalProvider>
      <Router>
        <Navigation />
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
          <Route path="/posts/:id" element={<SinglePost />} />
        </Routes>
      </Router>
    </GlobalProvider>
  );
};

export default App;

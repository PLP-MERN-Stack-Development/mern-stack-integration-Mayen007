import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostList from "./components/PostList";
import SinglePost from "./components/SinglePost";
import Navigation from "./components/Navigation";
import { GlobalProvider } from "./context/GlobalContext";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateEditPostForm from "./components/CreateEditPostForm";

const App = () => {
  return (
    <AuthProvider>
      <GlobalProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateEditPostForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateEditPostForm />
                </ProtectedRoute>
              }
            />
            <Route path="/posts/:id" element={<SinglePost />} />
          </Routes>
        </Router>
      </GlobalProvider>
    </AuthProvider>
  );
};

export default App;

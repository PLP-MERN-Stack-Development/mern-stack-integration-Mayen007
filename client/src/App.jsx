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
          <Route path="/" element={<PostList />} />
          <Route path="/post/:id" element={<SinglePost />} />
          <Route path="/create" element={<CreateEditPostForm />} />
          <Route path="/edit/:id" element={<CreateEditPostForm />} />
        </Routes>
      </Router>
    </GlobalProvider>
  );
};

export default App;

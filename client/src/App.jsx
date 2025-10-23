import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostList from "./components/PostList";
import SinglePost from "./components/SinglePost";
import Navigation from "./components/Navigation";
import { GlobalProvider } from "./context/GlobalContext";
import CreateEditPostForm from "./components/CreateEditPostForm";

const App = () => {
  useEffect(() => {
    // Simulate fetching posts
    const fetchPosts = async () => {
      const response = await fetch("/api/posts");
      const data = await response.json();
      console.log(data); // Debugging fetched data
    };
    fetchPosts();
  }, []);

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

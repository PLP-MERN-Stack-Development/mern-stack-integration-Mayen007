import React, { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContextDefinition";

export const GlobalProvider = ({ children }) => {
  // Optimistic create category
  const createCategory = async (newCategory) => {
    const tempId = `temp-cat-${Date.now()}`;
    const optimisticCategory = { ...newCategory, _id: tempId };
    setCategories((prev) => [...prev, optimisticCategory]);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (!response.ok)
        throw new Error(`Failed to create category: ${response.status}`);
      const createdCategory = await response.json();
      setCategories((prev) =>
        prev.map((c) =>
          c._id === tempId ? createdCategory.data || createdCategory : c
        )
      );
      return { success: true };
    } catch (err) {
      setCategories((prev) => prev.filter((c) => c._id !== tempId));
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Optimistic edit category
  const editCategory = async (id, updatedFields) => {
    const prevCategories = [...categories];
    setCategories((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...updatedFields } : c))
    );
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok)
        throw new Error(`Failed to update category: ${response.status}`);
      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((c) =>
          c._id === id ? updatedCategory.data || updatedCategory : c
        )
      );
      return { success: true };
    } catch (err) {
      setCategories(prevCategories);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch posts
        const postsResponse = await fetch("/api/posts");
        if (!postsResponse.ok) {
          throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
        }
        const postsData = await postsResponse.json();
        setPosts(Array.isArray(postsData) ? postsData : []);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoriesResponse.status}`
          );
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimistic create post
  const createPost = async (newPost) => {
    // Optimistically add post to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticPost = {
      ...newPost,
      _id: tempId,
      author: "You",
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [...prev, optimisticPost]);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!response.ok)
        throw new Error(`Failed to create post: ${response.status}`);
      const createdPost = await response.json();
      setPosts((prev) =>
        prev.map((p) =>
          p._id === tempId ? createdPost.data || createdPost : p
        )
      );
      return { success: true };
    } catch (err) {
      setPosts((prev) => prev.filter((p) => p._id !== tempId));
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Optimistic edit post
  const editPost = async (id, updatedFields) => {
    const prevPosts = [...posts];
    setPosts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...updatedFields } : p))
    );
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok)
        throw new Error(`Failed to update post: ${response.status}`);
      const updatedPost = await response.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? updatedPost.data || updatedPost : p))
      );
      return { success: true };
    } catch (err) {
      setPosts(prevPosts);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Optimistic delete post
  const deletePost = async (id) => {
    const prevPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p._id !== id));
    try {
      const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!response.ok)
        throw new Error(`Failed to delete post: ${response.status}`);
      return { success: true };
    } catch (err) {
      setPosts(prevPosts);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    posts,
    setPosts,
    categories,
    setCategories,
    loading,
    error,
    createPost,
    editPost,
    deletePost,
    createCategory,
    editCategory,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

import React, { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContextDefinition";
import { postService, categoryService } from "../services/api";

export const GlobalProvider = ({ children }) => {
  // Optimistic create category
  const createCategory = async (newCategory) => {
    const tempId = `temp-cat-${Date.now()}`;
    const optimisticCategory = { ...newCategory, _id: tempId };
    setCategories((prev) => [...prev, optimisticCategory]);
    try {
      const result = await categoryService.createCategory(newCategory);
      const createdCategory = result.data || result;
      setCategories((prev) =>
        prev.map((c) => (c._id === tempId ? createdCategory : c))
      );
      return { success: true };
    } catch (err) {
      setCategories((prev) => prev.filter((c) => c._id !== tempId));
      setError(err.message || "Failed to create category");
      return {
        success: false,
        error: err.message || "Failed to create category",
      };
    }
  };

  // Optimistic edit category (note: this function isn't implemented in categoryService)
  const editCategory = async (id, updatedFields) => {
    const prevCategories = [...categories];
    setCategories((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...updatedFields } : c))
    );
    try {
      // For now, keeping the direct fetch since updateCategory isn't in categoryService
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
      setError(err.message || "Failed to update category");
      return {
        success: false,
        error: err.message || "Failed to update category",
      };
    }
  };
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage] = useState(10);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch posts and categories in parallel
        const [postsResponse, categoriesData] = await Promise.all([
          postService.getAllPosts(currentPage, postsPerPage, selectedCategory),
          categoryService.getAllCategories(),
        ]);

        // Handle new pagination response format
        if (postsResponse.posts && postsResponse.pagination) {
          setPosts(
            Array.isArray(postsResponse.posts) ? postsResponse.posts : []
          );
          setTotalPages(postsResponse.pagination.totalPages || 1);
          setTotalPosts(postsResponse.pagination.totalPosts || 0);
        } else {
          // Fallback for old format
          setPosts(Array.isArray(postsResponse) ? postsResponse : []);
        }

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, postsPerPage, selectedCategory]);

  // Optimistic create post
  const createPost = async (newPost) => {
    console.log("Creating post with data:", newPost);
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
      const result = await postService.createPost(newPost);
      const createdPost = result.data || result;
      setPosts((prev) => prev.map((p) => (p._id === tempId ? createdPost : p)));
      // Reset to first page to show the new post
      resetPagination();
      return { success: true };
    } catch (err) {
      setPosts((prev) => prev.filter((p) => p._id !== tempId));
      setError(err.message || "Failed to create post");
      return { success: false, error: err.message || "Failed to create post" };
    }
  };

  // Optimistic edit post
  const editPost = async (id, updatedFields) => {
    const prevPosts = [...posts];
    setPosts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...updatedFields } : p))
    );
    try {
      const result = await postService.updatePost(id, updatedFields);
      const updatedPost = result.data || result;
      setPosts((prev) => prev.map((p) => (p._id === id ? updatedPost : p)));
      return { success: true };
    } catch (err) {
      setPosts(prevPosts);
      setError(err.message || "Failed to update post");
      return { success: false, error: err.message || "Failed to update post" };
    }
  };

  // Optimistic delete post
  const deletePost = async (id) => {
    const prevPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p._id !== id));
    try {
      await postService.deletePost(id);
      return { success: true };
    } catch (err) {
      setPosts(prevPosts);
      setError(err.message || "Failed to delete post");
      return { success: false, error: err.message || "Failed to delete post" };
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Search functions
  const searchPosts = async (query) => {
    if (!query || query.trim().length === 0) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setSearchQuery(query.trim());
    setIsSearchMode(true);
    setCurrentPage(1); // Reset to first page for search results

    try {
      const response = await postService.searchPosts(query.trim());
      if (response.posts && response.pagination) {
        setPosts(Array.isArray(response.posts) ? response.posts : []);
        setTotalPages(response.pagination.totalPages || 1);
        setTotalPosts(response.pagination.totalPosts || 0);
      } else {
        setPosts([]);
        setTotalPages(1);
        setTotalPosts(0);
      }
    } catch (err) {
      setError(err.message || "Search failed");
      setPosts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentPage(1);
    // Trigger a refetch of all posts
    window.location.reload(); // Simple way to reset, or we could call fetchData
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
    // Pagination
    currentPage,
    totalPages,
    totalPosts,
    postsPerPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination,
    // Search
    searchQuery,
    setSearchQuery,
    isSearching,
    isSearchMode,
    searchPosts,
    clearSearch,
    // Category filtering
    selectedCategory,
    setSelectedCategory,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

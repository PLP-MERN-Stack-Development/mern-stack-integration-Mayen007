import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalContext } from "../context/GlobalContext";

const CreateEditPostForm = () => {
  const { posts, setPosts } = useGlobalContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const postToEdit = posts.find((post) => post._id === id);
      if (postToEdit) {
        setTitle(postToEdit.title);
        setContent(postToEdit.content);
        setIsEditing(true);
      }
    }
  }, [id, posts]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPost = { title, content };

    if (isEditing) {
      // Update existing post
      const updatedPosts = posts.map((post) =>
        post._id === id ? { ...post, ...newPost } : post
      );
      setPosts(updatedPosts);
      // Simulate API call
      await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
    } else {
      // Create new post
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      const createdPost = await response.json();
      setPosts([...posts, createdPost]);
    }

    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? "Edit Post" : "Create Post"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows="5"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreateEditPostForm;

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../context/useGlobalContext";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";

export default function SinglePost() {
  const { id } = useParams();
  const { deletePost } = useGlobalContext();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.status}`);
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block"
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <p className="text-gray-600">Post not found.</p>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block"
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
      <Link
        to="/"
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-block"
      >
        ← Back to Posts
      </Link>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{post.title}</h1>
      <div className="flex items-center mb-4">
        <img
          src={post.authorAvatar || "https://i.pravatar.cc/40"}
          alt={post.author}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="text-sm font-semibold text-gray-700">{post.author}</p>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}
      <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
      <div className="mt-6 flex gap-2">
        <button
          className={`py-2 px-4 rounded-md text-white font-medium bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition ${
            deleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={deleting}
          onClick={async () => {
            setDeleteError(null);
            setDeleting(true);
            const result = await deletePost(post._id);
            if (result.success) {
              navigate("/");
            } else {
              setDeleteError(result.error);
            }
            setDeleting(false);
          }}
        >
          {deleting ? "Deleting..." : "Delete Post"}
        </button>
        {deleteError && (
          <span className="text-red-600 ml-2">{deleteError}</span>
        )}
      </div>
    </div>
  );
}

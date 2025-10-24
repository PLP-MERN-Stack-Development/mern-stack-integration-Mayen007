import React from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";

const PostList = () => {
  const { posts, loading, error } = useGlobalContext();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
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
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">No posts available.</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Posts</h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post._id}
            className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Link to={`/post/${post._id}`} className="hover:text-indigo-600">
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            </Link>
            <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>
            <div className="flex justify-between items-center">
              <small className="text-gray-500">By {post.author}</small>
              <Link
                to={`/post/${post._id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Read More →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostList;

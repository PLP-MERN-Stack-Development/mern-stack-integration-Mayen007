import React from "react";

export default function SinglePost({ post }) {
  if (!post) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading post...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
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
    </div>
  );
}

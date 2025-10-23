import React from "react";

const Post = ({ posts }) => {
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
            className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <small className="text-gray-500">By {post.author}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Post;

import React from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import { getImageUrl } from "../services/api";
import useAuth from "../context/useAuth";

const PostList = () => {
  const {
    posts,
    loading,
    error,
    deletePost,
    currentPage,
    totalPages,
    totalPosts,
    goToPage,
    goToNextPage,
    goToPrevPage,
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
    categories,
  } = useGlobalContext();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);

  // Check if current user can delete this post
  const canDeletePost = (post) => {
    if (!user || !post) return false;
    const postAuthorId =
      typeof post.author === "object" ? post.author._id : post.author;
    return user._id === postAuthorId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
              <div className="absolute top-0 left-0 inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">
              Loading amazing posts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Something went wrong
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="text-center">
            <svg
              className="mx-auto h-24 w-24 text-slate-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 24c4.21 0 7.863 2.602 9.288 6.286"
              />
            </svg>
            <h3 className="text-xl font-medium text-slate-700 mb-2">
              No posts yet
            </h3>
            <p className="text-slate-500 mb-6">
              Be the first to share something amazing!
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your First Post
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Latest Posts
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover amazing stories, insights, and ideas from our community
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {deleteError && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Delete Error
                </h3>
                <p className="mt-1 text-sm text-red-700">{deleteError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Section */}
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="category-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Category
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    setSelectedCategory(value);
                    // Clear search when category filter is applied
                    if (value && isSearchMode) {
                      clearSearch();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCategory && (
                <div className="flex items-end">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  searchPosts(searchQuery.trim());
                  // Clear category filter when search is performed
                  if (selectedCategory) {
                    setSelectedCategory(null);
                  }
                }
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts by title or content..."
                  className="w-full px-4 py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  disabled={isSearching}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
              >
                {isSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  "Search"
                )}
              </button>
              {isSearchMode && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                >
                  Clear
                </button>
              )}
            </form>
            {isSearchMode && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                Showing search results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post._id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              {/* Post Header */}
              <div className="h-48 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                {post.featuredImage &&
                post.featuredImage !== "default-post.jpg" ? (
                  <img
                    src={getImageUrl(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h2 className="text-white text-xl font-bold px-6 text-center line-clamp-3">
                        {post.title}
                      </h2>
                    </div>
                  </>
                )}
                {/* Featured badge for first post */}
                {index === 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                      ⭐ Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="p-6">
                <Link
                  to={`/posts/${post._id}`}
                  className="block group-hover:text-blue-600 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {typeof post.author === "object" && post.author.name
                          ? post.author.name.charAt(0).toUpperCase()
                          : typeof post.author === "string"
                          ? post.author.charAt(0).toUpperCase()
                          : "A"}
                      </span>
                    </div>
                    <span>
                      By{" "}
                      {typeof post.author === "object" && post.author.name
                        ? post.author.name
                        : post.author || "Anonymous"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {post.createdAt &&
                      new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Link
                    to={`/posts/${post._id}`}
                    className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Read More
                    <svg
                      className="ml-2 -mr-1 w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>

                  {canDeletePost(post) && (
                    <button
                      className={`inline-flex items-center px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 rounded-lg transition-all duration-200 ${
                        deletingId === post._id
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:-translate-y-0.5"
                      }`}
                      disabled={deletingId === post._id}
                      onClick={async () => {
                        setDeleteError(null);
                        setDeletingId(post._id);
                        const result = await deletePost(post._id);
                        if (!result.success) setDeleteError(result.error);
                        setDeletingId(null);
                      }}
                      title="Delete post"
                    >
                      {deletingId === post._id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 px-4">
            <div className="text-sm text-slate-600">
              Showing {posts.length} of {totalPosts} posts
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            to="/create"
            className="inline-flex items-center px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Post
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostList;

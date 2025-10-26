import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../context/useGlobalContext";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { postService, getImageUrl } from "../services/api";
import useAuth from "../context/useAuth";

export default function SinglePost() {
  const { id } = useParams();
  const { deletePost } = useGlobalContext();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Check if current user can edit/delete this post
  const canModifyPost = () => {
    if (!isAuthenticated || !user || !post) return false;
    const postAuthorId =
      typeof post.author === "object" ? post.author._id : post.author;
    return user._id === postAuthorId;
  };

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsUnauthorized(false);

        const data = await postService.getPost(id);
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);

        if (err.response && err.response.status === 403) {
          setIsUnauthorized(true);
          setError("This post is not available. It may be a draft or private.");
        } else if (err.response && err.response.status === 404) {
          setError("Post not found. It may have been deleted or moved.");
        } else {
          setError(err.message || "Failed to load post");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  // Fetch comments when post is loaded
  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return;

      try {
        setCommentsLoading(true);
        setCommentsError(null);
        const commentsData = await postService.getComments(post._id);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setCommentsError("Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [post]);

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const result = await postService.addComment(post._id, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, result.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentsError("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
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
            <p className="mt-6 text-slate-600 font-medium">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors duration-200"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Posts
          </Link>
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
                  {isUnauthorized ? "Access Denied" : "Error loading post"}
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                {isUnauthorized && !isAuthenticated && (
                  <p className="mt-2 text-sm text-red-600">
                    <Link to="/login" className="underline hover:text-red-800">
                      Sign in
                    </Link>{" "}
                    to access this content, or it may be a private draft.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors duration-200"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Posts
          </Link>
          <div className="bg-white rounded-xl shadow-lg p-12">
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
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">
              Post not found
            </h3>
            <p className="text-slate-500">
              The post you're looking for doesn't exist or may have been
              removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Posts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {typeof post.author === "object" && post.author.name
                    ? post.author.name.charAt(0).toUpperCase()
                    : typeof post.author === "string"
                    ? post.author.charAt(0).toUpperCase()
                    : "A"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {typeof post.author === "object" && post.author.name
                    ? post.author.name
                    : post.author || "Anonymous Author"}
                </h3>
                <p className="text-slate-300 text-sm">
                  Published on{" "}
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown date"}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image (if exists) */}
          {post.featuredImage && post.featuredImage !== "default-post.jpg" && (
            <div className="h-96 overflow-hidden">
              <img
                src={getImageUrl(post.featuredImage)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Tags (if any) */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-500 mb-3">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canModifyPost() && (
              <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4">
                <Link
                  to={`/edit/${post._id}`}
                  className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Post
                </Link>

                <button
                  className={`inline-flex items-center px-6 py-3 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ${
                    deleting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:-translate-y-0.5"
                  }`}
                  disabled={deleting}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this post? This action cannot be undone."
                      )
                    ) {
                      setDeleteError(null);
                      setDeleting(true);
                      const result = await deletePost(post._id);
                      if (result.success) {
                        navigate("/");
                      } else {
                        setDeleteError(result.error);
                      }
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700"
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
                        className="w-4 h-4 mr-2"
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
                      Delete Post
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Delete Error */}
            {deleteError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
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
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="animate-pulse flex flex-col space-y-4">
                <div className="h-12 bg-slate-100 rounded-lg"></div>
                <div className="h-12 bg-slate-100 rounded-lg"></div>
                <div className="h-12 bg-slate-100 rounded-lg"></div>
              </div>
            ) : commentsError ? (
              <div className="text-red-500 text-sm">{commentsError}</div>
            ) : comments.length === 0 ? (
              <div className="text-slate-500 text-sm italic">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 bg-slate-50 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {comment.user?.name
                          ? comment.user.name.charAt(0).toUpperCase()
                          : "A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {comment.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-700 text-sm leading-relaxed">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Add a Comment
              </h3>
              <form
                onSubmit={handleAddComment}
                className="flex flex-col sm:flex-row gap-4"
              >
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Write your comment here..."
                  required
                ></textarea>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  ) : (
                    "Submit Comment"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-slate-600">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>{" "}
                to leave a comment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

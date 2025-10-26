import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import { getImageUrl } from "../services/api";

const CreateEditPostForm = () => {
  const { posts, categories, createPost, editPost, loading } =
    useGlobalContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const postToEdit = posts.find((post) => post._id === id);
      if (postToEdit) {
        setTitle(postToEdit.title);
        setContent(postToEdit.content);
        setCategoryId(postToEdit.category?._id || postToEdit.category || "");
        setExcerpt(postToEdit.excerpt || "");
        setTags(postToEdit.tags ? postToEdit.tags.join(", ") : "");
        setFeaturedImage(postToEdit.featuredImage || null);
        setIsPublished(postToEdit.isPublished || false);
        setIsEditing(true);
      }
    } else if (categories && categories.length > 0) {
      setCategoryId(categories[0]._id);
    }
  }, [id, posts, categories]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    if (!categoryId) {
      newErrors.category = "Category is required";
    }

    if (excerpt.trim().length > 200) {
      newErrors.excerpt = "Excerpt cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    // Generate slug from title
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    // Process tags
    const processedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("excerpt", excerpt.trim());
    formData.append("tags", processedTags.join(","));
    formData.append("slug", slug);
    formData.append("category", categoryId);
    formData.append("isPublished", isPublished.toString());
    if (featuredImage) {
      console.log("Featured image before appending:", featuredImage);
      formData.append("featuredImage", featuredImage);
    }

    setIsSubmitting(true);
    let result;
    if (isEditing) {
      result = await editPost(id, formData);
    } else {
      result = await createPost(formData);
    }
    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } else {
      setSubmitError(result.error || "Unknown error");
    }
    setIsSubmitting(false);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center text-slate-300 hover:text-white mb-8 transition-colors duration-200 group"
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-lienar-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isEditing ? "Edit Post" : "Create New Post"}
          </h1>
          <p className="text-xl text-slate-300">
            {isEditing
              ? "Update your post with new content"
              : "Share your thoughts with the world"}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg shadow-sm">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      {isEditing ? "Post updated" : "Post created"}{" "}
                      successfully. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
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
                    <h3 className="text-sm font-medium text-red-800">Error!</h3>
                    <p className="mt-1 text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.title
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter an engaging title for your post..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category and Excerpt Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors.category
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  >
                    <option value="" disabled>
                      Select a category...
                    </option>
                    {categories &&
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Excerpt <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors.excerpt
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                    placeholder="Brief description..."
                  />
                  {errors.excerpt && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.excerpt}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags Field */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Tags <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="tag1, tag2, tag3..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate tags with commas
                </p>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-semibold text-slate-700"
                >
                  Publish this post
                  <span className="text-slate-400 font-normal ml-2">
                    (Unchecked posts are saved as drafts)
                  </span>
                </label>
              </div>

              {/* Featured Image Field */}
              <div className="mb-6">
                <label
                  htmlFor="featuredImage"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Featured Image
                </label>
                <input
                  type="file"
                  id="featuredImage"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  onChange={(e) => setFeaturedImage(e.target.files[0])}
                  accept="image/*"
                />
                {featuredImage && (
                  <>
                    {typeof featuredImage === "string" ? (
                      <div className="mt-2">
                        <p className="text-sm text-slate-500 mb-2">
                          Current image: {featuredImage.split("/").pop()}
                        </p>
                        <img
                          src={getImageUrl(featuredImage)}
                          alt="Current featured image"
                          className="w-32 h-32 object-cover rounded-md border border-slate-300"
                        />
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-slate-500 mb-2">
                          New image selected: {featuredImage.name}
                        </p>
                        <img
                          src={URL.createObjectURL(featuredImage)}
                          alt="New featured image"
                          className="w-32 h-32 object-cover rounded-md border border-slate-300"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Content Field */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${
                    errors.content
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                  rows="12"
                  placeholder="Write your post content here... Share your thoughts, experiences, or insights with the community."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.content}
                  </p>
                )}
                <div className="mt-2 text-xs text-slate-500">
                  {content.length} characters
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 inline-flex items-center justify-center px-6 py-4 text-white font-semibold rounded-lg transition-all duration-200 ${
                    isSubmitting
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      {isEditing ? "Updating..." : "Publishing..."}
                    </>
                  ) : (
                    <>
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
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      {isEditing ? "Update Post" : "Publish Post"}
                    </>
                  )}
                </button>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPostForm;

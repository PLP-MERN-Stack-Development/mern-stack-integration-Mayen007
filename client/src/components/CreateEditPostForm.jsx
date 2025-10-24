import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import { useUser } from "@clerk/clerk-react";

const CreateEditPostForm = () => {
  const { user } = useUser();
  const { posts, categories, createPost, editPost } = useGlobalContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
        setCategoryId(postToEdit.category || "");
        setIsEditing(true);
      }
    } else if (categories.length > 0) {
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
    // Use Clerk user ID as author
    const author = user?.id || "000000000000000000000001";
    const newPost = {
      title: title.trim(),
      content: content.trim(),
      slug,
      author,
      category: categoryId,
    };
    setIsSubmitting(true);
    let result;
    if (isEditing) {
      result = await editPost(id, newPost);
    } else {
      result = await createPost(newPost);
    }
    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } else {
      setSubmitError(result.error || "Unknown error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? "Edit Post" : "Create Post"}
      </h2>

      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">
            {isEditing ? "Post updated" : "Post created"} successfully.
            Redirecting...
          </span>
        </div>
      )}

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}

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
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter post title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
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
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
            rows="8"
            placeholder="Enter post content..."
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSubmitting
            ? "Submitting..."
            : isEditing
            ? "Update Post"
            : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreateEditPostForm;

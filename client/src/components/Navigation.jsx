import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import blogLogo from "/blog-logo.svg";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200"
            >
              <img src={blogLogo} alt="Blog Logo" className="h-8 w-8" />
              <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BlogHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create Post
                  </Link>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="text-slate-300 text-sm">
                      Welcome, {user?.name || "User"}
                    </span>
                    <button
                      onClick={logout}
                      className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700/50 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Post
                  </Link>
                  <div className="px-4 py-2 text-slate-300 text-sm">
                    Welcome, {user?.name || "User"}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

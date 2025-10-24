import React from "react";
import { SignedOut, SignedIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">
          <Link to="/">My Blog</Link>
        </h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:underline">
              Home
            </Link>
          </li>
          <SignedIn>
            <li>
              <Link to="/create" className="hover:underline">
                Create Post
              </Link>
            </li>
          </SignedIn>
          <SignedOut>
            <li>
              <Link to="/sign-in" className="hover:underline">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/sign-up" className="hover:underline">
                Sign Up
              </Link>
            </li>
          </SignedOut>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

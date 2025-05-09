
import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="py-24 px-6">
        <div className="container mx-auto">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-6xl font-serif text-church-burgundy mb-6">404</h1>
            <p className="text-2xl font-serif mb-8">Page Not Found</p>
            <p className="mb-8">
              We're sorry, but the page you are looking for cannot be found.
            </p>
            <Link
              to="/"
              className="bg-church-burgundy text-white px-8 py-3 rounded-md hover:bg-church-burgundy/80 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl md:text-9xl font-extrabold text-gray-700 tracking-tight">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-gray-600">
          Looks like you've found a page that doesn't exist.
        </p>
        <p className="text-lg text-gray-500">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

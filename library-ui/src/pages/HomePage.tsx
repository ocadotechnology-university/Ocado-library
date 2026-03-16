// src/pages/HomePage.tsx
import React from "react";

export default function HomePage() {
  // Dummy data for initial layout testing
  const featuredBooks = [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", available: true },
    {
      id: 2,
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      available: false,
    },
    {
      id: 3,
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      available: true,
    },
    {
      id: 4,
      title: "Spring Boot in Action",
      author: "Craig Walls",
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#551D72] flex items-center gap-2">
          {/* Simple book icon SVG */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Ocado Library
        </div>
        <div className="hidden md:flex gap-6 font-medium text-gray-600">
          <a
            href="#"
            className="text-[#551D72] border-b-2 border-[#551D72] pb-1"
          >
            Home
          </a>
          <a href="#" className="hover:text-[#551D72] transition-colors">
            My Books
          </a>
          <a href="#" className="hover:text-[#551D72] transition-colors">
            Profile
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-[#551D72] py-16 px-6 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Welcome to the Ocado Technology Library
        </h1>
        <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Empowering our teams with knowledge. Search thousands of technical
          books, leadership guides, and more.
        </p>
        <div className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#78BE20]"
          />
          <button className="bg-[#78BE20] hover:bg-[#65A11A] text-white px-6 py-3 rounded-lg font-bold transition-colors">
            Search
          </button>
        </div>
      </header>

      {/* Main Content - Featured Books Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Books</h2>
          <a href="#" className="text-[#551D72] font-semibold hover:underline">
            View all collection &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 flex flex-col"
            >
              {/* Placeholder for Book Cover */}
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                <span className="text-sm font-medium">No Cover Provided</span>
              </div>

              <h3 className="font-bold text-lg leading-tight mb-1 text-gray-900">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{book.author}</p>

              {/* Footer of the card */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${book.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {book.available ? "Available" : "Checked Out"}
                </span>
                <button
                  disabled={!book.available}
                  className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                    book.available
                      ? "bg-[#551D72] text-white hover:bg-purple-900"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Borrow
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

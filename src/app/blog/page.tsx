'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  author_name: string;
  created_at: string;
  slug: string; 
}

export default function BlogHomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/users/blog/posts/')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load posts');
        setLoading(false);
      });

    const token = localStorage.getItem('access');
    setIsLoggedIn(!!token);
  }, []);

  const handleCreateClick = () => {
    router.push('/blog/create');
  };

  const handleReadMore = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">📰 Travel Blog</h1>

      {isLoggedIn && (
        <div className="mb-8 text-right">
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Write a new article
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No articles yet</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  🕒 {new Date(post.created_at).toLocaleDateString()} | ✍️ {post.author_name}
                </p>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {post.content.slice(0, 120)}...
                </p>
                <button
                  onClick={() => handleReadMore(post.slug)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

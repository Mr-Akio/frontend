'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:8000/api/users/blog/posts/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError('The article you are looking for was not found.');
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
      {loading ? (
        <p className="text-center text-gray-500">Loading Pos...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : post ? (
        <>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{post.title}</h1>

          <p className="text-sm text-gray-500 mb-6">
            🕒 {new Date(post.created_at).toLocaleDateString()} | ✍️ {post.author_name}
          </p>

          {post.image && (
            <div className="mb-6">
              <Image
                src={post.image.startsWith('http') ? post.image : `http://localhost:8000${post.image}`}
                alt={post.title}
                width={800}
                height={400}
                className="rounded-xl object-cover shadow"
                unoptimized
                />
            </div>
          )}

          <div className="prose max-w-none text-gray-800 leading-7">
            {post.content.split('\n').map((para, index) => (
              <p key={index} className="mb-4">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-10">
            <button
              onClick={() => router.push('/blog')}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to all articles
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

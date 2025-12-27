import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAdminStatus,
  getAllPosts,
  adminDeletePost,
  supabase
} from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminHeader from '../../components/AdminHeader';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes: Array<{ count: number }>;
  comments: Array<{ count: number }>;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const { isAdmin } = await checkAdminStatus();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      await loadPosts();
    }
    init();
  }, [navigate]);

  async function loadPosts() {
    setLoading(true);
    const result = await getAllPosts(100);
    if (result.success) {
      setPosts(result.data || []);
    }
    setLoading(false);
  }

  async function handleDeletePost(postId: string, username: string) {
    const reason = prompt(`Reason for deleting ${username}'s post:`);
    if (!reason) return;

    if (!confirm('Do you want to delete this post permanently?')) return;

    const result = await adminDeletePost(postId, reason);
    if (result.success) {
      alert('✅ Post deleted successfully');
      loadPosts();
      setSelectedPost(null);
    } else {
      alert('❌ An error occurred during deletion');
    }
  }

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminHeader title="Posts Management" />

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Search */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="🔍 Search posts (content or username)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              fontSize: '15px',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Total Posts
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent)' }}>
              {posts.length}
            </div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Posts with Images
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
              {posts.filter(p => p.image_url).length}
            </div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Total Likes
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
              {posts.reduce((sum, p) => sum + (p.likes[0]?.count || 0), 0)}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <LoadingSpinner />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'var(--card)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ fontSize: '20px', color: 'var(--text)' }}>
              No posts
            </h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {filteredPosts.map(post => (
              <div
                key={post.id}
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedPost(post)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Author */}
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid var(--border)'
                }}>
                  {post.profiles.avatar_url ? (
                    <img
                      src={post.profiles.avatar_url}
                      alt=""
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {post.profiles.username[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {post.profiles.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(post.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>

                {/* Image */}
                {post.image_url && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    background: 'var(--bg)'
                  }}>
                    <img
                      src={post.image_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {post.content}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>❤️ {post.likes[0]?.count || 0}</span>
                    <span>💬 {post.comments[0]?.count || 0}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id, post.profiles.username);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    🗑️ Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Modal */}
        {selectedPost && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setSelectedPost(null)}
          >
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                  Post Details
                </h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--text)'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Author */}
              <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid var(--border)'
              }}>
                {selectedPost.profiles.avatar_url ? (
                  <img
                    src={selectedPost.profiles.avatar_url}
                    alt=""
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: 'white',
                    fontWeight: '700'
                  }}>
                    {selectedPost.profiles.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {selectedPost.profiles.username}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(selectedPost.created_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>

              {/* Image */}
              {selectedPost.image_url && (
                <div style={{ padding: '20px' }}>
                  <img
                    src={selectedPost.image_url}
                    alt=""
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedPost.content}
                </p>
              </div>

              {/* Stats */}
              <div style={{
                padding: '20px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '30px',
                fontSize: '15px'
              }}>
                <span>❤️ {selectedPost.likes[0]?.count || 0} Likes</span>
                <span>💬 {selectedPost.comments[0]?.count || 0} Comments</span>
              </div>

              {/* Actions */}
              <div style={{ padding: '20px' }}>
                <button
                  onClick={() => handleDeletePost(selectedPost.id, selectedPost.profiles.username)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  🗑️ Delete Post Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

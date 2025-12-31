import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAdminStatus,
  getAllPosts,
  adminDeletePost,
  supabase
} from '../../services/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/ToastProvider';
import AdminHeader from '../../components/AdminHeader';
import {
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineDelete,
  AiOutlineFileText,
  AiOutlineArrowLeft,
  AiOutlineLogout
} from 'react-icons/ai';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [postToDelete, setPostToDelete] = useState<{ id: string; username: string } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  function handleDeletePost(postId: string, username: string) {
    setPostToDelete({ id: postId, username });
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!postToDelete || !deleteReason.trim()) {
      showToast('Please provide a reason for deletion', 'warning');
      return;
    }

    const result = await adminDeletePost(postToDelete.id, deleteReason);
    if (result.success) {
      showToast('Post deleted successfully', 'success');
      loadPosts();
      setSelectedPost(null);
      setShowDeleteModal(false);
      setDeleteReason('');
      setPostToDelete(null);
    } else {
      showToast('An error occurred during deletion', 'error');
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setDeleteReason('');
    setPostToDelete(null);
  }

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--text)'
              }}
            >
              <AiOutlineArrowLeft />
            </button>
            <AiOutlineFileText style={{ fontSize: '32px', color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              Posts Management
            </h1>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate('/admin/login'))}
            style={{
              padding: '10px 20px',
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#c33'
            }}
          >
            <AiOutlineLogout style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Search */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Search posts (content or username)..."
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
            <AiOutlineFileText style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }} />
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
                      {new Date(post.created_at).toLocaleDateString('en-US')}
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
                    <span className="flex items-center gap-1"><AiOutlineHeart /> {post.likes[0]?.count || 0}</span>
                    <span className="flex items-center gap-1"><AiOutlineMessage /> {post.comments[0]?.count || 0}</span>
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
                    <AiOutlineDelete style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Delete Post
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
                    {new Date(selectedPost.created_at).toLocaleString('en-US')}
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
                <span className="flex items-center gap-1"><AiOutlineHeart /> {selectedPost.likes[0]?.count || 0} Likes</span>
                <span className="flex items-center gap-1"><AiOutlineMessage /> {selectedPost.comments[0]?.count || 0} Comments</span>
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
                  <AiOutlineDelete style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Delete Post Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
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
          onClick={cancelDelete}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: 0,
                color: 'var(--text)'
              }}>
                Delete Post by @{postToDelete.username}
              </h2>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                Please provide a reason for deleting this post. This action cannot be undone.
              </p>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter deletion reason..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!deleteReason.trim()}
                style={{
                  padding: '10px 20px',
                  background: deleteReason.trim() ? '#ef4444' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: deleteReason.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: deleteReason.trim() ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (deleteReason.trim()) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deleteReason.trim()) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

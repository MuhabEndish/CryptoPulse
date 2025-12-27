import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===================================================
// 🖼️ Image Upload Functions
// ===================================================

/**
 * Upload post image to Supabase Storage
 */
export async function uploadPostImage(file: File, userId: string): Promise<string | null> {
  try {
    // Verify file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Use only JPEG, PNG, GIF, or WebP.');
    }

    // Verify file size (5 MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size is too large. Maximum is 5 megabytes.');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('posts-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL for the image
    const { data: publicUrlData } = supabase.storage
      .from('posts-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  try {
    // Verify file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Use only JPEG, PNG, or WebP.');
    }

    // Verify file size (2 MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('Image size is too large. Maximum is 2 megabytes.');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Allow replacement
      });

    if (error) throw error;

    // Get public URL for the image
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * Delete image from Storage
 */
export async function deleteImage(imageUrl: string, bucket: 'posts-images' | 'avatars'): Promise<boolean> {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// ===================================================
// 🚨 Content Reporting Functions
// ===================================================

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'inappropriate_content'
  | 'false_information'
  | 'other';

export interface ReportData {
  contentType: 'post' | 'comment';
  contentId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
}

/**
 * Submit a report about inappropriate content
 */
export async function submitReport(reportData: ReportData, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: userId,
        reported_user_id: reportData.reportedUserId,
        content_type: reportData.contentType,
        content_id: reportData.contentId,
        reason: reportData.reason,
        details: reportData.details || null,
        status: 'pending'
      });

    if (error) {
      // Check for duplicate error (user already reported the same content)
      if (error.code === '23505') {
        return {
          success: false,
          error: 'You have already reported this content.'
        };
      }
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit report. Please try again.'
    };
  }
}

/**
 * Get translated report reasons
 */
export const reportReasons: Record<ReportReason, string> = {
  spam: '🚫 Spam or annoying ads',
  harassment: '😡 Harassment or bullying',
  hate_speech: '🤬 Hate speech',
  violence: '🔪 Violence or threats',
  inappropriate_content: '🔞 Inappropriate content',
  false_information: '📰 False or misleading information',
  other: '❓ Other reason'
};

// ===================================================
// 👨‍💼 Admin Dashboard Functions
// ===================================================

export interface AdminPermissions {
  view_reports: boolean;
  manage_reports: boolean;
  delete_posts: boolean;
  delete_comments: boolean;
  ban_users: boolean;
  delete_users: boolean;
  manage_admins: boolean;
}

export interface AdminData {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  created_at: string;
  last_login?: string;
}

/**
 * Check if current user is admin
 */
export async function checkAdminStatus(): Promise<{ isAdmin: boolean; adminData?: AdminData }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user found');
      return { isAdmin: false };
    }

    console.log('🔍 Checking admin status for user:', user.id);

    // Use maybeSingle instead of single to avoid RLS issues
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Admin query result:', { data, error });

    if (error) {
      console.error('❌ Error querying admins table:', error);
      return { isAdmin: false };
    }

    if (!data) {
      console.log('❌ No admin record found for user');
      return { isAdmin: false };
    }

    console.log('✅ Admin found:', data.role);
    return {
      isAdmin: true,
      adminData: data as AdminData
    };
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return { isAdmin: false };
  }
}

/**
 * Check if current user is banned
 */
export async function checkIfUserBanned(): Promise<{
  isBanned: boolean;
  reason?: string;
  banType?: 'temporary' | 'permanent';
  bannedUntil?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isBanned: false };

    const { data, error } = await supabase
      .from('banned_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // If there is no ban record
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking ban status:', error);
      return { isBanned: false };
    }

    if (!data) return { isBanned: false };

    // Check if temporary ban has expired
    if (data.ban_type === 'temporary' && data.banned_until) {
      const bannedUntil = new Date(data.banned_until);
      const now = new Date();

      if (bannedUntil < now) {
        // Ban expired - delete record automatically
        await supabase
          .from('banned_users')
          .delete()
          .eq('user_id', user.id);

        return { isBanned: false };
      }
    }

    return {
      isBanned: true,
      reason: data.reason,
      banType: data.ban_type,
      bannedUntil: data.banned_until
    };
  } catch (error: any) {
    console.error('Error checking ban status:', error);
    return { isBanned: false };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all reports for admins
 */
export async function getAllReports(status?: string) {
  try {
    // Fetch reports
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error: reportsError } = await query;
    if (reportsError) throw reportsError;

    // Fetch user information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // Merge data
    const reportsWithData = reports?.map(report => {
      const reporter = profiles?.find(p => p.id === report.reporter_id);
      const reportedUser = profiles?.find(p => p.id === report.reported_user_id);

      return {
        ...report,
        reporter: reporter || { id: report.reporter_id, username: 'Deleted user', email: '' },
        reported_user: reportedUser || { id: report.reported_user_id, username: 'Deleted user', email: '' }
      };
    });

    return { success: true, data: reportsWithData };
  } catch (error: any) {
    console.error('Error getting reports:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(reportId: string, status: string) {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: status === 'resolved' ? 'resolve_report' : 'dismiss_report',
      p_target_type: 'report',
      p_target_id: reportId
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete post (admin)
 */
export async function adminDeletePost(postId: string, reason?: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'delete_post',
      p_target_type: 'post',
      p_target_id: postId,
      p_reason: reason
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete comment (admin)
 */
export async function adminDeleteComment(commentId: string, reason?: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'delete_comment',
      p_target_type: 'comment',
      p_target_id: commentId,
      p_reason: reason
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all posts (admin)
 */
export async function getAllPosts(limit: number = 50) {
  try {
    // Fetch posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (postsError) throw postsError;

    // Fetch user information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, avatar_url');

    if (profilesError) throw profilesError;

    // Fetch like count for each post
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('post_id');

    if (likesError) throw likesError;

    // Fetch comment count for each post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('post_id');

    if (commentsError) throw commentsError;

    // Merge data
    const postsWithData = posts?.map(post => {
      const profile = profiles?.find(p => p.id === post.user_id);
      const likeCount = likes?.filter(l => l.post_id === post.id).length || 0;
      const commentCount = comments?.filter(c => c.post_id === post.id).length || 0;

      return {
        ...post,
        profiles: profile || { id: post.user_id, username: 'Deleted user', email: '', avatar_url: null },
        likes: [{ count: likeCount }],
        comments: [{ count: commentCount }]
      };
    });

    return { success: true, data: postsWithData };
  } catch (error: any) {
    console.error('Error getting posts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users (admin)
 */
export async function getAllUsers(limit: number = 50) {
  try {
    // Fetch users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (profilesError) throw profilesError;

    // Fetch ban information for each user
    const { data: bannedUsers, error: bannedError } = await supabase
      .from('banned_users')
      .select('*');

    if (bannedError) throw bannedError;

    // Fetch post count for each user
    const { data: postCounts, error: postsError } = await supabase
      .from('posts')
      .select('user_id');

    if (postsError) throw postsError;

    // Merge data
    const usersWithData = profiles?.map(profile => {
      const banned = bannedUsers?.filter(b => b.user_id === profile.id) || [];
      const postCount = postCounts?.filter(p => p.user_id === profile.id).length || 0;

      return {
        ...profile,
        banned: banned,
        posts: [{ count: postCount }]
      };
    });

    return { success: true, data: usersWithData };
  } catch (error: any) {
    console.error('Error getting users:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ban user
 */
export async function banUser(
  userId: string,
  reason: string,
  banType: 'temporary' | 'permanent',
  bannedUntil?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        banned_by: user.id,
        reason,
        ban_type: banType,
        banned_until: bannedUntil || null
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This user is already banned' };
      }
      throw error;
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'ban_user',
      p_target_type: 'user',
      p_target_id: userId,
      p_reason: reason,
      p_metadata: { ban_type: banType, banned_until: bannedUntil }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error banning user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unban user
 */
export async function unbanUser(userId: string) {
  try {
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'unban_user',
      p_target_type: 'user',
      p_target_id: userId
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error unbanning user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Permanently delete user (Super Admin only)
 */
export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'delete_user',
      p_target_type: 'user',
      p_target_id: userId
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get admin actions log
 */
export async function getAdminActionsLog(limit: number = 100) {
  try {
    // Fetch action logs
    const { data: logs, error: logsError } = await supabase
      .from('admin_actions_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logsError) throw logsError;

    // Fetch admin information
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('user_id, role');

    if (adminsError) throw adminsError;

    // Fetch user information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // Merge data
    const logsWithData = logs?.map(log => {
      const admin = admins?.find(a => a.user_id === log.admin_id);
      const profile = profiles?.find(p => p.id === log.admin_id);

      return {
        ...log,
        admin: admin ? {
          user_id: admin.user_id,
          role: admin.role,
          profiles: profile || { username: 'Deleted user', email: '' }
        } : null
      };
    });

    return { success: true, data: logsWithData };
  } catch (error: any) {
    console.error('Error getting actions log:', error);
    return { success: false, error: error.message };
  }
}

// ===================================================
// 👨‍💼 Admins Management Functions
// ===================================================

/**
 * Get all admins
 */
export async function getAllAdmins() {
  try {
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminsError) throw adminsError;

    // Fetch user information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // Merge data
    const adminsWithData = admins?.map(admin => {
      const profile = profiles?.find(p => p.id === admin.user_id);
      return {
        ...admin,
        profile: profile || { username: 'Unknown', email: 'N/A' }
      };
    });

    return { success: true, data: adminsWithData };
  } catch (error: any) {
    console.error('Error getting admins:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add new admin
 */
export async function addAdmin(
  email: string,
  role: 'super_admin' | 'admin' | 'moderator',
  permissions: any
) {
  try {
    // Search for user by email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .eq('email', email)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profiles) {
      return { success: false, error: 'User not found. Verify the email address' };
    }

    // Check that no previous admin record exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', profiles.id)
      .maybeSingle();

    if (existingAdmin) {
      return { success: false, error: 'This user is already an admin' };
    }

    // Add new admin
    const { error: insertError } = await supabase
      .from('admins')
      .insert({
        user_id: profiles.id,
        role,
        permissions
      });

    if (insertError) throw insertError;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'create_admin',
      p_target_type: 'admin',
      p_target_id: profiles.id,
      p_metadata: { role, permissions }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding admin:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update admin permissions
 */
export async function updateAdminPermissions(
  adminUserId: string,
  role: string,
  permissions: any
) {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ role, permissions, updated_at: new Date().toISOString() })
      .eq('user_id', adminUserId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete admin
 */
export async function deleteAdmin(adminUserId: string) {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', adminUserId);

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'delete_admin',
      p_target_type: 'admin',
      p_target_id: adminUserId
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return { success: false, error: error.message };
  }
}

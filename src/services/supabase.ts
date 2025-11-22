import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===================================================
// 🖼️ دوال رفع الصور - Image Upload Functions
// ===================================================

/**
 * رفع صورة منشور إلى Supabase Storage
 * Upload post image to Supabase Storage
 */
export async function uploadPostImage(file: File, userId: string): Promise<string | null> {
  try {
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مسموح. استخدم JPEG, PNG, GIF, أو WebP فقط.');
    }

    // التحقق من حجم الملف (5 MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.');
    }

    // إنشاء اسم ملف فريد
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // رفع الملف إلى Supabase Storage
    const { data, error } = await supabase.storage
      .from('posts-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // الحصول على الرابط العام للصورة
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
 * رفع صورة الملف الشخصي إلى Supabase Storage
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  try {
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مسموح. استخدم JPEG, PNG, أو WebP فقط.');
    }

    // التحقق من حجم الملف (2 MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت.');
    }

    // إنشاء اسم ملف فريد
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // رفع الملف إلى Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // السماح بالاستبدال
      });

    if (error) throw error;

    // الحصول على الرابط العام للصورة
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
 * حذف صورة من Storage
 * Delete image from Storage
 */
export async function deleteImage(imageUrl: string, bucket: 'posts-images' | 'avatars'): Promise<boolean> {
  try {
    // استخراج اسم الملف من الرابط
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
// 🚨 دوال الإبلاغ عن المحتوى - Content Reporting Functions
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
 * إرسال بلاغ عن محتوى غير لائق
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
      // التحقق من خطأ التكرار (المستخدم أبلغ عن نفس المحتوى من قبل)
      if (error.code === '23505') {
        return {
          success: false,
          error: 'لقد قمت بالإبلاغ عن هذا المحتوى من قبل.'
        };
      }
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return {
      success: false,
      error: error.message || 'فشل إرسال البلاغ. حاول مرة أخرى.'
    };
  }
}

/**
 * جلب أسباب البلاغ المترجمة
 * Get translated report reasons
 */
export const reportReasons: Record<ReportReason, string> = {
  spam: '🚫 سبام أو إعلانات مزعجة',
  harassment: '😡 تحرش أو تنمر',
  hate_speech: '🤬 خطاب كراهية',
  violence: '🔪 عنف أو تهديد',
  inappropriate_content: '🔞 محتوى غير لائق',
  false_information: '📰 معلومات كاذبة أو مضللة',
  other: '❓ سبب آخر'
};

// ===================================================
// 👨‍💼 دوال لوحة التحكم الإدارية - Admin Dashboard Functions
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
 * التحقق من صلاحيات الإداري
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

    // استخدام maybeSingle بدلاً من single لتجنب مشاكل RLS
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
 * التحقق من حظر المستخدم الحالي
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

    // إذا لم يكن هناك سجل حظر
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking ban status:', error);
      return { isBanned: false };
    }

    if (!data) return { isBanned: false };

    // التحقق من انتهاء الحظر المؤقت
    if (data.ban_type === 'temporary' && data.banned_until) {
      const bannedUntil = new Date(data.banned_until);
      const now = new Date();

      if (bannedUntil < now) {
        // انتهى الحظر - حذف السجل تلقائياً
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
 * جلب إحصائيات Dashboard
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
 * جلب جميع البلاغات للإداريين
 * Get all reports for admins
 */
export async function getAllReports(status?: string) {
  try {
    // جلب البلاغات
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error: reportsError } = await query;
    if (reportsError) throw reportsError;

    // جلب معلومات المستخدمين
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // دمج البيانات
    const reportsWithData = reports?.map(report => {
      const reporter = profiles?.find(p => p.id === report.reporter_id);
      const reportedUser = profiles?.find(p => p.id === report.reported_user_id);

      return {
        ...report,
        reporter: reporter || { id: report.reporter_id, username: 'مستخدم محذوف', email: '' },
        reported_user: reportedUser || { id: report.reported_user_id, username: 'مستخدم محذوف', email: '' }
      };
    });

    return { success: true, data: reportsWithData };
  } catch (error: any) {
    console.error('Error getting reports:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث حالة البلاغ
 * Update report status
 */
export async function updateReportStatus(reportId: string, status: string) {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;

    // تسجيل الإجراء
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
 * حذف منشور (للإداريين)
 * Delete post (admin)
 */
export async function adminDeletePost(postId: string, reason?: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    // تسجيل الإجراء
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
 * حذف تعليق (للإداريين)
 * Delete comment (admin)
 */
export async function adminDeleteComment(commentId: string, reason?: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // تسجيل الإجراء
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
 * جلب جميع المنشورات (للإداريين)
 * Get all posts (admin)
 */
export async function getAllPosts(limit: number = 50) {
  try {
    // جلب المنشورات
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (postsError) throw postsError;

    // جلب معلومات المستخدمين
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, avatar_url');

    if (profilesError) throw profilesError;

    // جلب عدد الإعجابات لكل منشور
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('post_id');

    if (likesError) throw likesError;

    // جلب عدد التعليقات لكل منشور
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('post_id');

    if (commentsError) throw commentsError;

    // دمج البيانات
    const postsWithData = posts?.map(post => {
      const profile = profiles?.find(p => p.id === post.user_id);
      const likeCount = likes?.filter(l => l.post_id === post.id).length || 0;
      const commentCount = comments?.filter(c => c.post_id === post.id).length || 0;

      return {
        ...post,
        profiles: profile || { id: post.user_id, username: 'مستخدم محذوف', email: '', avatar_url: null },
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
 * جلب جميع المستخدمين (للإداريين)
 * Get all users (admin)
 */
export async function getAllUsers(limit: number = 50) {
  try {
    // جلب المستخدمين
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (profilesError) throw profilesError;

    // جلب معلومات الحظر لكل مستخدم
    const { data: bannedUsers, error: bannedError } = await supabase
      .from('banned_users')
      .select('*');

    if (bannedError) throw bannedError;

    // جلب عدد المنشورات لكل مستخدم
    const { data: postCounts, error: postsError } = await supabase
      .from('posts')
      .select('user_id');

    if (postsError) throw postsError;

    // دمج البيانات
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
 * حظر مستخدم
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
        return { success: false, error: 'هذا المستخدم محظور بالفعل' };
      }
      throw error;
    }

    // تسجيل الإجراء
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
 * إلغاء حظر مستخدم
 * Unban user
 */
export async function unbanUser(userId: string) {
  try {
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // تسجيل الإجراء
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
 * حذف مستخدم نهائياً (Super Admin فقط)
 * Permanently delete user (Super Admin only)
 */
export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    // تسجيل الإجراء
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
 * جلب سجل الإجراءات الإدارية
 * Get admin actions log
 */
export async function getAdminActionsLog(limit: number = 100) {
  try {
    // جلب سجل الإجراءات
    const { data: logs, error: logsError } = await supabase
      .from('admin_actions_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logsError) throw logsError;

    // جلب معلومات الإداريين
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('user_id, role');

    if (adminsError) throw adminsError;

    // جلب معلومات المستخدمين
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // دمج البيانات
    const logsWithData = logs?.map(log => {
      const admin = admins?.find(a => a.user_id === log.admin_id);
      const profile = profiles?.find(p => p.id === log.admin_id);

      return {
        ...log,
        admin: admin ? {
          user_id: admin.user_id,
          role: admin.role,
          profiles: profile || { username: 'مستخدم محذوف', email: '' }
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
// 👨‍💼 دوال إدارة المديرين - Admins Management Functions
// ===================================================

/**
 * جلب جميع المديرين
 * Get all admins
 */
export async function getAllAdmins() {
  try {
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminsError) throw adminsError;

    // جلب معلومات المستخدمين
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email');

    if (profilesError) throw profilesError;

    // دمج البيانات
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
 * إضافة مدير جديد
 * Add new admin
 */
export async function addAdmin(
  usernameOrEmail: string,
  role: 'super_admin' | 'admin' | 'moderator',
  permissions: any
) {
  try {
    // البحث عن المستخدم بالاسم (username)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .eq('username', usernameOrEmail)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profiles) {
      return { success: false, error: 'المستخدم غير موجود. تأكد من اسم المستخدم (username)' };
    }

    // التحقق من عدم وجود سجل إداري مسبق
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', profiles.id)
      .maybeSingle();

    if (existingAdmin) {
      return { success: false, error: 'هذا المستخدم مدير بالفعل' };
    }

    // إضافة المدير الجديد
    const { error: insertError } = await supabase
      .from('admins')
      .insert({
        user_id: profiles.id,
        role,
        permissions
      });

    if (insertError) throw insertError;

    // تسجيل الإجراء
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
 * تحديث صلاحيات مدير
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
 * حذف مدير
 * Delete admin
 */
export async function deleteAdmin(adminUserId: string) {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', adminUserId);

    if (error) throw error;

    // تسجيل الإجراء
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

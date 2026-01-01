-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_actions_log
(
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type = ANY (ARRAY['delete_post'::text, 'delete_comment'::text, 'ban_user'::text, 'unban_user'::text, 'delete_user'::text, 'resolve_report'::text, 'dismiss_report'::text, 'create_admin'::text, 'delete_admin'::text])
)
,
  target_type text CHECK
(target_type = ANY
(ARRAY['post'::text, 'comment'::text, 'user'::text, 'report'::text, 'admin'::text])),
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamp
with time zone NOT NULL DEFAULT timezone
('utc'::text, now
()),
  CONSTRAINT admin_actions_log_pkey PRIMARY KEY
(id),
  CONSTRAINT admin_actions_log_admin_id_fkey FOREIGN KEY
(admin_id) REFERENCES public.admins
(user_id)
);
CREATE TABLE public.admins
(
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'moderator'
  ::text CHECK
  (role = ANY
  (ARRAY['super_admin'::text, 'admin'::text, 'moderator'::text])),
  permissions jsonb DEFAULT '{"ban_users": true, "delete_posts": true, "delete_users": false, "view_reports": true, "manage_admins": false, "manage_reports": true, "delete_comments": true}'::jsonb,
  created_by uuid,
  created_at timestamp
  with time zone NOT NULL DEFAULT timezone
  ('utc'::text, now
  ()),
  updated_at timestamp
  with time zone NOT NULL DEFAULT timezone
  ('utc'::text, now
  ()),
  last_login timestamp
  with time zone,
  CONSTRAINT admins_pkey PRIMARY KEY
  (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY
  (user_id) REFERENCES auth.users
  (id),
  CONSTRAINT admins_created_by_fkey FOREIGN KEY
  (created_by) REFERENCES public.admins
  (user_id)
);
  CREATE TABLE public.alarms
  (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    coin_id text NOT NULL,
    target_price numeric NOT NULL,
    direction text NOT NULL CHECK (direction = ANY (ARRAY['above'::text, 'below'::text])
  )
  ,
  triggered_at timestamp
  with time zone,
  created_at timestamp
  with time zone DEFAULT now
  (),
  CONSTRAINT alarms_pkey PRIMARY KEY
  (id),
  CONSTRAINT alarms_user_id_fkey FOREIGN KEY
  (user_id) REFERENCES public.profiles
  (id)
);
  CREATE TABLE public.banned_users
  (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    banned_by uuid NOT NULL,
    reason text NOT NULL,
    ban_type text NOT NULL DEFAULT 'temporary'
    ::text CHECK
    (ban_type = ANY
    (ARRAY['temporary'::text, 'permanent'::text])),
  banned_until timestamp
    with time zone,
  created_at timestamp
    with time zone NOT NULL DEFAULT timezone
    ('utc'::text, now
    ()),
  notes text,
  CONSTRAINT banned_users_pkey PRIMARY KEY
    (id),
  CONSTRAINT banned_users_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES public.profiles
    (id),
  CONSTRAINT banned_users_banned_by_fkey FOREIGN KEY
    (banned_by) REFERENCES public.admins
    (user_id)
);
    CREATE TABLE public.comments
    (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      post_id uuid,
      user_id uuid,
      content text NOT NULL CHECK (char_length(content) <= 280),
      created_at timestamp
      with time zone DEFAULT now
      (),
  updated_at timestamp
      with time zone DEFAULT now
      (),
  CONSTRAINT comments_pkey PRIMARY KEY
      (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY
      (post_id) REFERENCES public.posts
      (id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY
      (user_id) REFERENCES public.profiles
      (id)
);
      CREATE TABLE public.favorite_cryptos
      (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid,
        coin_id text NOT NULL,
        inserted_at timestamp
        with time zone DEFAULT now
        (),
  CONSTRAINT favorite_cryptos_pkey PRIMARY KEY
        (id),
  CONSTRAINT favorite_cryptos_user_id_fkey FOREIGN KEY
        (user_id) REFERENCES public.profiles
        (id)
);
        CREATE TABLE public.likes
        (
          id uuid NOT NULL DEFAULT gen_random_uuid(),
          post_id uuid,
          user_id uuid,
          inserted_at timestamp
          with time zone DEFAULT now
          (),
  CONSTRAINT likes_pkey PRIMARY KEY
          (id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY
          (post_id) REFERENCES public.posts
          (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY
          (user_id) REFERENCES public.profiles
          (id)
);
          CREATE TABLE public.posts
          (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            user_id uuid,
            content text NOT NULL CHECK (char_length(content) <= 280),
            created_at timestamp
            with time zone DEFAULT now
            (),
  image_url text,
  coin text DEFAULT 'BTC'::text,
  sentiment text DEFAULT 'Neutral'::text CHECK
            (sentiment = ANY
            (ARRAY['Bullish'::text, 'Bearish'::text, 'Neutral'::text])),
  updated_at timestamp
            with time zone DEFAULT now
            (),
  CONSTRAINT posts_pkey PRIMARY KEY
            (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY
            (user_id) REFERENCES public.profiles
            (id)
);
            CREATE TABLE public.price_alerts
            (
              id uuid NOT NULL DEFAULT gen_random_uuid(),
              user_id uuid NOT NULL,
              coin_id text NOT NULL,
              coin_name text NOT NULL,
              coin_symbol text NOT NULL,
              target_price numeric NOT NULL,
              condition text NOT NULL CHECK (condition = ANY (ARRAY['above'::text, 'below'::text])
            )
            ,
  is_active boolean DEFAULT true,
  triggered_at timestamp
            with time zone,
  created_at timestamp
            with time zone DEFAULT now
            (),
  updated_at timestamp
            with time zone DEFAULT now
            (),
  CONSTRAINT price_alerts_pkey PRIMARY KEY
            (id),
  CONSTRAINT price_alerts_user_id_fkey FOREIGN KEY
            (user_id) REFERENCES auth.users
            (id)
);
            CREATE TABLE public.profiles
            (
              id uuid NOT NULL,
              username text UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
              bio text CHECK (char_length(bio) <= 150),
              avatar_url text,
              created_at timestamp
              with time zone DEFAULT now
              (),
  updated_at timestamp
              with time zone DEFAULT now
              (),
  email text NOT NULL UNIQUE,
  privacy_settings jsonb DEFAULT '{"showActivity": true, "showWatchlist": true, "isProfilePublic": true, "allowSocialInteractions": true}'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY
              (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY
              (id) REFERENCES auth.users
              (id)
);
              CREATE TABLE public.reports
              (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                reporter_id uuid NOT NULL,
                reported_user_id uuid,
                content_type text NOT NULL CHECK (content_type = ANY (ARRAY['post'::text, 'comment'::text])
              )
              ,
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK
              (reason = ANY
              (ARRAY['spam'::text, 'harassment'::text, 'hate_speech'::text, 'violence'::text, 'inappropriate_content'::text, 'false_information'::text, 'other'::text])),
  details text,
  status text DEFAULT 'pending'::text CHECK
              (status = ANY
              (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  created_at timestamp
              with time zone NOT NULL DEFAULT timezone
              ('utc'::text, now
              ()),
  updated_at timestamp
              with time zone NOT NULL DEFAULT timezone
              ('utc'::text, now
              ()),
  CONSTRAINT reports_pkey PRIMARY KEY
              (id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY
              (reporter_id) REFERENCES auth.users
              (id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY
              (reported_user_id) REFERENCES public.profiles
              (id)
);
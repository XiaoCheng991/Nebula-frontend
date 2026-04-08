-- ============================================================
-- 文件隔离：用户只能看到自己上传的文件
-- ============================================================

-- 1. 删除旧的不安全的 RLS 策略
DROP POLICY IF EXISTS "用户可查看自己的文件" ON file_metadata;
DROP POLICY IF EXISTS "用户可上传自己的文件" ON file_metadata;
DROP POLICY IF EXISTS "用户可更新自己的文件" ON file_metadata;

-- 2. 创建新的用户隔离 RLS 策略
-- 用户只能查看自己的文件
CREATE POLICY "用户只能查看自己的文件" ON file_metadata
FOR SELECT USING (
  deleted = 0 AND user_id = (
    SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'
  )
);

-- 用户只能插入自己的文件
CREATE POLICY "用户只能上传自己的文件" ON file_metadata
FOR INSERT WITH CHECK (
  user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
);

-- 用户只能更新自己的文件
CREATE POLICY "用户只能更新自己的文件" ON file_metadata
FOR UPDATE USING (
  user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
);

-- 用户只能删除自己的文件
CREATE POLICY "用户只能删除自己的文件" ON file_metadata
FOR DELETE USING (
  user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
);

-- ============================================================
-- 3. 创建带用户过滤的 RPC 函数
-- ============================================================

CREATE OR REPLACE FUNCTION get_drive_page_data(
  p_bucket_name TEXT,
  p_folder_name TEXT DEFAULT NULL,
  p_user_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id BIGINT;
  v_files JSONB;
  v_recent_files JSONB;
  v_folders JSONB;
  v_stats JSONB;
BEGIN
  -- 如果传入了 user_id 则使用，否则从 JWT 获取
  IF p_user_id IS NOT NULL THEN
    v_user_id := p_user_id;
  ELSE
    SELECT id INTO v_user_id FROM sys_users WHERE email = auth.jwt()->>'email';
  END IF;

  -- 如果没有用户 ID，返回空数据
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'files_json', '[]'::jsonb,
      'recent_files_json', '[]'::jsonb,
      'folders_json', '[]'::jsonb,
      'stats_json', '[]'::jsonb
    );
  END IF;

  -- 获取当前用户在该 bucket 的文件列表
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', fm.id,
      'bucket_name', fm.bucket_name,
      'file_path', fm.file_path,
      'file_name', fm.file_name,
      'file_size', fm.file_size,
      'file_type', fm.file_type,
      'folder_name', fm.folder_name,
      'user_id', fm.user_id,
      'owner_name', fm.owner_name,
      'is_shared', fm.is_shared,
      'created_at', fm.created_at,
      'updated_at', fm.updated_at,
      'deleted', fm.deleted
    )
  ) INTO v_files
  FROM file_metadata fm
  WHERE fm.deleted = 0
    AND fm.bucket_name = p_bucket_name
    AND fm.user_id = v_user_id
    AND (p_folder_name IS NULL OR fm.folder_name = p_folder_name)
  ORDER BY fm.created_at DESC;

  -- 获取当前用户在该 bucket 的最近文件（不限 bucket）
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', fm.id,
      'bucket_name', fm.bucket_name,
      'file_path', fm.file_path,
      'file_name', fm.file_name,
      'file_size', fm.file_size,
      'file_type', fm.file_type,
      'folder_name', fm.folder_name,
      'user_id', fm.user_id,
      'owner_name', fm.owner_name,
      'is_shared', fm.is_shared,
      'created_at', fm.created_at,
      'updated_at', fm.updated_at,
      'deleted', fm.deleted
    )
  ) INTO v_recent_files
  FROM file_metadata fm
  WHERE fm.deleted = 0
    AND fm.user_id = v_user_id
  ORDER BY fm.created_at DESC
  LIMIT 10;

  -- 获取当前用户在该 bucket 的文件夹列表
  SELECT jsonb_agg(DISTINCT fm.folder_name) INTO v_folders
  FROM file_metadata fm
  WHERE fm.deleted = 0
    AND fm.bucket_name = p_bucket_name
    AND fm.user_id = v_user_id
    AND fm.folder_name IS NOT NULL
    AND fm.folder_name != '';

  -- 获取当前用户的存储统计
  SELECT jsonb_agg(
    jsonb_build_object(
      'bucketName', fm.bucket_name,
      'fileCount', COUNT(*),
      'totalSize', SUM(fm.file_size)
    )
  ) INTO v_stats
  FROM file_metadata fm
  WHERE fm.deleted = 0
    AND fm.user_id = v_user_id
  GROUP BY fm.bucket_name;

  RETURN jsonb_build_object(
    'files_json', COALESCE(v_files, '[]'::jsonb),
    'recent_files_json', COALESCE(v_recent_files, '[]'::jsonb),
    'folders_json', COALESCE(v_folders, '[]'::jsonb),
    'stats_json', COALESCE(v_stats, '[]'::jsonb)
  );
END;
$$;

-- 4. 授予执行权限（让 RPC 函数可以访问 sys_users 表）
GRANT EXECUTE ON FUNCTION get_drive_page_data(TEXT, TEXT, BIGINT) TO anon, authenticated;

-- 5. 测试函数（可选）
-- SELECT * FROM get_drive_page_data('drive-docs', NULL, 1);
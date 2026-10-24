-- Per-user saved-draft activity, grouped in the practice's local calendar.
CREATE INDEX IF NOT EXISTS idx_captions_user_draft_activity
  ON captions (created_by, practice_id, created_at)
  WHERE status = 'draft';

CREATE OR REPLACE FUNCTION public.caption_activity_by_day(
  p_practice_id UUID,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE (activity_date DATE, caption_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (caption.created_at AT TIME ZONE
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM pg_timezone_names AS zone
          WHERE zone.name = p_timezone
        ) THEN p_timezone
        ELSE 'UTC'
      END
    )::DATE AS activity_date,
    COUNT(*)::BIGINT AS caption_count
  FROM public.captions AS caption
  WHERE caption.practice_id = p_practice_id
    AND caption.created_by = (SELECT auth.uid())
    AND caption.status = 'draft'
  GROUP BY 1
  ORDER BY 1;
$$;

REVOKE ALL ON FUNCTION public.caption_activity_by_day(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.caption_activity_by_day(UUID, TEXT) TO authenticated;

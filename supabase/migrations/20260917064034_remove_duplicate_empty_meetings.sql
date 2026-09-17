-- Remove duplicate meetings that have zero races (all on 2026-09-17)
DELETE FROM meetings
WHERE id IN (
  SELECT m.id FROM meetings m
  WHERE NOT EXISTS (SELECT 1 FROM races r WHERE r.meeting_id = m.id)
);

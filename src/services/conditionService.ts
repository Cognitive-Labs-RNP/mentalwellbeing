import { getConditionConfig } from '@/conditions';
import type { ConditionConfig } from '@/types';
import { logActivity, saveConditionProgress } from './storage';

export { getConditionConfig };

export async function markConditionActivityComplete(
  userId: string | undefined,
  conditionId: string,
  activityId: string,
  activityTitle: string,
  durationMinutes = 5
) {
  // Sync condition active status in Supabase if logged in
  if (userId) {
    await saveConditionProgress(userId, conditionId, true);
    await logActivity(userId, {
      condition: conditionId,
      activity_id: activityId,
      activity_name: activityTitle,
      completed: true,
      duration: durationMinutes,
    });
  }
}

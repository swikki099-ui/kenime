import { createServiceClient } from '@/lib/auth/session';

export async function checkRateLimit(
  userId: string,
  actionType: 'deploy' | 'upload' | 'api_call',
  limit: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServiceClient();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const { data: rateLimitData } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .single();

  if (!rateLimitData) {
    await supabase.from('rate_limits').insert({
      user_id: userId,
      action_type: actionType,
      action_count: 1,
      reset_at: tomorrow.toISOString(),
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (new Date(rateLimitData.reset_at) < now) {
    await supabase
      .from('rate_limits')
      .update({
        action_count: 1,
        reset_at: tomorrow.toISOString(),
      })
      .eq('id', rateLimitData.id);
    return { allowed: true, remaining: limit - 1 };
  }

  if (rateLimitData.action_count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await supabase
    .from('rate_limits')
    .update({
      action_count: rateLimitData.action_count + 1,
    })
    .eq('id', rateLimitData.id);

  return {
    allowed: true,
    remaining: Math.max(0, limit - (rateLimitData.action_count + 1)),
  };
}

export async function getRateLimitInfo(userId: string) {
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from('users')
    .select('daily_deploy_limit, max_upload_size_mb')
    .eq('id', userId)
    .single();

  if (!user) {
    return null;
  }

  const { data: rateLimits } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId);

  return {
    deployLimit: user.daily_deploy_limit,
    uploadLimitMB: user.max_upload_size_mb,
    current: rateLimits || [],
  };
}

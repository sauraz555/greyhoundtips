export function isProfileInTrial(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
}

export function isSubscriptionActive(status: string | undefined, profileCreatedAt?: string): boolean {
  return status === 'trialing' || status === 'active' || status === 'past_due' || isProfileInTrial(profileCreatedAt);
}

export function getProfileTrialDaysLeft(createdAt: string | undefined): number {
  if (!createdAt) return 0;
  const createdDate = new Date(createdAt);
  const trialEnd = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

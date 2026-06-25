const ROLE_COLORS: Record<string, string> = {
  super_admin: '#DC2626',
  admin: '#EA580C',
  editor: '#2563EB',
  author: '#059669',
  moderator: '#6B7280',
  scheduler: '#6B7280',
  viewer: '#6B7280',
};

export function roleColor(role?: string | null): string {
  if (!role) return '#6B7280';
  return ROLE_COLORS[role.toLowerCase()] || '#6B7280';
}

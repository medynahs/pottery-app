export type Studio = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  avatarImageUri?: string;
  coverImageUri?: string;
  joinCode?: string;
  ownerId: string;
  createdAt: string;
};

export type StudioMemberRole = 'owner' | 'member';

export type StudioMembership = {
  studioId: string;
  userId: string;
  role: StudioMemberRole;
  joinedAt: string;
};

export type StudioMember = {
  userId: string;
  backendUserId?: string;
  name: string;
  avatarInitial: string;
  avatarImageUri?: string;
  role: StudioMemberRole;
  joinedAt: string;
};

export type AppNotificationKind =
  | 'firing-ready'
  | 'piece-pickup'
  | 'member-joined'
  | 'kiln-alert'
  | 'general';

export type AppNotification = {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  /** Optional deep-link payload (e.g. firingId, pieceId). */
  payload?: Record<string, string>;
};

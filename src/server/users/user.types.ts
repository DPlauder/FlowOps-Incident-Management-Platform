export type UserEntity = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  is_active: number; // 1 = aktiv, 0 = inaktiv
  created_at: string;
  updated_at: string;
};

export type SafeUser = {
  id: string;
  email: string;
  displayName: string;
};
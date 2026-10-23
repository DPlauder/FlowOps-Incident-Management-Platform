export type LoginInput = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  sessionToken: string;
};
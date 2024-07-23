import type { ColumnType } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Account = {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type FavouriteNote = {
  userId: string;
  websiteUrl: string;
  noteRename: string;
  tag: string;
  followerId: string;
};
export type FavouriteUser = {
  userId: string;
  followerId: string;
};
export type FavouriteWebsite = {
  websiteUrl: string;
  websiteRename: string;
  tag: string;
  followerId: string;
};
export type Highlight = {
  id: Generated<number>;
  url: string;
  content: unknown;
  position: unknown;
  comment: unknown | null;
  backgroundColor: string | null;
  privacy: Generated<boolean | null>;
  authorId: string;
};
export type Session = {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
};
export type Stroke = {
  id: Generated<number>;
  url: string;
  position: unknown;
  color: string | null;
  strokeWidth: number;
  privacy: Generated<boolean | null>;
  authorId: string;
  createdAt: Generated<Timestamp>;
};
export type User = {
  id: Generated<string>;
  name: Generated<string>;
  email: string | null;
  emailVerified: Timestamp | null;
  image: string | null;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type Website = {
  id: Generated<number>;
  url: string;
  title: string | null;
  abstract: string | null;
};
export type DB = {
  Account: Account;
  FavouriteNote: FavouriteNote;
  FavouriteUser: FavouriteUser;
  FavouriteWebsite: FavouriteWebsite;
  Highlight: Highlight;
  Session: Session;
  Stroke: Stroke;
  User: User;
  VerificationToken: VerificationToken;
  Website: Website;
};

import type { ColumnType } from "kysely";
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
export type FavoriteNote = {
    userId: string;
    websiteUrl: string;
    noteRename: string;
    tag: string;
    followerId: string;
};
export type FavoriteUser = {
    userId: string;
    followerId: string;
};
export type FavoriteWebsite = {
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
    privacy: Generated<boolean>;
    authorId: string;
};
export type Session = {
    id: Generated<string>;
    sessionToken: string;
    userId: string;
    expires: Timestamp;
};
export type User = {
    id: Generated<string>;
    name: string | null;
    avatar: Buffer | null;
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
    url: string;
    title: string | null;
    abstract: string | null;
};
export type DB = {
    Account: Account;
    FavoriteNote: FavoriteNote;
    FavoriteUser: FavoriteUser;
    FavoriteWebsite: FavoriteWebsite;
    Highlight: Highlight;
    Session: Session;
    User: User;
    VerificationToken: VerificationToken;
    Website: Website;
};

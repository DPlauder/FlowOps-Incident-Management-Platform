export type RegisterInput = {
    email: string,
    password: string,
    displayName: string
};

export type RegisteredUser = {
    id:string,
    email: string,
    displayName: string,
    sessionToken: string
};
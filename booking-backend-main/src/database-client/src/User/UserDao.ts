import { ResetToken, User } from '../Schema';

export interface UserDao {
    addUser(user: Partial<User>): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    addToken(token: string, email: string): Promise<void>;
    getToken(token: string): Promise<ResetToken | null>;
    deleteToken(token: string): Promise<void>;
}
import { User } from "src/user/entities/user.entity";

export class LoginResult {
    access_token: string;
    user: User;
}
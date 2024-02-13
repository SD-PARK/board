import { User } from "src/user/entity/user.entity";

export class LoginResult {
    access_token: string;
    refresh_token: string;
    user: User;
}
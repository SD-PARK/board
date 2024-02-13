import { IAuthModuleOptions } from "@nestjs/passport";

export const passportModuleConfig: IAuthModuleOptions = {
    session: false,
}
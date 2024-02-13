import { ConfigModuleOptions } from "@nestjs/config";

export const configModuleConfig: ConfigModuleOptions = {
    cache: true,
    isGlobal: true,
}
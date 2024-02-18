import { ApiProperty } from "@nestjs/swagger";

export class LoginResult {
    @ApiProperty({ description: 'Access Token' })
    access_token: string;
    
    @ApiProperty({ description: 'Refresh Token' })
    refresh_token?: string;
}
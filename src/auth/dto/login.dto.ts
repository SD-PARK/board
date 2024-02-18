import { CreateUserDto } from "src/user/dto/user.dto";
import { PickType } from "@nestjs/swagger";

export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
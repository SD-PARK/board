import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "src/user/dto/user.dto";

export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
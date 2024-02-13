import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}
    private readonly logger: Logger = new Logger(UserService.name);

    async getUserEmail(email: string): Promise<User> {
        try {
            const col: User = await this.userRepository.findOne({ where: { email: email }});
            if (col)
                return this.omitPassword(col);
            else
                throw new NotFoundException(`'${email}'에 해당하는 계정을 찾을 수 없습니다.`)
        } catch (err) {
            if (err.status == 404)
                throw err;
            else
                this.logger.error(err);
        }
    }

    async getUserAll(): Promise<User[]> {
        try {
            const cols: User[] = await this.userRepository.find();
            const result = cols.map(user => this.omitPassword(user));
            return result;
        } catch (err) {
            this.logger.error(err);
        }
    }

    async getUserEmailForce(email: string): Promise<User> {
        try {
            const col = await this.userRepository.findOne({ where: { email: email }});
            return col;
        } catch (err) {
            this.logger.error(err);
        }
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        if (this.getUserEmailForce(userDto.email))
            throw new ConflictException('이미 존재하는 계정입니다');

        try {
            const hashPassword: string = await bcrypt.hash(userDto.password, 10);
            const result: User = await this.userRepository.save({
                ...userDto,
                password: hashPassword,
            });
            return this.omitPassword(result);
        } catch (err) {
            this.logger.error(err);
        }
    }

    /** User 객체에서 Password 속성 제거 후 반환 */
    omitPassword(user: User): User {
        const { password, ...result } = user;
        return result as User;
    }
}
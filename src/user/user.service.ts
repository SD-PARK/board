import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}
    private readonly logger: Logger = new Logger(UserService.name);

    async getUserId(id: number): Promise<User> {
        try {
            const col: User = await this.userRepository.findOne({ where: { userId: id }});
            if (col)
                return this.omitPassword(col);
            else
                throw new NotFoundException(`[ID: '${id}']에 일치하는 계정을 찾을 수 없습니다.`)
        } catch (err) {
            if (err.status === 404) {
                throw err;
            } else {
                this.logger.error('getUserId');
                throw err;
            }
        }
    }

    async getUserEmail(email: string): Promise<User> {
        try {
            const col: User = await this.userRepository.findOne({ where: { email: email }});
            if (col)
                return this.omitPassword(col);
            else
                throw new NotFoundException(`[Email: '${email}']에 일치하는 계정을 찾을 수 없습니다.`)
        } catch (err) {
            if (err.status === 404) {
                throw err;
            } else {
                this.logger.error('getUserEmail');
                throw err;
            }
        }
    }

    async getUserAll(): Promise<User[]> {
        try {
            const cols: User[] = await this.userRepository.find();
            const result = cols.map(user => this.omitPassword(user));
            return result;
        } catch (err) {
            this.logger.error('getUserAll()');
            throw err;
        }
    }

    async getUserEmailForce(email: string): Promise<User> {
        try {
            const col = await this.userRepository.findOne({ where: { email: email }});
            return col;
        } catch (err) {
            this.logger.error('getUserEmailForce()');
            throw err;
        }
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        const col: User = await this.getUserEmailForce(userDto.email);
        if (col)
            throw new ConflictException('이미 존재하는 계정입니다');

        try {
            const hashPassword: string = await bcrypt.hash(userDto.password, 10);
            const result: User = await this.userRepository.save({
                ...userDto,
                password: hashPassword,
            });
            return this.omitPassword(result);
        } catch (err) {
            this.logger.error('createUser()');
            throw err;
        }
    }

    async patchUser(userId: number, userDto: UpdateUserDto): Promise<User> {
        const col: User = await this.getUserId(userId);
        try {
            const saveCol: User = {
                ...col,
                ...userDto,
            } as User;
            
            if (userDto.password)
                saveCol.password = await bcrypt.hash(userDto.password, 10);

            const result: User = await this.userRepository.save(saveCol);
            return this.omitPassword(result);
        } catch (err) {
            this.logger.error('patchUser()');
            throw err;
        }
    }

    /** User 객체에서 Password 속성 제거 후 반환 */
    omitPassword(user: User): User {
        const { password, ...result } = user;
        return result as User;
    }
}
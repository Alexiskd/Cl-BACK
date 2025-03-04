import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../user/dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            checkEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register with correct data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        newsletter: false
      };

      await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('checkEmail', () => {
    it('should call AuthService.checkEmail with correct email', async () => {
      const email = 'test@example.com';
      await controller.checkEmail({ email });

      expect(service.checkEmail).toHaveBeenCalledWith(email);
    });
  });
});

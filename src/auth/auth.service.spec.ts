import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns the user without the password when credentials are valid', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', '123456');

      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });

    it('returns null when the user does not exist', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.validateUser('missing@test.com', '123456');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('returns null when the password does not match', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@test.com', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('signs a JWT with the user id and email', () => {
      mockJwtService.sign.mockReturnValue('signed-token');

      const result = service.login({ id: '1', email: 'test@test.com' });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@test.com',
        sub: '1',
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('register', () => {
    const dto: CreateUserDto = {
      firstName: 'Test',
      lastName: 'User',
      rut: '11111111-1',
      email: 'new@test.com',
      password: '123456',
    };

    it('throws BadRequestException when the email is already in use', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ id: '1' });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the RUT is already registered', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1' });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('hashes the password and saves the new user', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockImplementation(
        (data: Record<string, unknown>) => data,
      );
      mockUserRepository.save.mockImplementation(
        (data: Record<string, unknown>) => data,
      );

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
      expect(result).toEqual(
        expect.objectContaining({ password: 'hashed-password' }),
      );
    });
  });
});

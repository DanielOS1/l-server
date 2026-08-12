import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupRoleService } from './group-role.service';
import { GroupRole } from './entities/group-role.entity';
import { Group } from '../group/entities/group.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('GroupRoleService', () => {
  let service: GroupRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupRoleService,
        {
          provide: getRepositoryToken(GroupRole),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Group),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(UserGroup),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GroupRoleService>(GroupRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

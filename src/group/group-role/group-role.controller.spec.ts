import { Test, TestingModule } from '@nestjs/testing';
import { GroupRoleController } from './group-role.controller';
import { GroupRoleService } from './group-role.service';

const mockGroupRoleService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GroupRoleController', () => {
  let controller: GroupRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupRoleController],
      providers: [
        {
          provide: GroupRoleService,
          useValue: mockGroupRoleService,
        },
      ],
    }).compile();

    controller = module.get<GroupRoleController>(GroupRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';
import { User } from '../../user/entities/user.entity';
import { GroupRole } from '../group-role/entities/group-role.entity';
import { GroupAccessService } from '../../common/group-access/group-access.service';
import { ROLE_LEVELS } from '../group-role/constants/role-levels.constant';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('GroupService', () => {
  let service: GroupService;
  let groupRepository: ReturnType<typeof mockRepository>;
  let userRepository: ReturnType<typeof mockRepository>;
  let userGroupRepository: ReturnType<typeof mockRepository>;
  let groupRoleRepository: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: getRepositoryToken(Group), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserGroup),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(GroupRole),
          useFactory: mockRepository,
        },
        {
          provide: GroupAccessService,
          useValue: { assertMember: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    groupRepository = module.get(getRepositoryToken(Group));
    userRepository = module.get(getRepositoryToken(User));
    userGroupRepository = module.get(getRepositoryToken(UserGroup));
    groupRoleRepository = module.get(getRepositoryToken(GroupRole));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignRole', () => {
    it('throws when the requester is below MANAGER level', async () => {
      // Promise.all resolves userGroup and requesterUserGroup in order (both via userGroupRepository).
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MEMBER } }),
        ) // userGroup (target)
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.ADMIN } }),
        ); // requesterUserGroup
      groupRoleRepository.findOne.mockResolvedValue({
        level: ROLE_LEVELS.MEMBER,
      });

      await expect(
        service.assignRole('group-1', 'user-1', 'role-1', 'requester-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when trying to assign a role with equal or higher level than the requester', async () => {
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MEMBER } }),
        ) // userGroup (target)
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MANAGER } }),
        ); // requesterUserGroup
      groupRoleRepository.findOne.mockResolvedValue({
        level: ROLE_LEVELS.MANAGER,
      });

      await expect(
        service.assignRole('group-1', 'user-1', 'role-1', 'requester-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when the role being assigned outranks the requester', async () => {
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MEMBER } }),
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.OWNER } }),
        );
      groupRoleRepository.findOne.mockResolvedValue({
        level: ROLE_LEVELS.FOUNDER,
      });

      await expect(
        service.assignRole('group-1', 'user-1', 'role-1', 'requester-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('throws when the FOUNDER tries to leave the group', async () => {
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.FOUNDER } }),
        ) // targetUserGroup
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.FOUNDER } }),
        ); // requesterUserGroup

      await expect(
        service.removeMember('group-1', 'user-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(userGroupRepository.remove).not.toHaveBeenCalled();
    });

    it('throws when the requester is below OWNER level and removes someone else', async () => {
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MEMBER } }),
        ) // targetUserGroup
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.MANAGER } }),
        ); // requesterUserGroup

      await expect(
        service.removeMember('group-1', 'user-2', 'requester-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMember', () => {
    it('throws BadRequestException when the user is already a member', async () => {
      groupRepository.findOne.mockResolvedValue({ id: 'group-1' });
      userRepository.findOne.mockResolvedValue({ id: 'user-1' });
      userGroupRepository.findOne
        .mockImplementationOnce(() =>
          Promise.resolve({ groupRole: { level: ROLE_LEVELS.OWNER } }),
        ) // requesterGroup
        .mockImplementationOnce(() => Promise.resolve({ id: 'existing' })); // existing membership

      await expect(
        service.addMember('group-1', 'user-1', 'requester-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

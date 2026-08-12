import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from 'src/group/user-group/entities/user-group.entity';

@Injectable()
export class GroupAccessService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  async assertMember(userId: string, groupId: string): Promise<UserGroup> {
    const membership = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });
    if (!membership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }
    return membership;
  }
}

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { UserGroup } from 'src/group/user-group/entities/user-group.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

const MIN_NOTICE_LEVEL = 30;

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  private async assertCanManage(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const ug = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
      relations: ['groupRole'],
    });
    if (!ug || !ug.groupRole || ug.groupRole.level < MIN_NOTICE_LEVEL) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar avisos en este grupo',
      );
    }
  }

  async create(dto: CreateNoticeDto, userId: string): Promise<Notice> {
    await this.assertCanManage(userId, dto.groupId);

    const isSent = dto.isSent ?? false;
    const notice = this.noticeRepository.create({
      title: dto.title,
      description: dto.description,
      level: dto.level,
      isSent,
      sentAt: isSent ? new Date() : null,
      sender: { id: userId },
      group: { id: dto.groupId },
    });

    const saved = await this.noticeRepository.save(notice);
    const withRelations = await this.noticeRepository.findOne({
      where: { id: saved.id },
      relations: ['sender', 'group'],
    });
    return withRelations!;
  }

  async findForMembers(groupId: string): Promise<Notice[]> {
    return this.noticeRepository.find({
      where: { group: { id: groupId }, isSent: true, isActive: true },
      relations: ['sender'],
      order: { sentAt: 'DESC' },
    });
  }

  async findForAdmin(groupId: string, userId: string): Promise<Notice[]> {
    await this.assertCanManage(userId, groupId);
    return this.noticeRepository.find({
      where: { group: { id: groupId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateNoticeDto,
    userId: string,
  ): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['group', 'sender'],
    });
    if (!notice) throw new NotFoundException('Aviso no encontrado');
    if (notice.isSent) {
      throw new BadRequestException('No se puede editar un aviso ya enviado');
    }

    await this.assertCanManage(userId, notice.group.id);
    Object.assign(notice, dto);
    return this.noticeRepository.save(notice);
  }

  async send(id: string, userId: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['group', 'sender'],
    });
    if (!notice) throw new NotFoundException('Aviso no encontrado');
    if (notice.isSent) {
      throw new BadRequestException('El aviso ya fue enviado');
    }

    await this.assertCanManage(userId, notice.group.id);
    notice.isSent = true;
    notice.sentAt = new Date();
    return this.noticeRepository.save(notice);
  }

  async deactivate(id: string, userId: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['group', 'sender'],
    });
    if (!notice) throw new NotFoundException('Aviso no encontrado');
    if (!notice.isSent) {
      throw new BadRequestException(
        'Solo se pueden desactivar avisos enviados',
      );
    }
    if (!notice.isActive) {
      throw new BadRequestException('El aviso ya está desactivado');
    }

    await this.assertCanManage(userId, notice.group.id);
    notice.isActive = false;
    return this.noticeRepository.save(notice);
  }
}

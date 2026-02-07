import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  async create(dto: CreateItemDto, userId: string): Promise<Item> {
    return this.itemModel.create({ ...dto, userId });
  }

  async findAll(userId: string): Promise<Item[]> {
    return this.itemModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string): Promise<Item> {
    const item = await this.itemModel.findOne({ _id: id, userId });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, dto: UpdateItemDto, userId: string): Promise<Item> {
    const item = await this.itemModel.findOneAndUpdate(
      { _id: id, userId },
      dto,
      { new: true },
    );
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.itemModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Item not found');
  }
}
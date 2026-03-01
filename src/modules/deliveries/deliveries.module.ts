import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity.js';
import { TypeOrmDeliveryRepository } from './repositories/typeorm-delivery.repository.js';
import { DELIVERY_REPOSITORY } from '../../core/tokens.js';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useClass: TypeOrmDeliveryRepository,
    },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}

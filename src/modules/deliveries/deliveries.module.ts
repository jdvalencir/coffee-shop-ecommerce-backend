import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DELIVERY_REPOSITORY } from '../../core/tokens';
import { TypeOrmDeliveryRepository } from './infraestructure/database/TypeOrmDeliveryRepository';
import { Delivery } from './infraestructure/entities/Delivery.entity';

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

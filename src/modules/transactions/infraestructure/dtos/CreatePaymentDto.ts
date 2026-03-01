import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 25000000, description: 'Monto en centavos' })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
    { message: 'amount debe ser un número entero válido' },
  )
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'tok_test_12345',
    description: 'Token de la tarjeta generado por Wompi',
  })
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @ApiProperty({ example: 'prod-uuid-123', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'cust-uuid-456', description: 'ID del cliente' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Calle Falsa 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Medellín' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Antioquia' })
  @IsString()
  @IsNotEmpty()
  region: string;
}

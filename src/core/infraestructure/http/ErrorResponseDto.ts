import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    example: 404,
    description: 'Codigo HTTP devuelto por la API',
  })
  statusCode: number;

  @ApiProperty({
    example: 'PRODUCT_NOT_FOUND',
    description: 'Codigo interno del error de dominio',
  })
  errorCode: string;

  @ApiProperty({
    example: 'No se encontro un producto con el identificador suministrado',
    description: 'Mensaje legible para el consumidor de la API',
  })
  message: string;
}

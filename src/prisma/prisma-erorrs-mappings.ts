import { HttpStatus } from '@nestjs/common';

export const errorMappings: Record<
  string,
  { status: number; message: string }
> = {
  P2000: { status: HttpStatus.BAD_REQUEST, message: 'Input Data is too long' },
  P2001: { status: HttpStatus.NO_CONTENT, message: 'Record does not exist' },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Reference Data already exists',
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'Foreign key constraint failed on the field',
  },
};

export default errorMappings;

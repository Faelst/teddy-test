import { registerDecorator, ValidationOptions } from 'class-validator';
import { RESERVED } from '../contants/reserved.constants';

export function IsNotReserved(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNotReserved',
      target: object.constructor,
      propertyName,
      options: { message: 'alias is reserved', ...validationOptions },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return true;
          const slug = value.trim().toLowerCase();
          return !RESERVED.has(slug);
        },
      },
    });
  };
}

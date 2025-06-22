import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { isValid } from '@fnando/cpf';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions, 
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && isValid(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'CPF inválido.';
        },
      },
    });
  };
}
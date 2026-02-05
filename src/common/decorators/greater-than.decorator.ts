import { registerDecorator, ValidationArguments } from 'class-validator';

export function IsGreaterThan(property: string, validationOptions?: any) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return !relatedValue || new Date(value) > new Date(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be greater than ${relatedPropertyName}`;
        },
      },
    });
  };
}

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isIdImageValid', async: false })
export class IsIdImageValid implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any; // access the full DTO object
    if (obj.is_id_image) {
      // Validate if value is a URL when is_id_image is true
      const urlRegex = /^(http|https):\/\/[^\s$.?#].[^\s]*$/gm;
      return typeof value === 'string' && urlRegex.test(value);
    } else {
      // Validate if value is a string (not a URL) when is_id_image is false
      return typeof value === 'string';
    }
  }

  defaultMessage(args: ValidationArguments) {
    const obj = args.object as any;
    if (obj.is_id_image) {
      return 'Value must be a valid URL when is_id_image is true';
    }
    return 'Value must be a string when is_id_image is false';
  }
}

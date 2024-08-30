import { ApiProperty } from "@nestjs/swagger";
import { IsBase64, IsDateString, IsNotEmpty, IsString } from "class-validator";

export enum MEASUREMENT_TYPE {
	WATER = "WATER",
	GAS = "GAS",
}

export class UploadMeasurementDTO {
	@ApiProperty({
		name: "image",
		description: "The image of the measurement",
		required: true,
		type: "string",
		example:
			"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBYRXhpZgAATU0AKgAAAAgAA1IBAAABAAEAAAgAA1...",
		format: "base64",
	})
	@IsString({ message: "The image field must be a string." })
	@IsNotEmpty({ message: "The image field cannot be empty." })
	@IsBase64()
	image: string;

	@ApiProperty({
		name: "customer_code",
		description: "The customer code of the measurement",
		required: true,
		type: "string",
		example: "cm0hcw55i000008ky95ngfn2x",
		format: "uuid",
	})
	@IsString({ message: "The customer_code must be a string." })
	@IsNotEmpty({ message: "The customer_code field cannot be empty." })
	customer_code: string;

	@ApiProperty({
		name: "measure_value",
		description: "The date and time of the measurement",
		required: true,
		type: "string",
		example: "2024-08-28T13:10:00.000Z",
		format: "date-time",
	})
	@IsString({ message: "The measure_datetime must be a string." })
	@IsNotEmpty({ message: "The measure_datetime field cannot be empty." })
	@IsDateString()
	measure_datetime: string;

	@ApiProperty({
		name: "measure_value",
		description: "The type of measurement",
		required: true,
		type: "string",
		example: "WATER",
		format: "enum",
		enum: MEASUREMENT_TYPE,
	})
	@IsString({ message: "The measure_type must be a string." })
	@IsNotEmpty({ message: "The measure_type field cannot be empty." })
	measure_type: MEASUREMENT_TYPE;
}

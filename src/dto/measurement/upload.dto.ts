import { IsString, IsNotEmpty, IsBase64, IsDateString } from "class-validator";

export enum MEASUREMENT_TYPE {
	WATER = "WATER",
	GAS = "GAS",
}

export class UploadMeasurementDTO {
	@IsString({ message: "The image field must be a string." })
	@IsNotEmpty({ message: "The image field cannot be empty." })
	@IsBase64()
	image: string;

	@IsString({ message: "The customer_code must be a string." })
	@IsNotEmpty({ message: "The customer_code field cannot be empty." })
	customer_code: string;

	@IsString({ message: "The measure_datetime must be a string." })
	@IsNotEmpty({ message: "The measure_datetime field cannot be empty." })
	@IsDateString()
	measure_datetime: string;

	@IsString({ message: "The measure_type must be a string." })
	@IsNotEmpty({ message: "The measure_type field cannot be empty." })
	measure_type: MEASUREMENT_TYPE;
}

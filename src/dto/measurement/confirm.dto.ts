import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class ConfirmMeasurementDTO {
	@IsString({ message: "The measure_uuid must be a string." })
	@IsNotEmpty({ message: "The measure_uuid field cannot be empty." })
	measure_uuid: string;

	@IsNumber({}, { message: "The confirmed_value must be a number." })
	@IsNotEmpty({ message: "The confirmed_value field cannot be empty." })
	confirmed_value: number;
}

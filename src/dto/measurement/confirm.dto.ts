import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ConfirmMeasurementDTO {
	@ApiProperty({
		name: "measure_uuid",
		description: "The UUID of the measurement to confirm.",
		required: true,
		type: "string",
		example: "cm0hcoqg4000008l831bcasy2",
		format: "uuid",
	})
	@IsString({ message: "The measure_uuid must be a string." })
	@IsNotEmpty({ message: "The measure_uuid field cannot be empty." })
	measure_uuid: string;

	@ApiProperty({
		name: "confirmed_value",
		description: "The confirmed value of the measurement.",
		required: true,
		type: "number",
		example: 123,
		format: "number",
	})
	@IsNumber({}, { message: "The confirmed_value must be a number." })
	@IsNotEmpty({ message: "The confirmed_value field cannot be empty." })
	confirmed_value: number;
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Measurement, MeasurementType } from "@prisma/client";
import { ConfirmMeasurementDTO } from "src/dto/measurement/confirm.dto";
import { UploadMeasurementDTO } from "src/dto/measurement/upload.dto";
import { PrismaService } from "src/service/prisma/prisma.service";
import { existsSync, mkdirSync, writeFile, writeFileSync } from "node:fs";
import { join } from "node:path";

@Injectable()
export class MeasurementService {
	private generativeAI: GoogleGenerativeAI;

	constructor(private prismaService: PrismaService) {
		this.generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
	}

	// Uploads a measurement, processes the image using AI and saves the data in the database
	async uploadMeasurement(uploadMeasurementDto: UploadMeasurementDTO): Promise<{
		image_url: string;
		measure_value: number;
		measure_uuid: string;
	}> {
		const { image, customer_code, measure_datetime, measure_type } =
			uploadMeasurementDto;

		const current_date = new Date(measure_datetime);

		try {
			/* // Generate a unique filename for the image
			const filename = `${customer_code}_${measure_type}_${current_date.toISOString()}.jpg`;
			const uploadDir = join(__dirname, "..", "..", "..", "assets", "uploads");

			// Ensure the directory exists, if not create it
			if (!existsSync(uploadDir)) {
				mkdirSync(uploadDir, { recursive: true });
			}

			// Construct the full file path
			const filePath = join(uploadDir, filename);

			// Save the image locally
			const imageBuffer = Buffer.from(image, "base64");
			await writeFileSync(filePath, imageBuffer);

			// Retrieve the local file URL
			const fileUrl = `http://localhost:3000/uploads/${filename}`; */
			const fileUrl = "http://localhost:3000";

			// Use Gemini AI model to read the meter value from the image
			const model = this.generativeAI.getGenerativeModel({
				model: "gemini-1.5-flash",
			});

			const geminiPrompt = `
				Analyze the meter image and return the measured value. 
				If reading is not possible, return 'UNREADABLE_MEASUREMENT'.
				Only valid numbers are considered.
			`;

			const geminiImage = {
				inlineData: {
					data: image,
					mimeType: "image/jpeg",
				},
			};

			const result = await model.generateContent([geminiPrompt, geminiImage]);

			const responseText = result.response.text().trim();

			// Handle unreadable measurements
			if (
				responseText.includes("UNREADABLE_MEASUREMENT") ||
				!responseText.match(/\d+/)
			) {
				throw new HttpException(
					{
						error_code: "UNREADABLE_MEASUREMENT",
						error_description: "The measurement could not be read",
					},
					HttpStatus.BAD_REQUEST,
				);
			}

			const measureValue = Number.parseFloat(responseText.match(/\d+/)[0]);

			// Check if the customer exists
			const customer = await this.prismaService.customer.findUnique({
				where: {
					id: customer_code,
				},
			});

			if (!customer) {
				throw new HttpException(
					{
						error_code: "CUSTOMER_NOT_FOUND",
						error_description: `Customer with code ${customer_code} not found`,
					},
					HttpStatus.NOT_FOUND,
				);
			}

			// Save the measurement data in the database
			const measurement: Measurement =
				await this.prismaService.measurement.create({
					data: {
						customer: {
							connect: {
								id: customer.id,
							},
						},
						measurement_datetime: current_date,
						measurement_value: measureValue,
						measurement_type: measure_type as MeasurementType,
						image_link: fileUrl,
					},
				});

			console.log(fileUrl);

			// Return the measurement details
			return {
				image_url: fileUrl,
				measure_value: measureValue,
				measure_uuid: measurement.id,
			};
		} catch (error) {
			console.log(error);
			if (error instanceof HttpException) {
				throw error;
			}

			// Handle potential duplicate report error
			if (error.code === "P2002" && error.meta.modelName === "Measurement") {
				throw new HttpException(
					{
						error_code: "DOUBLE_REPORT",
						error_description: "Monthly measurement already reported",
					},
					HttpStatus.CONFLICT,
				);
			}

			// Handle general errors
			throw new HttpException(
				{
					error_code: "INTERNAL_SERVER_ERROR",
					error_description:
						"An error occurred while processing the measurement",
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Confirms the measurement with the given UUID
	async confirmMeasurement(confirmMeasurementDto: ConfirmMeasurementDTO) {
		const { measure_uuid, confirmed_value } = confirmMeasurementDto;

		const measurement = await this.prismaService.measurement.findUnique({
			where: {
				id: measure_uuid,
			},
		});

		// Handle non-existent measurement
		if (!measurement) {
			throw new HttpException(
				{
					error_code: "MEASURE_NOT_FOUND",
					error_description: `Measurement with id ${measure_uuid} not found`,
				},
				HttpStatus.NOT_FOUND,
			);
		}

		// Handle duplicate confirmation
		if (measurement.has_confirmed) {
			throw new HttpException(
				{
					error_code: "CONFIRMATION_DUPLICATE",
					error_description: "Monthly measurement already confirmed",
				},
				HttpStatus.CONFLICT,
			);
		}

		// Update the measurement as confirmed
		await this.prismaService.measurement.update({
			where: {
				id: measure_uuid,
			},
			data: {
				has_confirmed: true,
				measurement_value: confirmed_value,
			},
		});

		return {
			success: true,
		};
	}

	// Lists all measurements for a customer, optionally filtering by type
	async listMeasurements(customerCode: string, measureType?: string) {
		// Validate customer existence
		const customer = await this.prismaService.customer.findUnique({
			where: {
				id: customerCode,
			},
		});

		if (!customer) {
			throw new HttpException(
				{
					error_code: "CUSTOMER_NOT_FOUND",
					error_description: `Customer with code ${customerCode} not found`,
				},
				HttpStatus.NOT_FOUND,
			);
		}

		// Validate measurement type if provided
		if (measureType && !["GAS", "WATER"].includes(measureType)) {
			throw new HttpException(
				{
					error_code: "INVALID_TYPE",
					error_description: `Invalid measurement type ${measureType}`,
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		// Retrieve the measurements from the database
		const measurements = await this.prismaService.measurement.findMany({
			where: {
				customer_id: customer.id,
				...(measureType && {
					measurement_type: measureType as MeasurementType,
				}),
			},
			select: {
				id: true,
				measurement_datetime: true,
				measurement_value: true,
				measurement_type: true,
				has_confirmed: true,
				image_link: true,
			},
		});

		// Return the list of measurements
		return {
			customer_code: customerCode,
			measures: measurements.map((m) => ({
				measure_uuid: m.id,
				measure_datetime: m.measurement_datetime,
				measure_type: m.measurement_type,
				measure_value: m.measurement_value,
				has_confirmed: m.has_confirmed,
				image_url: m.image_link,
			})),
		};
	}
}

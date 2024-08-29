import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UploadMeasurementDTO } from "src/dto/measurement/upload.dto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaService } from "../prisma/prisma.service";
import { FirebaseService } from "../firebase/firebase.service";
import { Measurement, MeasurementType } from "@prisma/client";
import { ConfirmMeasurementDTO } from "src/dto/measurement/confirm.dto";

@Injectable()
export class MeasurementService {
	private generativeAI: GoogleGenerativeAI;

	constructor(
		private prismaService: PrismaService,
		private firebaseService: FirebaseService,
	) {
		this.generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
	}

	async uploadMeasurement(uploadMeasurementDto: UploadMeasurementDTO): Promise<{
		image_url: string;
		measure_value: number;
		measure_uuid: string;
	}> {
		const { image, customer_code, measure_datetime, measure_type } =
			uploadMeasurementDto;

		const current_date = new Date(measure_datetime);

		try {
			const fileUrl = await this.firebaseService.uploadFile(
				Buffer.from(image, "base64"),
				`measurements/${customer_code}/${measure_type + current_date.toISOString()}.jpg`,
			);

			const model = this.generativeAI.getGenerativeModel({
				model: "gemini-1.5-flash",
			});

			const geminiPrompt = `
				Analise a imagem do medidor e retorne o valor medido. 
				Se a leitura não for possível, retorne 'UNREADABLE_MEASUREMENT'.
				Somente números válidos serão considerados.
			`;

			const geminiImage = {
				inlineData: {
					data: image,
					mimeType: "image/jpeg",
				},
			};

			const result = await model.generateContent([geminiPrompt, geminiImage]);

			const responseText = result.response.text().trim();

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
						image_link: fileUrl[0],
					},
				});

			return {
				image_url: fileUrl[0],
				measure_value: measureValue,
				measure_uuid: measurement.id,
			};
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			if (error.code === "P2002" && error.meta.modelName === "Measurement") {
				throw new HttpException(
					{
						error_code: "DOUBLE_REPORT",
						error_description: "Monthly measurement already reported",
					},
					HttpStatus.CONFLICT,
				);
			}

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

	async confirmMeasurement(confirmMeasurementDto: ConfirmMeasurementDTO) {
		const { measure_uuid, confirmed_value } = confirmMeasurementDto;

		const measurement = await this.prismaService.measurement.findUnique({
			where: {
				id: measure_uuid,
			},
		});

		if (!measurement) {
			throw new HttpException(
				{
					error_code: "MEASURE_NOT_FOUND",
					error_description: `Measurement with id ${measure_uuid} not found`,
				},
				HttpStatus.NOT_FOUND,
			);
		}

		if (measurement.has_confirmed) {
			throw new HttpException(
				{
					error_code: "CONFIRMATION_DUPLICATE",
					error_description: "Monthly measurement already confirmed",
				},
				HttpStatus.CONFLICT,
			);
		}

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

	async listMeasurements(customerCode: string, measureType?: string) {
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

		if (measureType && !["GAS", "WATER"].includes(measureType)) {
			throw new HttpException(
				{
					error_code: "INVALID_TYPE",
					error_description: `Invalid measurement type ${measureType}`,
				},
				HttpStatus.BAD_REQUEST,
			);
		}

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

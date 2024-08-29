import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ConfirmMeasurementDTO } from "src/dto/measurement/confirm.dto";
import { UploadMeasurementDTO } from "src/dto/measurement/upload.dto";
import { MeasurementService } from "src/service/measurement/measurement.service";

@Controller("v1/measurement")
export class MeasurementController {
    constructor(private readonly measurementService: MeasurementService) {}

    // Endpoint to upload a measurement
    @Post('upload')
    async uploadMeasurement(@Body() uploadMeasurementDto: UploadMeasurementDTO) {
        try {
            return await this.measurementService.uploadMeasurement(uploadMeasurementDto);
        } catch (error) {
            // If we have an HttpException (previously thrown by the service), re-throw it
            if (error instanceof HttpException) {
                throw error;
            }

            // If not, return a generic server error
            throw new HttpException(
                {
                    error_code: "INTERNAL_SERVER_ERROR",
                    error_description: "An unexpected error occurred.",
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Endpoint to confirm a measurement
    @Patch('confirm')
    async confirmMeasurement(@Body() confirmMeasurementDto: ConfirmMeasurementDTO) {
        try {
            return await this.measurementService.confirmMeasurement(confirmMeasurementDto);
        } catch (error) {
            // If we have an HttpException (previously thrown by the service), re-throw it
            if (error instanceof HttpException) {
                throw error;
            }

            // If not, return a generic server error
            throw new HttpException(
                {
                    error_code: "INTERNAL_SERVER_ERROR",
                    error_description: "An unexpected error occurred.",
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Endpoint to list measurements for a specific customer
    @Get(':customer_code/list')
    async listMeasurements(
        @Param('customer_code') customerCode: string,
        @Query('measure_type') measureType?: string,
    ) {
        try {
            return await this.measurementService.listMeasurements(customerCode, measureType);
        } catch (error) {
            // If we have an HttpException (previously thrown by the service), re-throw it
            if (error instanceof HttpException) {
                throw error;
            }

            // If not, return a generic server error
            throw new HttpException(
                {
                    error_code: "INTERNAL_SERVER_ERROR",
                    error_description: "An unexpected error occurred.",
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
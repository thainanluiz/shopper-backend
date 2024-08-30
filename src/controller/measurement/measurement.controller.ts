import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConfirmMeasurementDTO } from "src/dto/measurement/confirm.dto";
import { UploadMeasurementDTO } from "src/dto/measurement/upload.dto";
import { MeasurementService } from "src/service/measurement/measurement.service";

@Controller("v1/measurement")
export class MeasurementController {
    constructor(private readonly measurementService: MeasurementService) {}

    // Endpoint to upload a measurement
    @ApiTags('measurement')
    @ApiBody({
        type: UploadMeasurementDTO,
        description: "The data required to upload a measurement.",
        required: true,
    })
    @ApiResponse({
        status: 201,
        description: "The measurement was successfully uploaded.",
        example: {
            image_url: "https://...",
            measure_value: 123,
            measure_uuid: "cm0hcoqg4000008l831bcasy2"
        }
    })
    @ApiResponse({
        status: 400,
        description: "The measurement could not be read.",
        example: {
            error_code: "UNREADABLE_MEASUREMENT",
            error_description: "The measurement could not be read.",
        }
    })
    @ApiResponse({
        status: 404,
        description: "The customer could not be found.",
        example: {
            error_code: "CUSTOMER_NOT_FOUND",
            error_description: "Customer with code X not found.",
        }
    })
    @ApiResponse({
        status: 409,
        description: "The monthly measurement already exists.",
        example: {
            error_code: "DOUBLE_REPORT",
            error_description: "Monthly measurement already reported.",
        }
    })
    @ApiResponse({
        status: 500,
        description: "An unexpected error occurred.",
        example: {
            error_code: "INTERNAL_SERVER_ERROR",
            error_description: "An unexpected error occurred.",
        }
    })
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
    @ApiTags('measurement')
    @ApiBody({
        type: ConfirmMeasurementDTO,
        description: "The data required to confirm a measurement.",
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: "The measurement was successfully confirmed.",
        example: {
            success: "true",
        }
    })
    @ApiResponse({
        status: 404,
        description: "The measurement could not be found.",
        example: {
            error_code: "MEASURE_NOT_FOUND",
            error_description: "Measurement with id X not found.",
        }
    })
    @ApiResponse({
        status: 409,
        description: "The measurement has already been confirmed.",
        example: {
            error_code: "CONFIRMATION_DUPLICATE",
            error_description: "Monthly measurement already confirmed.",
        }
    })
    @ApiResponse({
        status: 500,
        description: "An unexpected error occurred.",
        example: {
            error_code: "INTERNAL_SERVER_ERROR",
            error_description: "An unexpected error occurred.",
        }
    })
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
    @ApiTags('measurement')
    @ApiParam({
        name: 'customer_code',
        description: 'The customer code to list measurements for.',
        required: true,
        type: 'string',
        example: 'cm0hcw55i000008ky95ngfn2x',
        format: 'uuid'
    })
    @ApiQuery({
        name: 'measure_type',
        description: 'The type of measurement to filter by.',
        required: false,
        type: 'string',
        examples: {
            water: {
                value: 'WATER',
                summary: 'Filter by water measurements.'
            },
            gas: {
                value: 'GAS',
                summary: 'Filter by gas measurements.'
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: "The measurements were successfully retrieved.",
        example: [
            {
                customer_code: "cm0hcw55i000008ky95ngfn2x",
                measures: [
                    {
                        measure_uuid: "cm0hcoqg4000008l831bcasy2",
                        measure_datetime: "2024-08-28T13:10:00.000Z",
                        measure_type: "WATER",
                        measure_value: 123,
                        has_confirmed: true,
                        image_url: "https://...",
                    },
                ],
            }
        ]
    })
    @ApiResponse({
        status: 400,
        description: "The measurement type is invalid.",
        example: {
            error_code: "INVALID_TYPE",
            error_description: "Invalid measurement type X.",
        }
    })
    @ApiResponse({
        status: 404,
        description: "The customer could not be found.",
        example: {
            error_code: "CUSTOMER_NOT_FOUND",
            error_description: "Customer with code X not found.",
        }
    })
    @ApiResponse({
        status: 500,
        description: "An unexpected error occurred.",
        example: {
            error_code: "INTERNAL_SERVER_ERROR",
            error_description: "An unexpected error occurred.",
        }
    })
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
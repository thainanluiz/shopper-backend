import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { UploadMeasurementDTO } from "src/dto/measurement/upload.dto";
import { MeasurementService } from "src/service/measurement/measurement.service";

@Controller("v1/measurement")
export class MeasurementController {
    constructor(private readonly measurementService: MeasurementService) {}
    
    @Post('upload')
    async uploadMeasurement(@Body() uploadMeasurementDto: UploadMeasurementDTO) {
        try {
            return await this.measurementService.uploadMeasurement(uploadMeasurementDto);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

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

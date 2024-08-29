import { Module } from "@nestjs/common";
import { MeasurementController } from "src/controller/measurement/measurement.controller";
import { FirebaseService } from "src/service/firebase/firebase.service";
import { MeasurementService } from "src/service/measurement/measurement.service";
import { PrismaService } from "src/service/prisma/prisma.service";

@Module({
	controllers: [MeasurementController],
	providers: [MeasurementService, PrismaService, FirebaseService],
})
export class MeasurementModule {}

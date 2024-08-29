import { Module } from "@nestjs/common";
import { MeasurementModule } from "./module/measurement/measurement.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [ConfigModule.forRoot(), MeasurementModule],
})
export class AppModule {}

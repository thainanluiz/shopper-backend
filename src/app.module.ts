import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { MeasurementModule } from "./module/measurement/measurement.module";

@Module({
	imports: [ConfigModule.forRoot(), MeasurementModule],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes({ path: "*", method: RequestMethod.ALL });
	}
}

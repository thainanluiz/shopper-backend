import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { MeasurementModule } from "./module/measurement/measurement.module";
import { MulterModule } from "@nestjs/platform-express";

@Module({
	imports: [
		ConfigModule.forRoot(),
		MulterModule.register({ dest: "/assets/uploads" }),
		MeasurementModule,
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes({ path: "*", method: RequestMethod.ALL });
	}
}

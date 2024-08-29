import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix("api");
	app.use(json({ limit: "50mb" }));
	app.use(urlencoded({ extended: true, limit: "50mb" }));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			exceptionFactory(errors) {
				return new BadRequestException({
					error_code: "INVALID_DATA",
					error_description: "Validation failed",
					errors: errors.map((error) => ({
						field: error.property,
						constraints: error.constraints,
					})),
				});
			},
		}),
	);
	await app.listen(3000);
}
bootstrap();

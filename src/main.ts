import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { join } from "node:path";
import * as express from "express";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Set a global prefix for all routes
	app.setGlobalPrefix("api");

	// Configure middleware for JSON and URL-encoded payloads with a size limit of 50MB
	app.use(json({ limit: "50mb" }));
	app.use(urlencoded({ extended: true, limit: "50mb" }));

	// Apply global validation pipe with custom exception handling
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

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle("Shopper API Documentation")
		.setDescription("API for managing measurements")
		.setVersion("1.0")
		.addTag("measurement")
		.build();

	// Create the Swagger document
	const document = SwaggerModule.createDocument(app, config);

	// Serve the Swagger document
	SwaggerModule.setup("docs", app, document, {
		jsonDocumentUrl: "/docs-json",
	});

	// Serve static files from the uploads directory
	app.use(
		"/uploads",
		express.static(join(__dirname, "..", "assets", "uploads")),
	);

	// Start the application on port 3000
	await app.listen(process.env.PORT || 3000);
}

bootstrap();

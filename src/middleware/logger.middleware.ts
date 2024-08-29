import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		// Log the current date/time, HTTP method, and requested URL
		console.log(new Date().toLocaleString(), req.method, req.originalUrl);
		next(); // Pass
	}
}

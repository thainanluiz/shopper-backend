import { Injectable } from "@nestjs/common";
import { firebaseStorage } from "../../configuration/firebase.config";

@Injectable()
export class FirebaseService {
	// Save the file into Firebase Storage and return a signed URL for accessing it
	async uploadFile(buffer: Buffer, destination: string): Promise<string[]> {
		const file = firebaseStorage.bucket().file(destination);

		// Save the file to Firebase Storage
		await file.save(buffer);

		// Return a signed URL for accessing the uploaded file, valid for 7 days
		return file.getSignedUrl({
			action: "read",
			expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		});
	}
}

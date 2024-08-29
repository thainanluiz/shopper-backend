import { Injectable } from "@nestjs/common";
import { firebaseStorage } from "../../configuration/firebase.config";

@Injectable()
export class FirebaseService {
	async uploadFile(buffer: Buffer, destination: string) {
		const file = firebaseStorage.bucket().file(destination);

		await file.save(buffer);

		return file.getSignedUrl({
			action: "read",
			expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		});
	}
}

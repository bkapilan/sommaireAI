import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
        .middleware(async ({ req }) => {
            // Get user info
            const user = await currentUser();

            if (!user) throw new UploadThingError("Unauthorized");

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("\n\nourFileRouter\n--------------------------------");
            console.log("Upload completed for user id", metadata.userId);
            console.log("File ufsUrl: ", file.ufsUrl); // Updated to use `ufsUrl`
            return { userId: metadata?.userId, fileUrl: file.ufsUrl }; // Ensure JSON-compatible return
        }),
} satisfies FileRouter;

export type ourFileRouter = typeof ourFileRouter;
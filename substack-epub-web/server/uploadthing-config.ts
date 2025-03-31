import { createUploadthing, type FileRouter } from "uploadthing/server";
import fs from "fs";
import path from "path";

// Create the uploadthing instance
const f = createUploadthing();

// Define the file router
export const fileRouter = {
  // Define an endpoint for uploading EPUB files
  epubUploader: f({ blob: { maxFileSize: "16MB" } })
    .middleware(async () => {
      // This code runs on your server before upload
      return {
        // This is where we'd do auth or add other server-side context
        // Returned values can be accessed in onUploadComplete
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for file:", file.name);
      console.log("Metadata:", metadata);

      // Return response to client
      return {
        uploadedBy: "Substack EPUB Converter",
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        timestamp: metadata.timestamp,
      };
    }),
} satisfies FileRouter;

// Export the type for client-side use if needed
export type OurFileRouter = typeof fileRouter;

// Helper function to upload a file from the server to UploadThing
export async function uploadFileToUploadThing(
  filePath: string,
  fileName: string,
) {
  try {
    console.log(`Starting upload of file: ${fileName} from path: ${filePath}`);

    // Verify file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }

    // Check if we have an API key and log it safely (only first few chars)
    const apiKey = process.env.UPLOADTHING_SECRET;
    if (!apiKey) {
      throw new Error("UPLOADTHING_TOKEN not set in environment variables");
    }

    // Log a safer version of the key for debugging (first 5 chars only)
    const safeKeyPreview =
      apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 4);
    console.log(`Using UploadThing API key: ${safeKeyPreview}`);

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    const fileType = "application/epub+zip";

    console.log("Uploading file to UploadThing REST API...");

    // Create the payload according to the API docs
    const payload = JSON.stringify({
      files: [
        {
          name: fileName,
          size: fileSize,
          type: fileType,
          customId: null,
        },
      ],
      acl: "public-read",
      metadata: {
        source: "server-side-upload",
        createdAt: new Date().toISOString(),
      },
      contentDisposition: "inline",
    });

    // STEP 1: Initialize the upload with UploadThing API
    console.log("Step 1: Initializing upload with UploadThing...");
    const response = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": apiKey, // Correct case: lowercase 't' in 'thing'
        Accept: "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Upload initialization failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("UploadThing initialization response:", JSON.stringify(result, null, 2));

    // The file information is in result.data[0] since it's an array
    if (!result.data || !result.data[0]) {
      throw new Error("Invalid response format from UploadThing API");
    }
    
    const fileData = result.data[0];
    
    // STEP 2: Upload the actual file content to S3 using the presigned URL and form fields
    console.log("Step 2: Uploading file content to S3...");
    
    if (!fileData.url || !fileData.fields) {
      throw new Error("Missing S3 upload information in UploadThing response");
    }
    
    // Create a form for the S3 upload
    const formData = new FormData();
    
    // Add all the fields from the response to the form data
    Object.entries(fileData.fields).forEach(([key, value]) => {
      if (typeof value === 'string') {
        formData.append(key, value);
      } else {
        console.warn(`Skipping field ${key} as it's not a string`);
      }
    });
    
    // Add the file as the last field
    formData.append("file", new Blob([fileBuffer], { type: fileType }));
    
    // Upload to S3
    console.log(`Uploading to S3 URL: ${fileData.url}`);
    const s3Response = await fetch(fileData.url, {
      method: "POST",
      body: formData,
    });
    
    if (!s3Response.ok) {
      const s3ErrorText = await s3Response.text();
      throw new Error(
        `S3 upload failed: ${s3Response.status} ${s3Response.statusText} - ${s3ErrorText}`,
      );
    }
    
    console.log("File content uploaded successfully to S3");
    
    // Format the response to match what our application expects
    return {
      fileUrl: fileData.fileUrl,
      fileKey: fileData.key, 
      fileName: fileName,
      fileSize: fileSize,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error uploading file to UploadThing:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

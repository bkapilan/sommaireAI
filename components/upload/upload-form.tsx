'use client';

import { z } from "zod";
import UploadFormInput from "./upload-form-input";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { generatePdfSummary } from "@/actions/upload-actions";
import { useRef, useState } from "react";

const schema = z.object({
    file: z.instanceof(File, {message: 'Invalid file'}).
    refine(
        (file) => file.size <= 20 * 1024 * 1024,
        'File size must be less than 20MB'
    )
    .refine(
        (file) => file.type.startsWith('application/pdf'),
        'File must be a PDF'
    ),
});

export default function UploadForm() {

    const formRef = useRef<HTMLFormElement>(null);

    const [isLoading, setIsLoading] = useState(false);


    const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
        onClientUploadComplete: () => {
          console.log("startUpload: Uploaded successfully!");
          toast.success("Uploaded successfully.");
          
        },
        onUploadError: (err) => {
            console.error("error occurred while uploading", err);
            toast.error("Error occurred while uploading.");

        },
        onUploadBegin: (fileUrl: string) => {
          console.log("upload has begun for", fileUrl);
          toast.success("Upload has begun.");
        },
      });



    const handleSubmit = async (e: React.FocusEvent<HTMLFormElement>) => {
        e.preventDefault();


        try {
            setIsLoading(true);
            console.log('handleSubmit: Submitted!');
            const formData = new FormData(e.currentTarget);
            const file = formData.get('file') as File;
    
    
            //validating the fields
            const validatedFields = schema.safeParse({ file });
    
            // console.log(validatedFields);
    
            if (!validatedFields.success) {
                console.log(
                    validatedFields.error.flatten().fieldErrors.file?.
                    [0] ?? 'Invalid file'
                );
                toast.warning("Something went wrong.");
                setIsLoading(false);
                return;
            }
    
            toast.info("We are uploading your PDF.");
    
            //schema with zod
    
    
            //upload the file to uploadthing
    
            const resp = await startUpload([file]);
            if(!resp) {
                toast.warning("Something went wrong. Please use a different file.");
                setIsLoading(false);
                return;
            }
    
            toast.info("Hang tigh! Our AI is reading through your document.");
    
            //parse the pdf using lang chain
    
            // console.log("\n\nresp\n--------",resp);
    
            const transformedResp = resp.map(file => ({
                serverData: {
                    userId: file.serverData.userId,
                    file: {
                        url: file.ufsUrl,
                        name: file.name || "unknown", // Provide a default name if not available
                    },
                },
            }));
    
            const result = await generatePdfSummary(transformedResp as [{
                serverData: {
                    userId: string;
                    file: {
                        url: string;
                        name: string;
                    };
                };
            }]);
            // console.log("\n\nsummary\n--------",{result});
    
            // parse the pdf using lang chain
            const { data = null, message = null } = result || {};
    
            if (data) {
                toast.info("Hang tigh! We are saving your summary.");
    
                formRef.current?.reset();
    
                if(data.summary) {
                    toast.success("\n\nYour summary is ready.\n\n");
                    //save the summary to the database
                }

            }
    
            //summarize the pdf using AI
            
            //redirect to the [id] summary page


        } catch (error) {
            console.error("Error occurred while uploading", error);
            toast.error("Error occurred while uploading.");
            setIsLoading(false);
            formRef.current?.reset();
        }


    };

    return (
      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
      </div>
    );
}

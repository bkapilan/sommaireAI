'use client';

import { z } from "zod";
import UploadFormInput from "./upload-form-input";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();


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
    
            console.log("\n\nresp\n--------",resp);
    
            const transformedResp = resp.map(file => ({
                serverData: {
                    userId: file.serverData.userId,
                    file: {
                        url: file.ufsUrl,
                        name: file.name || "unknown", // Provide a default name if not available
                    },
                },
            }));
    
            //summarize the pdf using AI
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

                let storeResult: any;

                toast.info("Hang tigh! We are saving your summary.");
    
                formRef.current?.reset();

                if(data.summary) {
                    toast.success("\n\nYour summary is ready.\n\n");
                    //save the summary to the database
                    storeResult = await storePdfSummaryAction({
                        userId: resp[0].serverData.userId,
                        fileUrl: resp[0].ufsUrl,
                        summary: data.summary,
                        title: data.title,
                        fileName: file.name,

                    });
                    toast.success("Your PDF has been summarized and saved.");
                    console.log("\n\nstoreResult\n--------", {storeResult});
                }

                formRef.current?.reset();
                //redirect to the [id] summary page
                router.push(`/summaries/${storeResult.data.id}`);

            }
    


        } catch (error) {
            console.error("Error occurred while uploading", error);
            toast.error("Error occurred while uploading.");
            setIsLoading(false);
            formRef.current?.reset();
        } finally {
            setIsLoading(false);
        }


    };

    return (
      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
      </div>
    );
}

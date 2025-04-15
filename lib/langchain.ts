import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(ufsUrl:string) {

    const response = await fetch(ufsUrl);
    const blob = await response.blob();

    const arrayBuffer = await blob.arrayBuffer();

    // console.log("\n\narrayBuffer\n-----------------", {arrayBuffer});

    const loader = new PDFLoader(new Blob([arrayBuffer]));

    const docs = await loader.load();

    // console.log("\n\ndocs\n-----------------", docs.map((doc) => doc.pageContent).join('\n'));

    //combine all pages
    return docs.map((doc) => doc.pageContent).join('\n');
}



// export async function fetchAndExtractPdfText(ufsUrl:string) {
//     const response = await fetch(ufsUrl);
//     const blob = await response.blob();

//     const arrayBuffer = await blob.arrayBuffer();

//     const loader = new PDFLoader(new Blob([arrayBuffer]));

//     const docs = await loader.load();

//     //combine all pages
//     return docs.map((doc) => doc.pageContent).join('\n');
// }
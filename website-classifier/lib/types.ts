export type Category = "Ecommerce" | "Social / UGC" | "News / Media" | "Other";

export interface ClassifyResponse {
    url: string;
    title: string;
    category: Category;
    explanation: string;
    confidence: number;
    cached: boolean;
    processingMs: number;
}

export interface ClassifyError {
    error: string;
}
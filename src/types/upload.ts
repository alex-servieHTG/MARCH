export interface UploadResult {
  fileId: string;
  url: string;
  AITags?: Array<{ name: string; confidence: number }>;
}
export interface FileUploadAntD extends File {
  uid: string;
}

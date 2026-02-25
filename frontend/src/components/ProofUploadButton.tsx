import React, { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { useUploadProof, useMarkComplete } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProofUploadButtonProps {
  taskId: bigint;
  hasExistingProof?: boolean;
}

export default function ProofUploadButton({
  taskId,
  hasExistingProof = false,
}: ProofUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(hasExistingProof);

  const uploadProof = useUploadProof();
  const markComplete = useMarkComplete();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or PDF files are allowed.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await uploadProof.mutateAsync({ taskId, file: blob });
      setProofUploaded(true);
      toast.success('Proof uploaded! You can now mark the task as completed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await markComplete.mutateAsync(taskId);
      toast.success('Task marked as completed! Awaiting admin review.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to mark complete';
      toast.error(`Error: ${message}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Upload Proof Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full border-task-blue text-task-blue hover:bg-blue-50"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || uploadProof.isPending}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading…
          </>
        ) : proofUploaded ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Re-upload Proof
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Proof
          </>
        )}
      </Button>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <Progress value={uploadProgress} className="h-1.5" />
      )}

      {/* Mark as Completed Button */}
      <Button
        size="sm"
        className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
        onClick={handleMarkComplete}
        disabled={!proofUploaded || markComplete.isPending || isUploading}
      >
        {markComplete.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Mark as Completed
          </>
        )}
      </Button>

      {!proofUploaded && (
        <p className="text-xs text-gray-400 text-center">Upload proof first to mark as completed</p>
      )}
    </div>
  );
}

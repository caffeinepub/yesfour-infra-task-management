import React, { useRef, useState } from 'react';
import { ExternalBlob } from '../backend';
import { useUploadProof } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProofUploadButtonProps {
  taskId: bigint;
  submittedByName: string;
  submittedByEmail: string;
}

export default function ProofUploadButton({
  taskId,
  submittedByName,
  submittedByEmail,
}: ProofUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadProof = useUploadProof();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or PDF files are allowed.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await uploadProof.mutateAsync({
        taskId,
        file: blob,
        submittedByName,
        submittedByEmail,
      });

      toast.success('Proof uploaded successfully! Status changed to Pending Review.');
      setUploadProgress(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload proof.');
      setUploadProgress(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadProof.isPending || uploadProgress !== null;

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2 border-brand-green text-brand-green hover:bg-green-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Uploading...'}
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            Upload Proof
          </>
        )}
      </Button>
    </div>
  );
}

import { useRef, useState } from 'react';
import { ExternalBlob } from '../backend';
import { useUploadProof } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface ProofUploadButtonProps {
  taskId: bigint;
  onSuccess?: () => void;
}

export default function ProofUploadButton({ taskId, onSuccess }: ProofUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadProof = useUploadProof();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are accepted.');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setUploadProgress(0);

      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await uploadProof.mutateAsync({ taskId, file: blob });
      setUploadProgress(null);
      toast.success('Proof uploaded successfully! Task is now under review.');
      onSuccess?.();
    } catch (err: unknown) {
      setUploadProgress(null);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg.includes('deadline') ? 'Task deadline has passed. Cannot upload proof.' : 'Failed to upload proof. Please try again.');
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadProof.isPending}
        className="bg-task-blue hover:bg-task-blue/90 text-white text-xs"
      >
        {uploadProof.isPending ? (
          <>
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-3 h-3 mr-1.5" />
            Upload Proof
          </>
        )}
      </Button>
      {uploadProgress !== null && (
        <Progress value={uploadProgress} className="h-1.5" />
      )}
    </div>
  );
}

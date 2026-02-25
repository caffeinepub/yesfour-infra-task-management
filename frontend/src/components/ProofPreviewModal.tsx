import React from 'react';
import { Download, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalBlob } from '../backend';

interface ProofPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofFile: ExternalBlob;
  submittedBy?: string;
  submittedByEmail?: string;
  submissionTimestamp?: bigint;
}

function formatTimestamp(ns?: bigint): string {
  if (ns == null) return 'Unknown';
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString();
}

export default function ProofPreviewModal({
  open,
  onOpenChange,
  proofFile,
  submittedBy,
  submittedByEmail,
  submissionTimestamp,
}: ProofPreviewModalProps) {
  const directUrl = proofFile.getDirectURL();
  const isImage = directUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Proof Preview</DialogTitle>
          <DialogDescription>
            {submittedBy && (
              <span>
                Submitted by <strong>{submittedBy}</strong>
                {submittedByEmail && ` (${submittedByEmail})`}
                {submissionTimestamp != null && ` on ${formatTimestamp(submissionTimestamp)}`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded overflow-hidden border bg-gray-50 flex items-center justify-center min-h-[200px]">
          {isImage ? (
            <img
              src={directUrl}
              alt="Proof"
              className="max-w-full max-h-[400px] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-gray-400">
              <FileText className="w-16 h-16" />
              <span className="text-sm">PDF Document</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button asChild>
            <a href={directUrl} download>
              <Download className="w-4 h-4 mr-1" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { ExternalBlob } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, Loader2 } from 'lucide-react';

interface ProofPreviewModalProps {
  open: boolean;
  onClose: () => void;
  proofFile: ExternalBlob;
  submittedBy?: string;
  submittedByEmail?: string;
  submissionTimestamp?: bigint;
  taskTitle?: string;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

export default function ProofPreviewModal({
  open,
  onClose,
  proofFile,
  submittedBy,
  submittedByEmail,
  submissionTimestamp,
  taskTitle,
}: ProofPreviewModalProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !proofFile) return;
    setLoading(true);
    try {
      const url = proofFile.getDirectURL();
      // Determine if it's an image by checking URL extension
      const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
      setIsImage(isImg);
      setProofUrl(url);
    } catch {
      setProofUrl(null);
    } finally {
      setLoading(false);
    }
  }, [open, proofFile]);

  const handleDownload = () => {
    if (!proofUrl) return;
    const a = document.createElement('a');
    a.href = proofUrl;
    a.download = `proof-${taskTitle || 'task'}.file`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-brand-green font-semibold">
            Proof Preview {taskTitle ? `— ${taskTitle}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            {submittedBy && (
              <div className="flex gap-2">
                <span className="text-gray-500 font-medium w-32">Submitted By:</span>
                <span className="text-gray-800">
                  {submittedBy}
                  {submittedByEmail ? ` (${submittedByEmail})` : ''}
                </span>
              </div>
            )}
            {submissionTimestamp && (
              <div className="flex gap-2">
                <span className="text-gray-500 font-medium w-32">Submitted At:</span>
                <span className="text-gray-800">{formatTimestamp(submissionTimestamp)}</span>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-48 flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Loading preview...</span>
              </div>
            ) : proofUrl && isImage ? (
              <img
                src={proofUrl}
                alt="Proof"
                className="max-w-full max-h-96 object-contain"
              />
            ) : proofUrl ? (
              <div className="flex flex-col items-center gap-3 p-8 text-gray-500">
                <FileText className="w-16 h-16 text-gray-300" />
                <p className="text-sm font-medium">PDF / Document File</p>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Open in new tab
                </a>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">Preview unavailable</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!proofUrl}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Proof
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

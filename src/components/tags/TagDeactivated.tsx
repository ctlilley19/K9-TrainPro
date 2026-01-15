'use client';

import { ShieldX, AlertTriangle } from 'lucide-react';

interface TagDeactivatedProps {
  tag: {
    tag_code: string;
    deactivated_reason?: string;
  };
}

export function TagDeactivated({ tag }: TagDeactivatedProps) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX size={40} className="text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Tag Deactivated</h1>

        <p className="text-surface-400 mb-6">
          This tag has been deactivated and is no longer active.
        </p>

        {tag.deactivated_reason && (
          <div className="bg-surface-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Reason</span>
            </div>
            <p className="text-surface-300 text-sm">{tag.deactivated_reason}</p>
          </div>
        )}

        <p className="text-sm text-surface-500">
          Tag ID: {tag.tag_code}
        </p>

        <div className="mt-8 pt-6 border-t border-surface-800">
          <p className="text-xs text-surface-600">
            Powered by K9 ProTrain
          </p>
        </div>
      </div>
    </div>
  );
}

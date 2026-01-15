'use client';

import Link from 'next/link';
import { Tag, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TagNotAssignedProps {
  tag: {
    tag_code: string;
  };
  isAuthenticated: boolean;
}

export function TagNotAssigned({ tag, isAuthenticated }: TagNotAssignedProps) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-6">
          <Tag size={40} className="text-surface-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Tag Not Set Up</h1>

        <p className="text-surface-400 mb-6">
          This tag hasn&apos;t been assigned to a pet yet.
        </p>

        <div className="bg-surface-800/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-surface-300">
            Tag ID: <span className="font-mono text-brand-400">{tag.tag_code}</span>
          </p>
        </div>

        {isAuthenticated ? (
          <Link href="/tags">
            <Button variant="primary" leftIcon={<Tag size={16} />}>
              Manage Tags
            </Button>
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-surface-500 mb-4">
              If you own this tag, sign in to assign it to your pet.
            </p>
            <Link href="/login">
              <Button variant="primary" leftIcon={<LogIn size={16} />}>
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-surface-800">
          <p className="text-xs text-surface-600">
            Powered by K9 ProTrain
          </p>
        </div>
      </div>
    </div>
  );
}

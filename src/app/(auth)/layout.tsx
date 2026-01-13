import { Dog } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-brand-600 to-brand-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Dog size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">K9 TrainPro</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Professional Dog Training Management
          </h1>
          <p className="text-white/80 text-lg">
            Streamline your facility with real-time updates, automated reports,
            and tools that keep pet parents engaged.
          </p>
        </div>

        <div className="flex items-center gap-4 text-white/60 text-sm">
          <span>&copy; {new Date().getFullYear()} Lazy E Holdings LLC</span>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

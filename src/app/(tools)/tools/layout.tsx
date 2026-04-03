import GlobalHeader from '@/components/branding/GlobalHeader';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GlobalHeader />
      {children}
    </div>
  );
}

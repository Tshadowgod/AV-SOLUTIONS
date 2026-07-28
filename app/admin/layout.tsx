export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen bg-[#0c1222] text-[#e8ecf4]">
      {children}
    </div>
  );
}

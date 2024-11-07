function Settings() {
  return <div className="fixed right-0 top-0 rounded-bl bg-slate-400 p-2">Settings goes here</div>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Settings />
    </>
  );
}

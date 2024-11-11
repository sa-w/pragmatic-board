import { Settings } from './settings';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Settings />
    </>
  );
}

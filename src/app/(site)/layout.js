import Header from "../components/header";


export default function SiteLayout({ children }) {


  return (
    <div className="w-full mx-auto max-w-8xl">
    <Header />
    {children}
    </div>
  );
}

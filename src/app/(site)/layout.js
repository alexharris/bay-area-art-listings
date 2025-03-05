import Header from "../components/header";


export default function SiteLayout({ children }) {


  return (
    <div className="w-full mx-auto max-w-7xl">
    <Header />
    {children}
    </div>
  );
}

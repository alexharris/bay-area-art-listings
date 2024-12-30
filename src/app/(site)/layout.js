import Header from "../components/header";


export default function SiteLayout({ children }) {


  return (
    <div className="w-full md:w-5/6 lg:w-4/6 mx-auto">
    <Header />
    {children}
    </div>
  );
}

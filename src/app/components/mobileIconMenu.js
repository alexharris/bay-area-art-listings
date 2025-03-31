export default function header({ toggleMenu }) {
  return (
    <div className="md:hidden bg-gray-200 h-12 w-full fixed bottom-0 left-0 p-2 flex flex-row justify-center">
      <div onClick={toggleMenu}>
         Filter
      </div>
    </div>
  );
}
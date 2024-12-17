import Logout from "./Logout";

const Navbar = () => {
  return (
    <aside className="fixed inset-y-0 left-4 top-8 z-50 hidden flex-col md:flex ">
      <ul className="flex flex-col gap-1 menu bg-base-100 dark:bg-white/10 rounded-box shadow-md">
        <li>
          <Logout />
        </li>
      </ul>
    </aside>
  );
};

export default Navbar;

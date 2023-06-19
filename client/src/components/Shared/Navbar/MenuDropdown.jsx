import { AiOutlineMenu } from "react-icons/ai";
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import HostModal from "../../Modal/HostRequestModal";
import { becomeHost } from "../../../api/auth";
import { toast } from "react-hot-toast";

const MenuDropdown = () => {
  const { user, logOut, role, setRole } = useContext(AuthContext);
  // console.log(role);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const [modal, setModal] = useState(false);

  const modalHandler = (email) => {
    // console.log("modal clicked");
    becomeHost(email)
      .then((data) => {
        console.log(data);
        toast.success("You are host now, Post rooms!");
        setRole("host");
        closeModal();
        navigate('/dashboard/add-room')
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const closeModal = () => {
    setModal(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        {/* airCNC btn */}
        <div className="hidden md:block">
          {!role && (
            <button
              className="cursor-pointer hover:bg-neutral-100 py-3 px-8 rounded-full text-sm font-semibold  transition"
              onClick={() => {
                setModal(true);
              }}
              disabled={!user}
            >
              AirCNC your home
            </button>
          )}
        </div>
        {/* dropdown btn */}
        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            <Avatar />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-[15vw] bg-white overflow-hidden right-0 top-12 text-sm">
          <div className="flex flex-col cursor-pointer">
            <Link
              to="/"
              className="block md:hidden px-4 py-3 hover:bg-neutral-100 transition font-semibold"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
                >
                  Dashboard
                </Link>
                <div
                  onClick={() => {
                    setRole(null);
                    logOut();
                  }}
                  className="px-4 py-3 hover:bg-neutral-100 transition font-semibold cursor-pointer"
                >
                  Logout
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      <HostModal
        isOpen={modal}
        modalHandler={modalHandler}
        email={user?.email}
        closeModal={closeModal}
      ></HostModal>
    </div>
  );
};

export default MenuDropdown;

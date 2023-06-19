import { useContext } from "react";
import avatarImage from "../../../assets/images/placeholder.jpg";
import { AuthContext } from "../../../providers/AuthProvider";

const Avatar = () => {
  const { user } = useContext(AuthContext);
  return (
    <img
      className="rounded-full"
      referrerPolicy="no-referrer"
      src={user && user.photoURL ? user.photoURL : avatarImage}
      alt="profile"
      width="30"
      height="30"
    />
  );
};

export default Avatar;

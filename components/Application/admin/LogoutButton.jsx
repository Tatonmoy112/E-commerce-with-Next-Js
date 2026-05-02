import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/showtoast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { logout } from "@/store/reducer/authReducer";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useDispatch } from "react-redux";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const hangleLogout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (!data.success) {
        throw new Error(data.message);
      }
      dispatch(logout());
      showToast("success", data.message);
      router.push(WEBSITE_LOGIN);
    } catch (error) {
      showToast("error", error.message);
    }
  };
  return (
    <DropdownMenuItem onClick={hangleLogout} className="cursor-pointer">
      <AiOutlineLogout color="red" />
      Logout
    </DropdownMenuItem>
  );
};
export default LogoutButton;

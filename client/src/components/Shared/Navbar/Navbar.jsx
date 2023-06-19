import MyContainer from "../../MyContainer";
import Logo from "./Logo";
import MenuDropdown from "./MenuDropdown";
import Search from "./Search";


const Navbar = () => {
    return (
        <div className="fixed w-full bg-white z-10 shadow-sm">
            <div className="py-4 border-b-[1px]">
                <MyContainer>
                    <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                        <Logo></Logo>
                        <Search></Search>
                        <MenuDropdown></MenuDropdown>
                    </div>
                </MyContainer>
            </div>
        </div>
    );
};

export default Navbar;
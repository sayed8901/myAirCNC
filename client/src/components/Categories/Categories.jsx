import MyContainer from "../MyContainer";
import CategoryBox from "./CategoryBox";
import { categories } from "./categoriesData";

const Categories = () => {
  return (
    <MyContainer>
      <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
          ></CategoryBox>
        ))}
      </div>
    </MyContainer>
  );
};

export default Categories;

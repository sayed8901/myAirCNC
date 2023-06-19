import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import queryString from "query-string";

const CategoryBox = ({ label, icon: Icon }) => {
  const [params, setParams] = useSearchParams();
  const value = params.get("category");
  // console.log(value);
  const navigate = useNavigate();

  const handleClickCategory = () => {
    
    let currentQuery = {};
    if (params) {
      currentQuery = queryString.parse(params.toString());
    }

    const updatedQuery = { ...currentQuery, category: label };
    const url = queryString.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );
    navigate(url);
  };

  return (
    <div
      onClick={handleClickCategory}
      className="flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 border-transparent text-neutral-500"
    >
      <Icon size={26} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

export default CategoryBox;

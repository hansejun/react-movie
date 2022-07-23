import { useLocation } from "react-router";

function Search() {
  const location = useLocation();
  console.log(location);
  return <h1>Search</h1>;
}
export default Search;

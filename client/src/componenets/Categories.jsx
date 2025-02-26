import "../styles/categories.scss";
import { categories } from "../data";
import { Link } from "react-router-dom";

const Categories = () => {
  return (
    <div className="categories">
      <h1>Explore Our Categories</h1>
      <p>
      Explore Our Top Picks! Discover an array of vacation rentals tailored for every traveler. Embrace local culture, feel at home no matter where you are, and make lasting memories in the destination you've always wanted to visit.
      </p>
      <div className="categories_list">
        {categories?.slice(1, 7).map((category, index) => (
          <Link to={`/properties/category/${category.label}`}>
            <div className="category" key={index}>
              <img src={category.img} alt={category.label} />
              <div className="overlay"></div>
              <div className="category_text">
                <div className="category_text_icon">{category.icon}</div>
                <p>{category.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;


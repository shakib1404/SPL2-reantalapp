import React from "react";
import { categories } from "../data";
import { Link } from "react-router-dom";
import "../styles/Categories.scss";

const Categories = () => {
  return (
    <div className="categories">
      <h1>Explore Top Houses</h1>
      <p>
      Explore our diverse selection of Dhaka rentals, perfect for all types of 
      travelers. Enjoy the comforts of home in vibrant neighborhoods
       and create unforgettable memories in your dream getaway!
      </p>
      <div className="categories_list">
        {categories?.slice(1, 7).map((category, index) => (
          <Link to={`/properties/category/${category.label}` }key={index}>
            <div className="category">
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

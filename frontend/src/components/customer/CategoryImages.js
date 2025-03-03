import React from "react";
import "./CategoryImages.css";
import deals from "../../Images/deals.png";
import grocery from "../../Images/grocery.png";
import convenience from "../../Images/convenience.png";
import alcohol from "../../Images/alcohol.png";
import pharmacy from "../../Images/Pharmacy.png";
import top_eats from "../../Images/top_eats.png";
import asian from "../../Images/asian.png";
import japanese from "../../Images/japanese.png";
import fastfood from "../../Images/fastfood.png";
import burger from "../../Images/burger.png";
import sushi from "../../Images/sushi.png";
import pizza from "../../Images/pizza.png";
import chinese from "../../Images/chinese.png";
import mexican from "../../Images/mexican.png";
import indian from "../../Images/indian.png";
import sandwich from "../../Images/sandwich.png";
import american from "../../Images/american.png";
import italian from "../../Images/italian.png";
import dessert from "../../Images/dessert.png";

const categories = [
  { imgSrc: deals, label: "Deals" },
  { imgSrc: grocery, label: "Grocery" },
  { imgSrc: convenience, label: "Convenience" },
  { imgSrc: alcohol, label: "Alcohol" },
  { imgSrc: pharmacy, label: "Pharmacy" },
  { imgSrc: top_eats, label: "Top Eats" },
  { imgSrc: asian, label: "Asian" },
  { imgSrc: japanese, label: "Japanese" },
  { imgSrc: fastfood, label: "Fast Food" },
  { imgSrc: burger, label: "Burger" },
  { imgSrc: sushi, label: "Sushi" },
  { imgSrc: pizza, label: "Pizza" },
  { imgSrc: chinese, label: "Chinese" },
  { imgSrc: mexican, label: "Mexican" },
  { imgSrc: indian, label: "Indian" },
  { imgSrc: sandwich, label: "Sandwich" },
  { imgSrc: american, label: "American" },
  { imgSrc: italian, label: "Italian" },
  { imgSrc: dessert, label: "Dessert" },
];

const CategoryImages = () => {
  return (
    <div className="category-images">
      {categories.map((category, index) => (
        <div className="category-item" key={index}>
          <img src={category.imgSrc} alt={category.label} />
          <label>{category.label}</label>
        </div>
      ))}
    </div>
  );
};

export default CategoryImages;

import React from 'react';
import { TRAVEL_CATEGORIES } from '../constants/categories';
import './CategorySelector.css'

function CategorySelector({ selectedCategories, setSelectedCategories }) {
    
    const handleCategoryClick = (categoryId) => {
        // If the category is already selected - remove it from the list, otherwise - add it
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    return (
        <div className="category-selector-container">
            <h3>What are you interested in doing on the trip? (You can choose several)</h3>
            <div className="categories-grid">
                {TRAVEL_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={`category-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default CategorySelector;
import React, { useState } from "react";

const SearchBar = ({ handleSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div>
      <input
        className="searchInput textInput"
        type="text"
        // placeholder={type ? `Search by ${type}...` : "Search..."}
        placeholder={placeholder === "default" ? "Search..." : placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;

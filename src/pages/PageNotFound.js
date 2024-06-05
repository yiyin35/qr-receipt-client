import React from "react";
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="PageNotFound">
      <div>
        <h2 className="pgNotFoundTitle">
          Oops! It seems like this page doesn't exist :/
        </h2>
        <h3>
          Let's head back to the <Link to="/">home page</Link>
        </h3>
      </div>
    </div>
  );
}

export default PageNotFound;

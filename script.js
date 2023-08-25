// Get HTML elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mainContainer = document.getElementById("main-container");
const searchSelect = document.getElementById("searchSelect");
const bookCard = document.createElement("div"); // Create the bookCard div here
bookCard.id = "book-card";


// Add a click event listener to the search button
searchBtn.addEventListener("click", function() {
  // Check if the search input is empty and display an alert message if the user hasn't entered any text
  if (searchInput.value === "") {
    alert("You must write something!");
    return; // Exit the function if input is empty
  }

  const searchType = searchSelect.value; // Get the selected search type from the dropdown
  const searchTerm = searchInput.value; // Get the search term entered by the user

  let searchURL = "";

  // Construct the appropriate search URL based on the selected search type
  if (searchType === "title") {
    searchURL = `https://openlibrary.org/search.json?title=${searchTerm}`;
  } else if (searchType === "author") {
    searchURL = `https://openlibrary.org/search.json?author=${searchTerm}`;
  } else if (searchType === "all") {
    searchURL = `https://openlibrary.org/search.json?q=${searchTerm}`;
  }

  // Fetch data from the constructed search URL
  fetch(searchURL)
    .then(response => response.json())
    .then(responseJson => {

      // Check if any search results are found
      if (responseJson.numFound === 0) {
        // Display an error message if no results are found
        mainContainer.innerHTML = "<p>No results found for the search term.</p>";
        return; // Exit the function
      }

      // Get the details of the first result
      firstResult = responseJson.docs[0];
      const bookKey = firstResult.key;

      // Fetch book details using the retrieved key
      fetch(`https://openlibrary.org${bookKey}.json`)
        .then(bookResponse => bookResponse.json())
        .then(bookJson => {
          // Extract relevant book details
          const bookTitle = bookJson.title;
          const authorKey = bookJson.authors[0].author.key;
          const coverID = bookJson.covers[0];
          const size = "M";
          const imageURL = `https://covers.openlibrary.org/b/id/${coverID}-${size}.jpg`;

          // Fetch author details using the retrieved author key
          fetch(`https://openlibrary.org${authorKey}.json`)
            .then(authorResponse => authorResponse.json())
            .then(authorJson => {
              // Extract author name
              const authorName = authorJson.name;
              // Create HTML content to display book details
              const updatedBookInfoHTML = `
                <img src="${imageURL}" alt="Book Cover"/>
                <p id="bookTitle">Book Title: ${bookTitle}</p>
                <p id="bookAuthor">Author: ${authorName}</p>
                <button id="detailsButton">Click for details</button>
              `;

              // Update the existing bookCard element with the new HTML content
              bookCard.innerHTML = updatedBookInfoHTML;
              mainContainer.appendChild(bookCard);
            })
            
            .catch(authorError => {
              console.error("An error occurred while fetching author:", authorError);
            });
        })
        .catch(bookError => {
          console.error("An error occurred while fetching book:", bookError);
        });
    })
    .catch(error => {
      console.error("An error occurred:", error);
    });
});

// Add a click event listener to the details button
bookCard.addEventListener("click", function(event) {
  // Check if the clicked element has the id "detailsButton"
  if (event.target && event.target.id === "detailsButton") {
    // Use the previously defined firstResult variable
    const bookKey = firstResult.key;

    // Fetch additional book details using the retrieved book key
    fetch(`https://openlibrary.org${bookKey}.json`)
      .then(detailResponse => detailResponse.json())
      .then(detailJson => {
        const bookDescription = detailJson.description || "No description available.";
        
        // Create HTML content for the book description
        const descriptionHTML = `
          <p id="bookDescription">${bookDescription}</p>
        `;
        
        // Append the description HTML to the existing bookCard element
        mainContainer.innerHTML += descriptionHTML;
      })
      .catch(detailError => {
        console.error("An error occurred while fetching book details:", detailError);
      });
  }
});




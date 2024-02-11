#!/usr/bin/env node

import * as p from "@clack/prompts";
import { setTimeout } from "node:timers/promises";
import chalkAnimation from "chalk-animation";

const defaultMovie = [
  { name: "Barbie", rating: 4.5, genre: "Comedy", views: 1.5 },
  { name: "Interstellar", rating: 3, genre: "Fantastic", views: 4.5 },
  { name: "The Godfather", rating: 9.77, genre: "Crime", views: 12.0 },
];

let movies = [];


// Sort Date
function sortDate(sort, val) {
  let newSortMovie = null;
  if (sort === "number-lowest") {
    newSortMovie = movies.sort((a, b) => a[val] - b[val]);
  }
  if (sort === "number-highest") {
    console.log("highest");
    newSortMovie = movies.sort((a, b) => b[val] - a[val]);
  }
  if (sort === "string-a") {
    newSortMovie = movies.sort((a, b) => {
      return a[val].localeCompare(b[val]);
    });
  }
  if (sort === "string-z") {
    newSortMovie = movies.sort((a, b) => {
      return b[val].localeCompare(a[val]);
    });
  }
  return newSortMovie;
}

// Sort select
async function sortMovie(val) {
  let isValString = val === "name" || val === "genre" ? true : false;
  let sortTypeTop = isValString ? `${val}-a` : `${val}-lowest`;
  let sortTypeBottom = isValString ? `${val}-z` : `${val}-highest`;

  const sortAction = await p.select({
    message: "How do you want to sort it?",
    initialValue: "Custom add",
    options: [
      {
        value: `${isValString ? "string-a" : "number-lowest"}`,
        label: `Sort ${sortTypeTop}`,
      },
      {
        value: `${isValString ? "string-z" : "number-highest"}`,
        label: `Sort ${sortTypeBottom}`,
      },
    ],
  });
  return sortDate(sortAction, val);
}

// Show movie name
async function showMovieName(message = "") {
  const name = await p.select({
    message,
    options: movies.map((movie) => {
      return { value: movie.name, label: movie.name };
    }),
  });
  return name;
}
// Delete item movie
async function deleteMovie() {
  const name = await showMovieName("Delete Movie");
  movies = movies.filter((movie) => movie.name !== name);
  p.note(name, "Delete movie");
}

// Edit item movie
async function editMovie() {
  const name = await showMovieName("Edit Movie");
  const movie = movies.filter((movie) => movie.name === name)[0];
  const newMovie = await writeMovie(
    movie.name,
    movie.rating,
    movie.genre,
    movie.views
  );

  movies = movies.map((movie) => {
    if (movie.name === name) return newMovie;
    return movie;
  });
  p.note(name, "Edit movie");
  await setTimeout(2500);
}

// Write item movie
async function writeMovie(
  name = "Requiem for a Dream",
  rating = 8.3,
  genre = "Drama",
  views = 33
) {
  const movie = await p.group(
    {
      name: () =>
        p.text({
          message: "Please write movie name",
          placeholder: name,
          validate: (value) => {
            if (!value) return "Please enter a name.";
          },
        }),
      rating: () =>
        p.text({
          message: "Please write movie rating",
          placeholder: `${rating}`,
          validate: (value) => {
            if (!value) return "Please enter a rating.";
            if (+value === NaN) return "Please enter to number";
            if (!(value >= 0 && value <= 10)) return "Please enter to 0 - 10";
          },
        }),
      genre: () =>
        p.text({
          message: "Please write movie genre",
          placeholder: genre,
          validate: (value) => {
            if (!value) return "Please enter a genre.";
          },
        }),
      views: () =>
        p.text({
          message: "Please write movie views",
          placeholder: `${views}`,
          validate: (value) => {
            if (!value) return "Please enter a rating.";
            if (+value === NaN) return "Please enter to number";
          },
        }),
    },
    {
      onCancel: async () => {
        await operationCancel();
      },
    }
  );
  return {
    name: movie.name,
    rating: +movie.rating,
    genre: movie.genre,
    views: +movie.views,
  };
}

// Add item movie 
async function addMovie() {
  const newMovie = await writeMovie();
  movies.push(newMovie);

  if (movies.length > 1) {
    const movieContinue = await p.select({
      message: "Continue add Movie?",
      initialValue: "Custom add",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    });
    if (movieContinue) {
      await addMovie();
    }
  } else {
    await addMovie();
  }
}

// Operaction cancel
async function operationCancel() {
  const title = chalkAnimation.rainbow("Operation cancelled. \n");
  await setTimeout(2000);
  title.stop();
  process.exit(0);
}

// Welcome show
async function welcome() {
  console.clear();
  const title = chalkAnimation.rainbow("Welcome to Moviato \n");
  await setTimeout(2000);
  title.stop();
}

// Main menu select 
async function mainMenu() {
  const movieAction = await p.select({
    message: "What do you want to do with the movie list?",
    initialValue: "Custom add",
    options: [
      {
        value: ["show"],
        label: "Show movies",
      },
      {
        value: ["sort", "name"],
        label: "Sort movies by movie name",
      },
      {
        value: ["sort", "genre"],
        label: "Sort movies by genre",
      },
      {
        value: ["sort", "rating"],
        label: "Sort movies by rating",
      },
      {
        value: ["sort", "views"],
        label: "Sort movies by number of views",
      },
      {
        value: ["sort", "name", "genre", "rating", "views"],
        label: "Sort by name, genre, rating, views",
      },
      {
        value: ["add"],
        label: "Add Movie",
      },
      {
        value: ["delete"],
        label: "Delete movie",
      },
      {
        value: ["edit"],
        label: "Edit movie",
      },
      {
        value: ["clear"],
        label: "Clear all",
      },
      {
        value: ["exit"],
        label: "Exit",
      },
    ],
  });

  if(movieAction[0] === "show") {
    console.table(movies)
  }
  if (movieAction[0] === "sort") {
    for (let i = 1; i < movieAction.length; i++) {
      const newSortMovie = await sortMovie(movieAction[i]);
      console.table(newSortMovie);
      await setTimeout(1000);
    }
  }
  if (movieAction[0] === "add") {
    await addMovie();
    console.table(movies);
  }
  if (movieAction[0] === "delete") {
    await deleteMovie();
    console.table(movies);
  }
  if (movieAction[0] === "edit") {
    await editMovie();
    console.table(movies);
  }
  if (movieAction[0] === "exit") {
    await operationCancel();
  }
  if (movieAction[0] === "clear") {
    movies = [];
    console.clear();
    await main();
  }

  await setTimeout(2000);
  await mainMenu();
}

// Choose Date
async function main() {
  const movieList = await p.select({
    message: "How to add movie list?",
    initialValue: "Custom add",
    options: [
      { value: "custom", label: "Custom Add" },
      { value: "default", label: "Default Add" },
    ],
  });
  if (p.isCancel(movieList)) {
    await operationCancel();
  }
  if (movieList === "default") movies.push(...defaultMovie);

  if (movieList === "custom") {
    await addMovie();
  }

  await mainMenu();
}

await welcome();
main().catch(console.error);

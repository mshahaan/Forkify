import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SECONDS } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

async function controlRecipes() {

  const id = window.location.hash.slice(1);
  if (!id) return;

  try {
    resultsView.update(model.getSearchResultsPage());

    // 1.) Loading Recipe
    recipeView.renderSpinner(recipeContainer);
    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);

    // 2.) Rendering Recipe
    recipeView.render(model.state.recipe);

  } catch (error) {
    console.trace(error);
    recipeView.renderError();
  }

}

async function controlSearchResults() {
  try {
    // Retrieve Results
    const query = searchView.getQuery();
    if(!query) return;

    // Render Spinner
    resultsView.renderSpinner();

    await model.loadSearchResults(query);

    // Render Results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //Display Pagination Buttons
    paginationView.render(model.state.search)
  } catch (error) {
    console.log(error);
  }
}

function controlPagination(page) {
  
  // Render desired page
  resultsView.render(model.getSearchResultsPage(page));

  // re-render pagination buttons
  paginationView.render(model.state.search);
}

function controlServings(servings) {
  // Update the recipe servings in state
  model.updateServings(servings);

  // Update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {

  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);
  
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);

}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try{
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS*1000);
  } catch(error) {
    console.error(error);
    addRecipeView.renderError(error.message);
  }
}

function init() {

  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

}

init();
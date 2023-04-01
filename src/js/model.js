import { async } from 'regenerator-runtime';
import { API_URL, SEARCH_RESULTS_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: SEARCH_RESULTS_PER_PAGE
    },
    bookmarks: [],
};

function createRecipeObject(data) {
    const recipe = data.data.recipe;

    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      ...(recipe.key && {key: recipe.key}),
    };
}

export async function loadRecipe(id){

    try {
        
        const data = await AJAX(API_URL + id + `?key=${KEY}`);
    
        state.recipe = createRecipeObject(data);

        if(state.bookmarks.some(bookmark => bookmark.id === id)){
            state.recipe.bookmarked = true;
        } else {
            state.recipe.bookmarked = false;
        }

    } catch (error) {
        // console.trace(error);
        throw error;
    }

}

export async function loadSearchResults(query) {
    try {
        state.search.query = query;

        const data = await AJAX(API_URL + `?search=${query}&key=${KEY}`);
        
        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && {key: recipe.key}),
            }
        });

        state.search.page = 1;
    } catch (error) {
        throw error;
    }
}

export function getSearchResultsPage(page = state.search.page) {
    state.search.page = page;

    const startIndex = (page - 1) * state.search.resultsPerPage;

    return state.search.results.slice(startIndex, startIndex + state.search.resultsPerPage);
}

export function updateServings(newServings) {
    state.recipe.ingredients.forEach(function(ingredient) {
        ingredient.quantity = ingredient.quantity * newServings / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

function persistBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
    state.bookmarks.push(recipe);

    if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
}

export function removeBookmark(id) {
    const index = state.bookmarks.findIndex(element => element.id === id);
    state.bookmarks.splice(index, 1);

    if(id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
}

function clearBookmarks() {
    localStorage.clear('bookamrks');
}
// clearBookmarks();

export async function uploadRecipe(newRecipe) {
    try {
        const ingredients = Object
        .entries(newRecipe)
        .filter(function(entry) {
            return entry[0].startsWith('ingredient') && entry[1] !== '';
        })
        .map(function(ingredient) {
            const ingArr = ingredient[1].replaceAll(' ', '').split(',');
            if(ingArr.length !== 3) throw new Error('Wrong ingredient format!');
    
            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });
        
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: newRecipe.cookingTime,
            servings: newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);

    } catch (error) {
        throw error;
    }
}

function init() {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}

init();
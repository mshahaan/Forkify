import View from './View.js';
import previewView from './previewView.js';

class ResultsView extends View {
    _parentElement = document.querySelector('.results');
    _message = '';
    _errorMessage = 'No recipes found for your search.';

    _generateMarkup() {
      return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new ResultsView();
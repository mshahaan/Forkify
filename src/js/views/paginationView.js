import View from "./View";
import icons from '../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function(event) {
            const btn = event.target.closest('.btn--inline');
            if(!btn) return;

            handler(Number(btn.dataset.goto));
        });
    }

    _generateMarkup() {
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        const currPage = this._data.page;

        if(currPage === 1){

            if(numPages > 1) return this._generateNextButton(currPage);
            return '';

        }
        
        // Last Page
        if(currPage === numPages) return this._generatePrevButton(currPage);

        // Middle Page (Previous and Next page exist)
        return this._generatePrevButton(currPage) + this._generateNextButton(currPage);

    }

    _generatePrevButton(page){
        return `
        <button data-goto="${page-1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${page-1}</span>
        </button>
        `;
    }

    _generateNextButton(page){
        return `
        <button data-goto="${page+1}" class="btn--inline pagination__btn--next">
            <span>Page ${page+1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
        `;
    }
}

export default new PaginationView();
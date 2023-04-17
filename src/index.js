import './css/styles.css';
import fetchCountries from './js/fetchCountries.js';
import debounce from '../node_modules/lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DEBOUNCE_DELAY = 300;

const refs = {
  input: document.getElementById('search-box'),
  ulEl: document.querySelector('.country-list'),
  divEl: document.querySelector('.country-info'),
};

refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(evt) {
  const inputValue = evt.target.value.trim();
    cleanMarkup(refs.ulEl);
    cleanMarkup(refs.divEl);
  if (inputValue != '') {
    fetchCountries(inputValue)
        .then(countries => {
        if (countries.length > 10) {
          Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
        cleanMarkup(refs.ulEl);
          return;
        }
        const markupList = countries.reduce(
          (markup, country) => markup + createMarkupCountry(country),
          ''
        );
        updateCountry(markupList, refs.ulEl);
        if (countries.length === 1) {
          const h2El = document.querySelector('.country-title');
          h2El.classList.add('country-title__biggest');
          const markupInfo = createMarkupInfoCountry(countries[0]);
          updateCountry(markupInfo, refs.divEl);
        } else {
            cleanMarkup(refs.divEl);
        }
      })
        .catch(error => {
        if (error.message === '404')
          Notify.failure('Oops, there is no country with that name');
       
        onError(error);
      });
  }
}

function onError(err) {
    cleanMarkup(refs.divEl);
    cleanMarkup(refs.ulEl);
    cleanInput();
  console.error(err);
}

function createMarkupCountry({ name, flags }) {
  return `
    <li class="country-item">
        <img src="${flags.svg}" class="country-img"><h2 class="country-title">${name.official}</h2>
    </li>
    `;
}

function createMarkupInfoCountry({ capital, population, languages }) {
  return `
    <p class="country-text"><b>Capital:</b> ${capital}</p>
    <p class="country-text"><b>Population:</b> ${population}</p>
    <p class="country-text"><b>Langueges:</b> ${Object.values(languages).join(
      ', '
    )}</p>
    `;
}

function updateCountry(markup, elem) {
  elem.innerHTML = markup;
}

function cleanMarkup(elem) {
  elem.innerHTML = '';
}

function cleanInput() {
  refs.input.value = '';
}

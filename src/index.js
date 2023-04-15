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
  cleanList();
  cleanInfo();
  if (inputValue != '') {
    fetchCountries(inputValue)
      .then(flags => {
        if (flags.status === 404) throw new Error('No data!');
        if (flags.length > 10) {
          Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
          cleanList();
          return;
        }
        const markupList = flags.reduce(
          (markup, flag) => markup + createMarkupCountry(flag),
          ''
        );
        updateCountry(markupList, refs.ulEl);
        if (flags.length === 1) {
          const h2El = document.querySelector('.country-title');
          h2El.classList.add('country-title__biggest');
          const markupInfo = createMarkupInfoCountry(flags[0]);
          updateCountry(markupInfo, refs.divEl);
        } else {
          cleanInfo();
        }
      })
      .catch(onError);
  }
}

function onError(err) {
  Notify.failure('Oops, there is no country with that name');
  cleanInfo();
  cleanList();
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

function cleanList() {
  refs.ulEl.innerHTML = '';
}

function cleanInfo() {
  refs.divEl.innerHTML = '';
}

function cleanInput() {
  refs.input.value = '';
}

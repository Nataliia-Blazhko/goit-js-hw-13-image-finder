import apiService from './apiService.js';
import imageCardTemplate from '../templates/imageCard.hbs';
import imageListTemplate from '../templates/imageList.hbs';
import searchInput from '../templates/searchInput.hbs';
import { notice, defaultStack } from '@pnotify/core';
import * as basicLightbox from 'basiclightbox';

export default class searchImages {
  constructor(selector) {
    this.rootComponent = document.querySelector(selector);
    this.currentPage = 1;
    this.currentSearchQuery = '';
    this.renderForm();
    this.form = this.rootComponent.querySelector('#search-form');
    this.imageListRef = this.rootComponent.querySelector('.gallery');
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.addListeners();
    this.loadMoreObserver = this.createObserver();
  }

  renderForm() {
    this.rootComponent.insertAdjacentHTML('beforeend', searchInput());
    this.rootComponent.insertAdjacentHTML('beforeend', imageListTemplate());
  }

  notifyError(message) {
    defaultStack.close();
    notice({
      text: message,
    });
  }

  async fetchImages(searchQuery, page) {
    try {
      const result = await apiService.searchImage(searchQuery, page);

      if (result.hits.length === 0) {
        this.notifyError('No more images found. Please enter another query!');
      } else {
        result.hits.map(card => {
          this.imageListRef.insertAdjacentHTML(
            'beforeend',
            imageCardTemplate(card),
          );
        });
        const imageItems = Array.from(
          this.imageListRef.querySelectorAll('.image-card-item'),
        );
        this.loadMoreObserver.observe(imageItems[imageItems.length - 1]);
      }
    } catch (error) {
      this.notifyError('Server Error occured, please try again later.');
      console.error(error);
    }
  }

  createObserver() {
    const loadMoreObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            this.currentPage += 1;
            this.fetchImages(this.currentSearchQuery, this.currentPage);
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.5 },
    );
    return loadMoreObserver;
  }

  handleFormSubmit(event) {
    event.preventDefault();
    const searchQuery = event.target.elements['query'].value.trim();
    if (searchQuery) {
      this.imageListRef.innerHTML = '';
      this.currentPage = 1;
      this.currentSearchQuery = searchQuery;
      this.fetchImages(searchQuery.replace(' ', '+'), this.currentPage);
    }
  }

  openFullImage(event) {
    if (event.target.nodeName === 'IMG') {
      const instance = basicLightbox.create(`
        <img src="${event.target.dataset.src}" width="800" height="600">
      `);
      instance.show();
    }
  }

  addListeners() {
    this.imageListRef.addEventListener('click', this.openFullImage);
    this.form.addEventListener('submit', this.handleFormSubmit);
  }
}

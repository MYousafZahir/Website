// Collapsible Section Script
document.addEventListener("DOMContentLoaded", function () {
    const collapsibles = document.querySelectorAll(".collapsible");
    collapsibles.forEach((collapsible) => {
        collapsible.addEventListener("click", function () {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
});




// Galleries
class Gallery {
    constructor(id, contents, captions) {
        this.id = id;
        this.contents = contents;
        this.captions = captions;
        this.currentMediaIndex = 0;

        this.initialize();
    }

    initialize() {
        this.showMedia(this.currentMediaIndex);
    }

    showMedia(index) {
        this.contents.forEach((content, i) => {
            content.classList.toggle('active', i === index);
        });
        this.updateCaption(index);
    }

    updateCaption(index) {
        const captionText = document.querySelector(`#${this.id} .gallery-caption p`);
        captionText.textContent = this.captions[index];
    }

    nextMedia() {
        this.currentMediaIndex = (this.currentMediaIndex + 1) % this.contents.length;
        this.showMedia(this.currentMediaIndex);
    }

    prevMedia() {
        this.currentMediaIndex = (this.currentMediaIndex - 1 + this.contents.length) % this.contents.length;
        this.showMedia(this.currentMediaIndex);
    }
}


// Initialize galleries
document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.gallery-container');
    
    galleries.forEach(gallery => {
        const id = gallery.id;
        const contents = gallery.querySelectorAll('.gallery-content');
        const captions = Array.from(contents).map(content => content.getAttribute('data-caption') || '');

        const galleryInstance = new Gallery(id, contents, captions);

        // Make the gallery instance globally accessible
        window[id] = galleryInstance;

        // Remove inline onclick attributes and add event listeners instead
        const leftArrow = gallery.querySelector('.left-arrow');
        const rightArrow = gallery.querySelector('.right-arrow');

        leftArrow.removeEventListener('click', () => galleryInstance.prevMedia());
        rightArrow.removeEventListener('click', () => galleryInstance.nextMedia());

        leftArrow.addEventListener('click', () => galleryInstance.prevMedia());
        rightArrow.addEventListener('click', () => galleryInstance.nextMedia());
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.gallery-container');
    
    galleries.forEach(gallery => {
        const id = gallery.id;
        const contents = gallery.querySelectorAll('.gallery-content');
        const captions = Array.from(contents).map(content => content.getAttribute('data-caption') || '');

        const galleryInstance = new Gallery(id, contents, captions);

        // Attach event listeners for navigation
        const nextButton = gallery.querySelector('.next-button');
        const prevButton = gallery.querySelector('.prev-button');

        nextButton.addEventListener('click', () => galleryInstance.nextMedia());
        prevButton.addEventListener('click', () => galleryInstance.prevMedia());
    });
});

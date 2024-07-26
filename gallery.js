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

// Gallery Navigation Script
let currentMediaIndex = 0;
const galleryContents = document.querySelectorAll('.gallery-content');
const captions = [
    "A short clip showing what the simulation looks like.",
    "A state tree diagram for the behaviours of creatures.",
    "Components of creatures including hearing range and vision cone."
];

function showMedia(index) {
    galleryContents.forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
    updateCaption(index);
}

function updateCaption(index) {
    const captionText = document.getElementById('caption-text');
    captionText.textContent = captions[index];
}

function nextMedia() {
    currentMediaIndex = (currentMediaIndex + 1) % galleryContents.length;
    showMedia(currentMediaIndex);
}

function prevMedia() {
    currentMediaIndex = (currentMediaIndex - 1 + galleryContents.length) % galleryContents.length;
    showMedia(currentMediaIndex);
}

// Initialize the first media as active
showMedia(currentMediaIndex);

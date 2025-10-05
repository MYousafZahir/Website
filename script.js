document.addEventListener('DOMContentLoaded', () => {
    console.log("Personal website script loaded.");

    // Interactive module wiring

    const galleryModal = document.getElementById('gallery-modal');
    const codeModal = document.getElementById('code-modal');
    let openModal = () => {};
    let closeModal = () => {};

    const rememberRawCode = (codeElement) => {
        if (!codeElement) {
            return;
        }

        if (!codeElement.dataset.rawCode) {
            codeElement.dataset.rawCode = codeElement.textContent;
        }
    };

    const highlightBlock = (codeElement, { withLineNumbers = false } = {}) => {
        if (!codeElement || !window.hljs || typeof hljs.highlightElement !== 'function') {
            return;
        }

        rememberRawCode(codeElement);

        const needsHighlight = !codeElement.classList.contains('hljs');
        const hasLineNumbers = Boolean(codeElement.querySelector('table.hljs-ln'));

        try {
            if (needsHighlight) {
                const rawCode = codeElement.dataset.rawCode;
                if (rawCode && codeElement.textContent !== rawCode) {
                    codeElement.textContent = rawCode;
                }

                hljs.highlightElement(codeElement);
            }

            if (withLineNumbers && typeof hljs.lineNumbersBlock === 'function' && !hasLineNumbers) {
                hljs.lineNumbersBlock(codeElement);
            }
        } catch (error) {
            console.error('Highlight.js failed to render code block.', error);
        }
    };

    const highlightInlineSamples = () => {
        const inlineBlocks = document.querySelectorAll('.code-snippet pre code');
        inlineBlocks.forEach(block => highlightBlock(block, { withLineNumbers: true }));
    };

    const bootHighlighting = (attempt = 0) => {
        if (window.hljs && typeof hljs.highlightElement === 'function') {
            if (typeof hljs.configure === 'function') {
                hljs.configure({
                    ignoreUnescapedHTML: true
                });
            }

            highlightInlineSamples();
        } else if (attempt < 10) {
            window.setTimeout(() => bootHighlighting(attempt + 1), 120);
        } else {
            console.warn('Highlight.js not available for inline code rendering.');
        }
    };

    document.querySelectorAll('.code-snippet pre code').forEach(block => rememberRawCode(block));

    bootHighlighting();
    window.addEventListener('load', () => bootHighlighting());

    // --- Image Pan/Zoom Logic ---
    const setupPanZoom = (container) => {
        const img = container.querySelector('img');
        if (!img) return;

        // Determine if the container is inside a modal
        const isModal = container.closest('.modal');
        const initialScale = isModal ? 1 : 1.5; // 1.5x zoom for inline, 1x for modal

        // Initialize state using data attributes, always setting the scale based on context
        img.dataset.scale = initialScale.toString(); // Always set based on initialScale
        img.dataset.tx = img.dataset.tx || '0'; // Keep fallback for translation if needed
        img.dataset.ty = img.dataset.ty || '0'; // Keep fallback for translation if needed
        img.style.transformOrigin = '0 0'; // Ensure origin is top-left
        img.style.cursor = 'grab'; // Redundant with CSS but safe

        let isPanning = false;
        let startX, startY, initialTx, initialTy;

        const updateTransform = () => {
            // Clamp scale
            let scale = parseFloat(img.dataset.scale);
            scale = Math.max(1, Math.min(scale, 5)); // Clamp scale between 1x and 5x
            img.dataset.scale = scale;

            // Clamp translation
            let tx = parseFloat(img.dataset.tx);
            let ty = parseFloat(img.dataset.ty);
            const maxTx = (img.offsetWidth * scale - container.clientWidth);
            const maxTy = (img.offsetHeight * scale - container.clientHeight);

            // Allow panning only when zoomed
            tx = (scale > 1) ? Math.max(-maxTx, Math.min(0, tx)) : 0;
            ty = (scale > 1) ? Math.max(-maxTy, Math.min(0, ty)) : 0;

            img.dataset.tx = tx;
            img.dataset.ty = ty;

            img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        };

        // Initial transform application
        updateTransform();

        container.addEventListener('mousedown', (e) => {
            if (parseFloat(img.dataset.scale) <= 1) return; // Only pan if zoomed
            e.preventDefault(); // Prevent default image drag
            isPanning = true;
            startX = e.pageX;
            startY = e.pageY;
            initialTx = parseFloat(img.dataset.tx);
            initialTy = parseFloat(img.dataset.ty);
            container.style.cursor = 'grabbing';
            container.classList.add('panning'); // Add class for CSS styling

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        const handleMouseMove = (e) => {
            if (!isPanning) return;
            const scale = parseFloat(img.dataset.scale);
            const dx = e.pageX - startX;
            const dy = e.pageY - startY;
            img.dataset.tx = initialTx + dx / scale; // Adjust movement by scale
            img.dataset.ty = initialTy + dy / scale;
            updateTransform();
        };

        const handleMouseUp = () => {
            if (!isPanning) return;
            isPanning = false;
            container.style.cursor = 'grab';
            container.classList.remove('panning');
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Final state is already saved by updateTransform
        };

        // Handle mouse leaving the container while panning
        container.addEventListener('mouseleave', () => {
            if (isPanning) {
                handleMouseUp();
            }
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault(); // Prevent page scroll

            const scaleAmount = 0.1;
            let scale = parseFloat(img.dataset.scale);
            const rect = container.getBoundingClientRect();

            // Calculate mouse position relative to container
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate mouse position relative to image (considering current transform)
            const imgX = (mouseX - parseFloat(img.dataset.tx)) / scale;
            const imgY = (mouseY - parseFloat(img.dataset.ty)) / scale;

            // Update scale
            if (e.deltaY < 0) {
                scale += scaleAmount; // Zoom in
            } else {
                scale -= scaleAmount; // Zoom out
            }
            scale = Math.max(1, Math.min(scale, 5)); // Clamp scale

            // Calculate new translation to keep mouse point stationary
            const newTx = mouseX - imgX * scale;
            const newTy = mouseY - imgY * scale;

            img.dataset.scale = scale;
            img.dataset.tx = newTx;
            img.dataset.ty = newTy;

            updateTransform();
        });
    };

    // Function to reset pan/zoom state
    const resetPanZoom = (container) => {
        const img = container.querySelector('img');
        if (img) {
            // Determine if the container is inside a modal for correct reset scale
            const isModal = container.closest('.modal');
            const resetScale = isModal ? 1 : 1.5; // Reset to 1.5x for inline, 1x for modal

            img.dataset.scale = resetScale.toString();
            img.dataset.tx = '0';
            img.dataset.ty = '0';
            // Update transform needs to be called to apply the reset scale/translation
            // img.style.transform = `translate(0px, 0px) scale(${resetScale})`; // updateTransform handles this

            container.style.cursor = 'grab';

            // Need to call updateTransform to apply the reset scale and clamp translation
            const updateTransform = () => {
                let scale = parseFloat(img.dataset.scale);
                scale = Math.max(1, Math.min(scale, 5));
                img.dataset.scale = scale;

                let tx = parseFloat(img.dataset.tx);
                let ty = parseFloat(img.dataset.ty);
                const maxTx = (img.offsetWidth * scale - container.clientWidth);
                const maxTy = (img.offsetHeight * scale - container.clientHeight);

                tx = (scale > 1) ? Math.max(-maxTx, Math.min(0, tx)) : 0;
                ty = (scale > 1) ? Math.max(-maxTy, Math.min(0, ty)) : 0;

                img.dataset.tx = tx;
                img.dataset.ty = ty;

                img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
            };
            updateTransform(); // Apply the reset transform
        }
    };


    // --- Code Toggle and Expand Logic ---
    const codeSections = document.querySelectorAll('.code-section');

    codeSections.forEach(section => {
        const controls = section.querySelector('.code-controls');
        const toggleButton = controls?.querySelector('.toggle-code');
        const codeSnippet = section.querySelector('.code-snippet');
        const expandButton = controls?.querySelector('.code-expand');

        if (!controls || !toggleButton || !codeSnippet || !expandButton) {
            // console.warn("Missing elements for code section:", section);
            return;
        }

        // Listener for the main toggle button functionality (Show/Hide)
        toggleButton.addEventListener('click', () => {
            const isCollapsed = codeSnippet.classList.contains('collapsed');
            if (isCollapsed) {
                // Expand the code snippet
                codeSnippet.classList.remove('collapsed');
                controls.classList.add('controls-expanded'); // Add class to container
                toggleButton.setAttribute('aria-expanded', 'true');
                toggleButton.innerHTML = '<i class="fas fa-code"></i><span>Hide Code</span>';
                expandButton.setAttribute('aria-hidden', 'false');
                expandButton.setAttribute('tabindex', '0');

                // --- Explicitly highlight this block when expanded ---
                const codeElement = codeSnippet.querySelector('pre code');
                highlightBlock(codeElement, { withLineNumbers: true });
                // --- End explicit highlighting ---

            } else {
                // Collapse the code snippet
                codeSnippet.classList.add('collapsed');
                controls.classList.remove('controls-expanded'); // Remove class from container
                toggleButton.setAttribute('aria-expanded', 'false');
                toggleButton.innerHTML = '<i class="fas fa-code"></i><span>Show Code</span>';
                expandButton.setAttribute('aria-hidden', 'true');
                expandButton.setAttribute('tabindex', '-1');
            }
        });

        expandButton.addEventListener('click', () => {
            const preElement = codeSnippet.querySelector('pre');
            const sourceCodeElement = preElement?.querySelector('code');
            if (!preElement || !sourceCodeElement) {
                console.error('Original code block not found for modal rendering.');
                return;
            }

            const rawCode = sourceCodeElement.dataset.rawCode || sourceCodeElement.textContent;
            const modalPre = document.createElement('pre');
            const modalCode = document.createElement('code');

            modalCode.textContent = rawCode;
            sourceCodeElement.classList.forEach(className => {
                if (className.startsWith('language-')) {
                    modalCode.classList.add(className);
                }
            });

            modalCode.dataset.rawCode = rawCode;
            modalPre.appendChild(modalCode);
            highlightBlock(modalCode, { withLineNumbers: true });

            const modalCodeContainer = codeModal?.querySelector('.modal-code-content');
            if (modalCodeContainer && typeof openModal === 'function') {
                modalCodeContainer.innerHTML = '';
                modalCodeContainer.appendChild(modalPre);
                if (codeModal) {
                    openModal(codeModal);
                }
            } else {
                console.error('Modal code content container not found.');
            }
        });


        // Set initial state for the toggle button and expand icon
        if (codeSnippet.classList.contains('collapsed')) {
            controls.classList.remove('controls-expanded'); // Ensure class is removed initially
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.innerHTML = '<i class="fas fa-code"></i><span>Show Code</span>';
            expandButton.setAttribute('aria-hidden', 'true');
            expandButton.setAttribute('tabindex', '-1');
        } else {
            controls.classList.add('controls-expanded'); // Ensure class is added initially
            toggleButton.setAttribute('aria-expanded', 'true');
            toggleButton.innerHTML = '<i class="fas fa-code"></i><span>Hide Code</span>';
            expandButton.setAttribute('aria-hidden', 'false');
            expandButton.setAttribute('tabindex', '0');
        }
    });

    // --- Project Carousel Logic ---
    const projectSection = document.querySelector('#projects');
    const projectSpreads = projectSection ? Array.from(projectSection.querySelectorAll('.project-spread')) : [];

    if (projectSection && projectSpreads.length) {
        let activeProjectIndex = projectSpreads.findIndex(spread => spread.classList.contains('is-active'));
        if (activeProjectIndex === -1) {
            activeProjectIndex = 0;
            projectSpreads[0].classList.add('is-active');
        }

        const paginationContainer = projectSection.querySelector('.project-pagination');
        const prevButton = projectSection.querySelector('.project-cycle.prev');
        const nextButton = projectSection.querySelector('.project-cycle.next');
        const counterText = projectSection.querySelector('.project-counter-text');
        const shortcutButtons = document.querySelectorAll('.project-nav-shortcuts button');
        const paginationButtons = [];

        const formatIndexLabel = (index) => `${String(index + 1).padStart(2, '0')} · ${projectSpreads[index].dataset.projectName || projectSpreads[index].id}`;

        const updateCounter = (index) => {
            if (counterText) {
                counterText.textContent = formatIndexLabel(index);
            }
        };

        const updateShortcutState = (index) => {
            shortcutButtons.forEach(button => {
                const isActive = button.dataset.projectTarget === projectSpreads[index].id;
                button.classList.toggle('is-active', isActive);
            });
        };

        const updatePaginationState = (index) => {
            paginationButtons.forEach((button, i) => {
                const isActive = i === index;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        };

        const showProject = (index) => {
            if (index < 0 || index >= projectSpreads.length) {
                return;
            }

            activeProjectIndex = index;

            projectSpreads.forEach((spread, spreadIndex) => {
                const isActive = spreadIndex === index;
                spread.classList.toggle('is-active', isActive);
                spread.setAttribute('aria-hidden', (!isActive).toString());
            });

            updatePaginationState(index);
            updateShortcutState(index);
            updateCounter(index);
        };

        const cycleProject = (delta) => {
            const nextIndex = (activeProjectIndex + delta + projectSpreads.length) % projectSpreads.length;
            showProject(nextIndex);
        };

        if (paginationContainer) {
            paginationContainer.innerHTML = '';
            projectSpreads.forEach((spread, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'project-page-btn';
                button.setAttribute('aria-label', `Show project ${spread.dataset.projectName || spread.id}`);
                button.addEventListener('click', () => showProject(index));
                paginationContainer.appendChild(button);
                paginationButtons.push(button);
            });
        }

        prevButton?.addEventListener('click', () => cycleProject(-1));
        nextButton?.addEventListener('click', () => cycleProject(1));

        shortcutButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.projectTarget;
                if (!targetId) {
                    return;
                }
                const targetIndex = projectSpreads.findIndex(spread => spread.id === targetId);
                if (targetIndex >= 0) {
                    showProject(targetIndex);
                    projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        showProject(activeProjectIndex);
    }

    // --- TOC Scroll Highlighting ---
    const tocLinks = document.querySelectorAll('#toc a[href^="#"]');
    const sections = [];
    tocLinks.forEach(link => {
        if (link.dataset.projectTarget) {
            return;
        }
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
            sections.push({ link: link, section: section });
        }
    });

    const updateTocHighlight = () => {
        const viewportTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const viewportBottom = viewportTop + viewportHeight;
        const viewportCenter = viewportTop + viewportHeight / 2;

        // Remove active classes from all links first
        tocLinks.forEach(l => {
            l.classList.remove('toc-active-primary', 'toc-active-secondary');
        });

        let visibleSections = [];
        sections.forEach(({ link, section }) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            const sectionCenter = sectionTop + sectionHeight / 2;

            // Check if the section is within the viewport boundaries
            const isVisible = sectionTop < viewportBottom && sectionBottom > viewportTop;

            if (isVisible) {
                // Calculate distance from section center to viewport center
                const distance = Math.abs(sectionCenter - viewportCenter);
                // Also store section boundaries
                visibleSections.push({ link, section, top: sectionTop, bottom: sectionBottom, distance });
            }
        });

        let primarySection = null;
        if (visibleSections.length > 0) {
            const offset = 20; // Small offset to make highlighting feel natural

            // Find sections whose top is at or above the viewport top + offset
            const sectionsStartingAbove = visibleSections.filter(item => item.top <= viewportTop + offset);

            if (sectionsStartingAbove.length > 0) {
                // If there are sections starting above the threshold,
                // find the one lowest on the page (largest top value)
                sectionsStartingAbove.sort((a, b) => b.top - a.top); // Sort descending by top
                primarySection = sectionsStartingAbove[0];
            } else {
                // If no sections start above the threshold (e.g., scrolled down past the start of all visible sections),
                // pick the highest visible section on the screen.
                visibleSections.sort((a, b) => a.top - a.top); // Sort ascending by top
                primarySection = visibleSections[0];
            }

            // --- Special case override for bottom of page ---
            const scrollBottom = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const bottomThreshold = 5; // Pixels threshold to consider "at bottom"

            if (pageHeight - scrollBottom <= bottomThreshold) {
                // If scrolled to the bottom, force the last section to be primary if it's visible
                const lastTocSectionData = sections[sections.length - 1]; // Get the last section data {link, section}
                if (lastTocSectionData) {
                    // Check if this last section is among the currently visible ones
                    const lastVisibleSection = visibleSections.find(vs => vs.section === lastTocSectionData.section);
                    if (lastVisibleSection) {
                        primarySection = lastVisibleSection; // Override primary section
                    }
                }
            }
            // --- End special case ---


            // Apply highlights
            visibleSections.forEach((item) => {
                 // Check if the item's section is actually intersecting the viewport
                 // This filters out sections that might be technically "closest" but are fully above/below
                 const sectionTop = item.section.offsetTop;
                 const sectionBottom = sectionTop + item.section.offsetHeight;
                 const isIntersecting = sectionTop < viewportBottom && sectionBottom > viewportTop;

                 if (isIntersecting) {
                    if (item === primarySection) {
                        item.link.classList.add('toc-active-primary');
                    } else {
                        item.link.classList.add('toc-active-secondary');
                    }
                 }
            });
        }
        // If no sections are visible or intersecting, nothing is highlighted.
    };


    // Throttle scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateTocHighlight, 50); // Adjust timeout as needed (50-100ms is usually fine)
    });

    // Initial highlight check on load
    updateTocHighlight();


    // --- Gallery Navigation (Inline & Modal) ---
    // This function initializes gallery logic for a given container (inline or modal)
    // It now accepts an optional startIndex to begin at a specific item.
    function initializeGallery(galleryContainer, startIndex = 0) {
        const itemsContainer = galleryContainer.querySelector('.gallery-items');
        if (!itemsContainer) return;

        const items = itemsContainer.querySelectorAll('.gallery-item');
        const prevButton = galleryContainer.querySelector('.prev-media');
        const nextButton = galleryContainer.querySelector('.next-media');
        // Use the provided startIndex, defaulting to 0 if not provided or invalid
        let currentIndex = (startIndex >= 0 && startIndex < items.length) ? startIndex : 0;

        const showItem = (index) => {
            items.forEach((item, i) => {
                const isActive = (i === index);
                item.classList.toggle('active', isActive);

                // Pause video if it becomes inactive
                const video = item.querySelector('video');
                if (video && !isActive) {
                    video.pause();
                }

                // Reset pan/zoom if image item becomes inactive
                const panZoomContainer = item.querySelector('.image-pan-zoom-container');
                if (panZoomContainer && !isActive) {
                    resetPanZoom(panZoomContainer);
                }
            });
        };

        // Hide buttons using visibility if only one item, otherwise show them
        if (items.length <= 1) {
            if(prevButton) prevButton.style.visibility = 'hidden'; // Use visibility
            if(nextButton) nextButton.style.visibility = 'hidden'; // Use visibility
        } else {
             if(prevButton) {
                prevButton.style.visibility = 'visible'; // Ensure visible
                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
                    showItem(currentIndex);
                });
            }

            if(nextButton) {
                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
                    showItem(currentIndex);
                });
            }
        }

        // Initialize the first item & setup pan/zoom for image items
        if (items.length > 0) {
            items.forEach((item, i) => {
                const panZoomContainer = item.querySelector('.image-pan-zoom-container');
                if (panZoomContainer) {
                    setupPanZoom(panZoomContainer);
                }
            });
            showItem(currentIndex); // Show the correct initial item
        }
    }

    // Initialize all inline galleries on page load
    const inlineGalleries = document.querySelectorAll('.gallery');
    inlineGalleries.forEach(gallery => {
        // Check if it's inside a modal, skip if so
        if (!gallery.closest('.modal')) {
            initializeGallery(gallery.querySelector('.gallery-frame')); // Pass the frame
        }
    });
    // --- Modal Logic ---
    if (!galleryModal || !codeModal) {
        console.warn('Modal containers missing; gallery/code expansion disabled.');
    } else {
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        const modalGalleryContent = galleryModal.querySelector('.modal-gallery-content');

        openModal = (modalElement) => {
            modalElement.classList.add('visible');
            modalElement.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            if (modalElement === codeModal) {
                const modalCodeElement = modalElement.querySelector('.modal-code-content pre code');
                if (modalCodeElement && window.hljs && typeof hljs.highlightElement === 'function') {
                    setTimeout(() => {
                        try {
                            modalCodeElement.classList.remove('hljs');
                            hljs.highlightElement(modalCodeElement);
                            if (typeof hljs.lineNumbersBlock === 'function') {
                                hljs.lineNumbersBlock(modalCodeElement.parentElement);
                            }
                        } catch (e) {
                            console.error("Highlight.js modal highlighting failed:", e);
                        }
                    }, 0);
                } else if (!modalCodeElement) {
                    console.warn("Could not find modal 'code' element inside '.modal-code-content pre'.");
                } else {
                    console.warn("Highlight.js (hljs) or highlightElement function not available for modal highlighting.");
                }
            }
        };

        closeModal = (modalElement) => {
            modalElement.classList.remove('visible');
            modalElement.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (modalElement === galleryModal && modalGalleryContent) {
                const panZoomContainers = modalGalleryContent.querySelectorAll('.image-pan-zoom-container');
                panZoomContainers.forEach(container => {
                    resetPanZoom(container);
                });
                modalGalleryContent.innerHTML = '';
            }

            if (modalElement === codeModal) {
                const modalCodeContainer = modalElement.querySelector('.modal-code-content');
                if (modalCodeContainer) {
                    modalCodeContainer.innerHTML = '<pre><code class="language-cpp"><!-- Code content will be injected here --></code></pre>';
                }
            }
        };

        modalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            });
        });

        galleryModal.addEventListener('click', (event) => {
            if (event.target === galleryModal) {
                closeModal(galleryModal);
            }
        });

        codeModal.addEventListener('click', (event) => {
            if (event.target === codeModal) {
                closeModal(codeModal);
            }
        });

        const galleryExpandButtons = document.querySelectorAll('.gallery-expand-button');
        galleryExpandButtons.forEach(button => {
            button.addEventListener('click', () => {
                const galleryFrame = button.closest('.gallery-frame');
                if (!galleryFrame || !modalGalleryContent) {
                    return;
                }

                const originalItems = galleryFrame.querySelectorAll('.gallery-item');
                let activeIndex = 0;
                originalItems.forEach((item, index) => {
                    if (item.classList.contains('active')) {
                        activeIndex = index;
                    }
                });

                const frameClone = galleryFrame.cloneNode(true);
                const clonedExpandButton = frameClone.querySelector('.gallery-expand-button');
                if (clonedExpandButton) {
                    clonedExpandButton.remove();
                }

                modalGalleryContent.innerHTML = '';
                modalGalleryContent.appendChild(frameClone);

                initializeGallery(frameClone, activeIndex);

                openModal(galleryModal);
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const visibleModal = document.querySelector('.modal.visible');
                if (visibleModal) {
                    closeModal(visibleModal);
                }
            }
        });
    }

    // No initial highlightAll needed if highlighting on demand
    // if (window.hljs) {
    //     hljs.highlightAll();
    // } else {
    //     console.warn("Highlight.js (hljs) not found. Syntax highlighting may not work.");
    // }

    // Removed initial hljs.highlightAll() call. Highlighting is now done on demand
    // when code snippets are expanded or opened in the modal.

});

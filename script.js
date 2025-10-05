document.addEventListener('DOMContentLoaded', () => {
    console.log("Personal website script loaded.");

    const setupWebGLBackdrop = () => {
        const canvas = document.getElementById('webgl-backdrop');
        if (!canvas) {
            return;
        }

        const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
        if (!gl) {
            console.warn('WebGL unavailable, removing backdrop canvas.');
            canvas.remove();
            return;
        }

        let width = 0;
        let height = 0;
        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            const desiredWidth = Math.round(displayWidth * ratio);
            const desiredHeight = Math.round(displayHeight * ratio);

            if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
                canvas.width = desiredWidth;
                canvas.height = desiredHeight;
            }

            if (width !== desiredWidth || height !== desiredHeight) {
                width = desiredWidth;
                height = desiredHeight;
                gl.viewport(0, 0, width, height);
            }
        };

        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const createProgram = (vsSource, fsSource) => {
            const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
            if (!vertexShader || !fragmentShader) {
                return null;
            }
            const program = gl.createProgram();
            if (!program) return null;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program link error:', gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
            return program;
        };

        const pointProgram = createProgram(
            `attribute vec2 aPosition;\n` +
            `attribute float aStrength;\n` +
            `uniform float uScale;\n` +
            `varying float vStrength;\n` +
            `void main() {\n` +
            `  vStrength = aStrength;\n` +
            `  gl_Position = vec4(aPosition, 0.0, 1.0);\n` +
            `  gl_PointSize = 2.0 + (aStrength * uScale);\n` +
            `}`,
            `precision mediump float;\n` +
            `varying float vStrength;\n` +
            `void main() {\n` +
            `  vec2 coord = gl_PointCoord - 0.5;\n` +
            `  float dist = length(coord);\n` +
            `  float alpha = smoothstep(0.5, 0.0, dist) * (0.25 + vStrength * 0.55);\n` +
            `  vec3 base = vec3(0.72, 0.75, 0.78);\n` +
            `  vec3 accent = vec3(0.35, 1.0, 0.72);\n` +
            `  vec3 color = mix(base, accent, 0.12 + vStrength * 0.25);\n` +
            `  gl_FragColor = vec4(color, alpha);\n` +
            `}`
        );

        const lineProgram = createProgram(
            `attribute vec2 aPosition;\n` +
            `attribute float aStrength;\n` +
            `varying float vStrength;\n` +
            `void main() {\n` +
            `  vStrength = aStrength;\n` +
            `  gl_Position = vec4(aPosition, 0.0, 1.0);\n` +
            `}`,
            `precision mediump float;\n` +
            `varying float vStrength;\n` +
            `void main() {\n` +
            `  float alpha = 0.05 + vStrength * 0.2;\n` +
            `  vec3 color = mix(vec3(0.25, 0.27, 0.32), vec3(0.45, 0.49, 0.55), vStrength);\n` +
            `  gl_FragColor = vec4(color, alpha);\n` +
            `}`
        );

        if (!pointProgram || !lineProgram) {
            console.warn('Failed to initialize WebGL programs.');
            canvas.remove();
            return;
        }

        const pointLocations = {
            position: gl.getAttribLocation(pointProgram, 'aPosition'),
            strength: gl.getAttribLocation(pointProgram, 'aStrength'),
            scale: gl.getUniformLocation(pointProgram, 'uScale'),
        };

        const lineLocations = {
            position: gl.getAttribLocation(lineProgram, 'aPosition'),
            strength: gl.getAttribLocation(lineProgram, 'aStrength'),
        };

        const nodeCount = 96;
        const nodes = Array.from({ length: nodeCount }, () => ({
            angle: Math.random() * Math.PI * 2,
            radius: 0.25 + Math.random() * 0.65,
            speed: 0.35 + Math.random() * 0.6,
            jitter: Math.random() * 6.283,
            strength: 0.35 + Math.random() * 0.5,
        }));

        const edges = [];
        for (let i = 0; i < nodeCount; i++) {
            const hops = 1 + Math.floor(Math.random() * 4);
            const target = (i + hops) % nodeCount;
            edges.push([i, target]);
            if (Math.random() > 0.7) {
                const extra = (i + Math.floor(Math.random() * nodeCount)) % nodeCount;
                edges.push([i, extra]);
            }
        }

        const pointBuffer = gl.createBuffer();
        const lineBuffer = gl.createBuffer();
        const pointData = new Float32Array(nodeCount * 3);
        const lineData = new Float32Array(edges.length * 6);
        const positions = new Float32Array(nodeCount * 2);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const draw = (time) => {
            resize();
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const t = time * 0.0002;

            for (let i = 0; i < nodeCount; i++) {
                const node = nodes[i];
                const swing = Math.sin(time * 0.0003 + node.jitter) * 0.04;
                const radius = node.radius + swing;
                const angle = node.angle + t * node.speed;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius * 0.9;
                positions[i * 2] = x;
                positions[i * 2 + 1] = y;
                pointData[i * 3] = x;
                pointData[i * 3 + 1] = y;
                pointData[i * 3 + 2] = node.strength;
            }

            for (let i = 0; i < edges.length; i++) {
                const [aIndex, bIndex] = edges[i];
                const ax = positions[aIndex * 2];
                const ay = positions[aIndex * 2 + 1];
                const bx = positions[bIndex * 2];
                const by = positions[bIndex * 2 + 1];
                const strength = (nodes[aIndex].strength + nodes[bIndex].strength) * 0.5;
                lineData[i * 6] = ax;
                lineData[i * 6 + 1] = ay;
                lineData[i * 6 + 2] = strength;
                lineData[i * 6 + 3] = bx;
                lineData[i * 6 + 4] = by;
                lineData[i * 6 + 5] = strength;
            }

            gl.useProgram(lineProgram);
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(lineLocations.position);
            gl.vertexAttribPointer(lineLocations.position, 2, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(lineLocations.strength);
            gl.vertexAttribPointer(lineLocations.strength, 1, gl.FLOAT, false, 12, 8);
            gl.drawArrays(gl.LINES, 0, edges.length * 2);

            gl.useProgram(pointProgram);
            gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(pointLocations.position);
            gl.vertexAttribPointer(pointLocations.position, 2, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(pointLocations.strength);
            gl.vertexAttribPointer(pointLocations.strength, 1, gl.FLOAT, false, 12, 8);
            const scale = Math.max(4.5, (window.devicePixelRatio || 1) * 4.5);
            gl.uniform1f(pointLocations.scale, scale);
            gl.drawArrays(gl.POINTS, 0, nodeCount);

            requestAnimationFrame(draw);
        };

        resize();
        requestAnimationFrame(draw);
        window.addEventListener('resize', resize);
    };

    setupWebGLBackdrop();

    const galleryModal = document.getElementById('gallery-modal');
    const codeModal = document.getElementById('code-modal');
    let openModal = () => {};
    let closeModal = () => {};

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
        const expandPlaceholder = controls?.querySelector('.code-expand-placeholder'); // Get the placeholder

        if (!controls || !toggleButton || !codeSnippet || !expandPlaceholder) {
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
                toggleButton.innerHTML = '<i class="fas fa-code"></i> Hide Code';
                // Add expand icon to placeholder (CSS handles styling)
                expandPlaceholder.innerHTML = '<i class="fas fa-expand code-expand-icon" aria-label="Expand Code" role="button"></i>';

                // --- Explicitly highlight this block when expanded ---
                const codeElement = codeSnippet.querySelector('pre code');
                if (codeElement && window.hljs && typeof hljs.highlightElement === 'function') {
                    // Check if it's already highlighted to avoid re-processing
                    if (!codeElement.classList.contains('hljs')) {
                        // Use setTimeout to ensure the element is rendered before highlighting
                        setTimeout(() => {
                            try {
                                hljs.highlightElement(codeElement);
                                // Line numbers are only added in the modal view now
                            } catch (e) {
                                console.error("Highlight.js inline highlighting failed:", e);
                            }
                        }, 0);
                    }
                } else {
                    console.warn("Highlight.js or code element not found for inline highlighting.");
                }
                // --- End explicit highlighting ---

            } else {
                // Collapse the code snippet
                codeSnippet.classList.add('collapsed');
                controls.classList.remove('controls-expanded'); // Remove class from container
                toggleButton.setAttribute('aria-expanded', 'false');
                toggleButton.innerHTML = '<i class="fas fa-code"></i> Show Code';
                // Remove expand icon from placeholder
                expandPlaceholder.innerHTML = '';
            }
        });

        // Delegated listener for the expand icon click within the controls container
        controls.addEventListener('click', (event) => {
            // Check if the click target is the expand icon
            if (event.target.classList.contains('code-expand-icon')) {
                const preElement = codeSnippet.querySelector('pre');
                if (preElement) {
                    // Clone the entire <pre> element
                    const preClone = preElement.cloneNode(true);

                    // Get the target container in the modal
                    const modalCodeContainer = codeModal?.querySelector('.modal-code-content');
                    if (modalCodeContainer && typeof openModal === 'function') {
                        modalCodeContainer.innerHTML = '';
                        modalCodeContainer.appendChild(preClone);
                        if (codeModal) {
                            openModal(codeModal);
                        }
                    } else {
                        console.error("Modal code content container not found.");
                    }
                } else {
                     console.error("Original <pre> element not found to clone.");
                }
            }
        });


        // Set initial state for the toggle button and expand icon
        if (codeSnippet.classList.contains('collapsed')) {
            controls.classList.remove('controls-expanded'); // Ensure class is removed initially
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.innerHTML = '<i class="fas fa-code"></i> Show Code';
            expandPlaceholder.innerHTML = ''; // Ensure placeholder is empty initially
        } else {
            controls.classList.add('controls-expanded'); // Ensure class is added initially
            toggleButton.setAttribute('aria-expanded', 'true');
            toggleButton.innerHTML = '<i class="fas fa-code"></i> Hide Code';
            // Add expand icon to placeholder initially if not collapsed (CSS handles styling)
            expandPlaceholder.innerHTML = '<i class="fas fa-expand code-expand-icon" aria-label="Expand Code" role="button"></i>';
        }
    });

    // --- TOC Scroll Highlighting ---
    const tocLinks = document.querySelectorAll('#toc a[href^="#"]');
    const sections = [];
    tocLinks.forEach(link => {
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

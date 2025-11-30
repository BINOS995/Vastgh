// Publications Portal JavaScript

// Global variables
let publications = [];
let filteredPublications = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Prevent duplicate initialization
    if (window.vastGhanaAppInitialized) return;
    window.vastGhanaAppInitialized = true;
    
    // Initialize the application
    initApp();
});

// Initialize the application
async function initApp() {
    try {
        // Load publications data
        const response = await fetch('publications.json');
        publications = await response.json();
        filteredPublications = [...publications];
        
        // Check if we're on the publication details page
        if (window.location.pathname.includes('publication-details.html')) {
            loadPublicationDetails();
        } else {
            // We're on the main publications page
            populateYearFilter();
            renderPublications();
            setupEventListeners();
        }
    } catch (error) {
        console.error('Error loading publications:', error);
        showErrorMessage();
    }
}

// Show error message if publications can't be loaded
function showErrorMessage() {
    const publicationsContainer = document.getElementById('publications-container');
    const publicationsList = document.getElementById('publications-list');
    const errorMessage = '<p class="text-center text-danger">Error loading publications. Please try again later.</p>';
    
    if (publicationsContainer) {
        publicationsContainer.innerHTML = errorMessage;
    } else if (publicationsList) {
        publicationsList.innerHTML = errorMessage;
    }
}

// Setup event listeners for search and filtering
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const yearFilter = document.getElementById('year-filter');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPublications);
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', filterPublications);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', filterPublications);
    }
}

// Function to load publication details
function loadPublicationDetails() {
    // Get the publication ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const publicationId = urlParams.get('id');
    
    const detailsContainer = document.querySelector('.publication-details-container');
    if (!detailsContainer) {
        console.error('Publication details container not found');
        return;
    }
    
    if (!publicationId) {
        detailsContainer.innerHTML = 
            '<div class="alert alert-danger">Publication not found</div>';
        return;
    }
    
    // Find the publication with the matching ID
    const publication = publications.find(pub => pub.id === publicationId);
    
    if (!publication) {
        detailsContainer.innerHTML = 
            '<div class="alert alert-danger">Publication not found</div>';
        return;
    }
    
    // Update the page title
    document.title = `${publication.title} | Vision for Accelerated Sustainable Development Ghana`;
    
    // Update the publication details
    // Update specific elements instead of replacing the entire container
    document.getElementById('publication-title').textContent = publication.title;
    document.getElementById('publication-year').textContent = publication.date || publication.year;
    document.getElementById('publication-type').textContent = publication.category;
    document.getElementById('publication-summary').textContent = publication.abstract || publication.summary;
    document.getElementById('publication-date').textContent = publication.date || publication.year;
    document.getElementById('publication-category').textContent = publication.category;
    
    // Update the download button
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.href = publication.file;
    }
    
    // Update the breadcrumb title
    const breadcrumbTitle = document.getElementById('publication-breadcrumb-title');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = publication.title;
    }
    
    // Update the thumbnail image (for publications that have thumbnails)
    const thumbnailImg = document.getElementById('publication-thumbnail');
    if (thumbnailImg) {
        let thumbnailPath = '';
        
        // Map publication IDs to their thumbnail images
        switch(publication.id) {
            case 'pub001':
                thumbnailPath = 'thumbnails/Tobacco Industry Interference in Tobacco Control and Public Health Policies in Ghana.png';
                break;
            case 'pub002':
                thumbnailPath = 'thumbnails/Ghana 2014 Demographic and Health Survey .png';
                break;
            case 'pub003':
                thumbnailPath = 'thumbnails/Economics of Tobacco Control in Ghana.png';
                break;
            case 'pub005':
                thumbnailPath = 'thumbnails/Ghana Tobacco Industry Interference Index 2020 .png';
                break;
            case 'pub007':
                thumbnailPath = 'thumbnails/Ghana National Alcohol Policy.png';
                break;
            case 'pub009':
                thumbnailPath = 'thumbnails/Protecting Public Health - Tobacco Control Measures.png';
                break;
            case 'pub011':
                thumbnailPath = 'thumbnails/VAST Ghana policy brief on strenthening.png';
                break;
            case 'pub004':
                thumbnailPath = 'thumbnails/Ghana-Tobacco-Industry-Interference-Index-2021.png';
                break;
            case 'pub006':
                thumbnailPath = 'thumbnails/Ghana Country Summary - Tobacco Index Report.png';
                break;
            case 'pub008':
                thumbnailPath = 'thumbnails/Fiscal and public health impact of tobacco.png';
                break;
            case 'pub010':
                thumbnailPath = 'thumbnails/Policy Brief - Novel Tobacco and Nicotine Products in Ghana.png';
                break;
        }
        
        if (thumbnailPath) {
            thumbnailImg.src = thumbnailPath;
            thumbnailImg.alt = publication.title;
            thumbnailImg.style.display = 'block';
        } else {
            // Hide thumbnail if not available
            thumbnailImg.style.display = 'none';
        }
    }
    
    // Load related publications (same category)
    loadRelatedPublications(publication);
}

// Function to load related publications
function loadRelatedPublications(currentPublication) {
    const relatedContainer = document.getElementById('related-publications-list');
    if (!relatedContainer) return;
    
    // Find publications in the same category, excluding the current one
    const relatedPublications = publications.filter(pub => 
        pub.category === currentPublication.category && pub.id !== currentPublication.id
    ).slice(0, 3); // Limit to 3 related publications
    
    if (relatedPublications.length === 0) {
        const relatedSection = document.querySelector('.related-publications');
        if (relatedSection) {
            relatedSection.style.display = 'none';
        }
        return;
    }
    
    let relatedHTML = '';
    
    relatedPublications.forEach(pub => {
        relatedHTML += `
            <div class="col-md-4 mb-4">
                <div class="related-publication-card">
                    <div class="related-publication-info">
                        <h4><a href="publication-details.html?id=${pub.id}">${pub.title}</a></h4>
                        <div class="meta-item mb-2">
                            <i class="bi bi-calendar"></i>
                            <span>${pub.date || pub.year}</span>
                        </div>
                        <a href="publication-details.html?id=${pub.id}" class="btn-sm btn-primary">
                            Read More
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    relatedContainer.innerHTML = relatedHTML;
}

// Populate year filter dropdown
function populateYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    if (!yearFilter) return;
    
    // Get unique years from publications
    const years = [...new Set(publications.map(pub => pub.year))];
    years.sort((a, b) => b - a); // Sort in descending order
    
    // Add options to the dropdown
    yearFilter.innerHTML = '<option value="">All Years</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Render publications
function renderPublications() {
    console.log('renderPublications called with', filteredPublications.length, 'publications');
    const publicationsContainer = document.getElementById('publications-container');
    const publicationsList = document.getElementById('publications-list');
    
    // Handle the case for the new publications.html page
    if (publicationsContainer) {
        publicationsContainer.innerHTML = '';

        if (filteredPublications.length === 0) {
            publicationsContainer.innerHTML = '<p>No publications found matching your criteria.</p>';
            return;
        }

        filteredPublications.forEach(publication => {
            const publicationCard = document.createElement('div');
            publicationCard.className = 'publication-card';
            
            // Format the date display
            const displayDate = publication.date || publication.year;
            
            // Add thumbnail for publications that have thumbnail images
            let thumbnailHTML = '';
            let thumbnailPath = '';
            
            // Map publication IDs to their thumbnail images
            switch(publication.id) {
                case 'pub001':
                    thumbnailPath = 'thumbnails/Tobacco Industry Interference in Tobacco Control and Public Health Policies in Ghana.png';
                    break;
                case 'pub002':
                    thumbnailPath = 'thumbnails/Ghana 2014 Demographic and Health Survey .png';
                    break;
                case 'pub003':
                    thumbnailPath = 'thumbnails/Economics of Tobacco Control in Ghana.png';
                    break;
                case 'pub005':
                    thumbnailPath = 'thumbnails/Ghana Tobacco Industry Interference Index 2020 .png';
                    break;
                case 'pub007':
                    thumbnailPath = 'thumbnails/Ghana National Alcohol Policy.png';
                    break;
                case 'pub009':
                    thumbnailPath = 'thumbnails/Protecting Public Health - Tobacco Control Measures.png';
                    break;
                case 'pub011':
                    thumbnailPath = 'thumbnails/VAST Ghana policy brief on strenthening.png';
                    break;
                case 'pub004':
                    thumbnailPath = 'thumbnails/Ghana-Tobacco-Industry-Interference-Index-2021.png';
                    break;
                case 'pub006':
                    thumbnailPath = 'thumbnails/Ghana Country Summary - Tobacco Index Report.png';
                    break;
                case 'pub008':
                    thumbnailPath = 'thumbnails/Fiscal and public health impact of tobacco.png';
                    break;
                case 'pub010':
                    thumbnailPath = 'thumbnails/Policy Brief - Novel Tobacco and Nicotine Products in Ghana.png';
                    break;
            }
            
            if (thumbnailPath) {
                console.log('Adding thumbnail for publication:', publication.title);
                console.log('Publication ID:', publication.id);
                thumbnailHTML = `
                    <div class="publication-thumbnail">
                        <img src="${thumbnailPath}" 
                             alt="${publication.title}" 
                             class="publication-thumbnail-img"
                             loading="lazy">
                    </div>
                `;
            }
            
            publicationCard.innerHTML = `
                ${thumbnailHTML}
                <div class="card-date">${displayDate}</div>
                <h3 class="publication-title">
                    <a href="publication-details.html?id=${publication.id}">${publication.title}</a>
                </h3>
                <div class="publication-summary">${publication.summary}</div>
                <div class="card-actions">
                    <a href="${publication.file}" class="btn-outline" download>
                            <i class="bi bi-download"></i> Download
                        </a>
                    <a href="publication-details.html?id=${publication.id}" class="btn-primary">
                        <i class="bi bi-book"></i> Read More
                    </a>
                </div>
            `;

            publicationsContainer.appendChild(publicationCard);
        });
        return;
    }
    
    // Handle the case for the old publications list
    if (publicationsList) {
        if (filteredPublications.length === 0) {
            publicationsList.innerHTML = '';
            publicationsList.innerHTML = '<p>No publications found matching your criteria.</p>';
            return;
        }
        
        publicationsList.innerHTML = filteredPublications.map(publication => {
            // Format the date display
            const displayDate = publication.date || publication.year;
            
            // Add thumbnail for the specific publication (right book)
            let thumbnailHTML = '';
            if (publication.id === 'pub001') {
                console.log('Adding thumbnail for publication (old list):', publication.title);
                thumbnailHTML = `
                    <div class="publication-thumbnail">
                        <img src="thumbnails/Tobacco Industry Interference in Tobacco Control and Public Health Policies in Ghana.png" 
                             alt="${publication.title}" 
                             class="publication-thumbnail-img"
                             loading="lazy">
                    </div>
                `;
            }
            
            return `
                <div class="publication-card">
                    ${thumbnailHTML}
                    <div class="card-date">${displayDate}</div>
                    <h3 class="publication-title">
                        <a href="publication-details.html?id=${publication.id || ''}">${publication.title}</a>
                    </h3>
                    <div class="publication-summary">${publication.summary}</div>
                    <div class="card-actions">
                        <a href="${publication.file}" class="btn-outline" download>
                            <i class="bi bi-download"></i> Download
                        </a>
                        <a href="publication-details.html?id=${publication.id || ''}" class="btn-primary">
                            <i class="bi bi-book"></i> Read More
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Filter publications based on search term and year
function filterPublications(event) {
    // Get search term and year filter values
    const searchInput = document.getElementById('search-input');
    const yearFilter = document.getElementById('year-filter');
    
    let searchTerm = '';
    let year = '';
    
    if (searchInput) {
        searchTerm = searchInput.value.toLowerCase();
    }
    
    if (yearFilter) {
        year = yearFilter.value;
    }
    
    // Filter publications
    filteredPublications = publications.filter(publication => {
        const matchesSearch = searchTerm === '' || 
            publication.title.toLowerCase().includes(searchTerm) || 
            publication.summary.toLowerCase().includes(searchTerm);
        
        const matchesYear = year === '' || publication.year === year;
        
        return matchesSearch && matchesYear;
    });
    
    // Render filtered publications
    renderPublications();
}
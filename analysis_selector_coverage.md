Selector | Páginas | En backup | En comp. Sass | Espec. backup | Espec. comp. | Diferencias clave | Parcial sugerido
---|---|---|---|---|---|---|---
.about-section h2 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/responsive/_media-queries.scss
.cart-item | - | Sí | Sí | 0/1/0 | 0/1/0 | box-shadow: 0 2px 10px var(--shadow) -> 0 2px 10px rgba(0, 0, 0, 0.1); @media all | sass/responsive/_media-queries.scss
.cart-item-controls | - | Sí | Sí | 0/1/0 | 0/1/0 | background: var(--light-gray) -> #ecf0f1; @media all | sass/pages/_cart.scss
.cart-item-details h4 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/pages/_cart.scss
.cart-item-image:not([src]) | - | Sí | Sí | 0/3/0 | 0/3/0 | background: linear-gradient(45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(-45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--light-gray) 75%), linear-gradient(-45deg, transparent 75%, var(--light-gray) 75%) -> linear-gradient(45deg, #ecf0f1 25%, transparent 25%), linear-gradient(-45deg, #ecf0f1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ecf0f1 75%), linear-gradient(-45deg, transparent 75%, #ecf0f1 75%); background-color: var(--medium-gray) -> #bdc3c7; color: var(--white) -> #fff; @media all | sass/pages/_cart.scss
.cart-item-image[src=""] | - | Sí | Sí | 0/2/0 | 0/2/0 | background: linear-gradient(45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(-45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--light-gray) 75%), linear-gradient(-45deg, transparent 75%, var(--light-gray) 75%) -> linear-gradient(45deg, #ecf0f1 25%, transparent 25%), linear-gradient(-45deg, #ecf0f1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ecf0f1 75%), linear-gradient(-45deg, transparent 75%, #ecf0f1 75%); background-color: var(--medium-gray) -> #bdc3c7; color: var(--white) -> #fff; @media all | sass/responsive/_media-queries.scss
.cart-item-price | - | Sí | Sí | 0/1/0 | 0/1/0 | color: var(--medium-gray) -> #bdc3c7; @media all | sass/pages/_cart.scss
.cart-item-total | - | Sí | Sí | 0/1/0 | 0/1/0 | color: var(--primary-color) -> #e67e22; @media all | sass/pages/_cart.scss
.cart-summary | - | Sí | Sí | 0/1/0 | 0/1/0 | box-shadow: 0 2px 10px var(--shadow) -> 0 2px 10px rgba(0, 0, 0, 0.1); @media all | sass/pages/_cart.scss
.cart-summary h3 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/pages/_cart.scss
.craftivity-nav | - | Sí | Sí | 0/1/0 | 0/1/0 | @media (max-width: 768px) | sass/layout/_nav.scss
.craftivity-nav li:nth-child(2) | - | Sí | Sí | 0/2/1 | 0/2/1 | @media (max-width: 768px) | sass/responsive/_media-queries.scss
.craftivity-nav li:nth-child(3) | - | Sí | Sí | 0/2/1 | 0/2/1 | @media (max-width: 768px) | sass/layout/_nav.scss
.craftivity-nav.show li:nth-child(2) | - | Sí | Sí | 0/3/1 | 0/3/1 | @media (max-width: 768px) | sass/layout/_nav.scss
.craftivity-nav.show li:nth-child(3) | - | Sí | Sí | 0/3/1 | 0/3/1 | @media (max-width: 768px) | sass/responsive/_media-queries.scss
.empty-cart-message | - | Sí | Sí | 0/1/0 | 0/1/0 | color: var(--medium-gray) -> #bdc3c7; @media all | sass/pages/_cart.scss
.error:not(input):not(select):not(textarea) | - | Sí | Sí | 0/4/0 | 0/4/0 | color: var(--danger-color) -> #e74c3c; @media all | sass/base/_utilities.scss
.feature | - | Sí | Sí | 0/1/0 | 0/1/0 | box-shadow: 0 5px 20px var(--shadow) -> 0 5px 20px rgba(0, 0, 0, 0.1); @media all | sass/responsive/_media-queries.scss
.feature h3 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--primary-color) -> #e67e22; @media all | sass/responsive/_media-queries.scss
.featured-categories h2 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/responsive/_media-queries.scss
.loading | - | Sí | Sí | 0/1/0 | 0/1/0 | color: var(--medium-gray) -> #bdc3c7; @media all | sass/pages/_products.scss
.login-prompt | - | Sí | Sí | 0/1/0 | 0/1/0 | border: 3px solid var(--primary-color) -> 3px solid #e67e22; @media all | sass/components/_modals.scss
.login-prompt .close-button | - | Sí | Sí | 0/2/0 | 0/2/0 | color: var(--medium-gray) -> #bdc3c7; @media all | sass/components/_modals.scss
.login-prompt .close-button:hover | - | Sí | Sí | 0/3/0 | 0/3/0 | background: var(--light-gray) -> #ecf0f1; @media all | sass/components/_modals.scss
.login-prompt h3 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/components/_modals.scss
.login-prompt p | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--medium-gray) -> #bdc3c7; @media all | sass/components/_modals.scss
.nav-links a:hover | - | Sí | Sí | 0/2/1 | 0/2/1 | @media (max-width: 768px) | sass/responsive/_media-queries.scss
.newsletter-form input | - | Sí | Sí | 0/1/1 | 0/1/1 | border: 2px solid var(--light-gray) -> 2px solid #ecf0f1; +transition:border-color 0.3s ease; @media all | sass/responsive/_media-queries.scss
.newsletter-form input:focus | - | Sí | Sí | 0/2/1 | 0/2/1 | border-color: var(--primary-color) -> #e67e22; @media all | sass/responsive/_media-queries.scss
.notification.error | - | Sí | Sí | 0/2/0 | 0/2/0 | background-color: var(--danger-color) -> #e74c3c; @media all | sass/base/_utilities.scss
.notification.success | - | Sí | Sí | 0/2/0 | 0/2/0 | background-color: var(--success-color) -> #27ae60; @media all | sass/base/_utilities.scss
.offer-badge | - | Sí | Sí | 0/1/0 | 0/1/0 | background: var(--danger-color) -> #e74c3c; @media all | sass/responsive/_media-queries.scss
.offer-card | - | Sí | Sí | 0/1/0 | 0/1/0 | border: 2px solid var(--accent-color) -> 2px solid #f39c12; @media all | sass/responsive/_media-queries.scss
.offers-section h2 | - | Sí | Sí | 0/1/1 | 0/1/1 | color: var(--secondary-color) -> #2c3e50; @media all | sass/responsive/_media-queries.scss
.product-id-detail | - | Sí | Sí | 0/1/0 | 0/1/0 | +background:rgba(230, 126, 34, 0.1); @media all | sass/pages/_product-details.scss
.product-image:not([src]) | - | Sí | Sí | 0/3/0 | 0/3/0 | background: linear-gradient(45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(-45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--light-gray) 75%), linear-gradient(-45deg, transparent 75%, var(--light-gray) 75%) -> linear-gradient(45deg, #ecf0f1 25%, transparent 25%), linear-gradient(-45deg, #ecf0f1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ecf0f1 75%), linear-gradient(-45deg, transparent 75%, #ecf0f1 75%); background-color: var(--medium-gray) -> #bdc3c7; color: var(--white) -> #fff; @media all | sass/pages/_home.scss
.product-image[src=""] | - | Sí | Sí | 0/2/0 | 0/2/0 | background: linear-gradient(45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(-45deg, var(--light-gray) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--light-gray) 75%), linear-gradient(-45deg, transparent 75%, var(--light-gray) 75%) -> linear-gradient(45deg, #ecf0f1 25%, transparent 25%), linear-gradient(-45deg, #ecf0f1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ecf0f1 75%), linear-gradient(-45deg, transparent 75%, #ecf0f1 75%); background-color: var(--medium-gray) -> #bdc3c7; color: var(--white) -> #fff; @media all | sass/responsive/_media-queries.scss
.quantity-btn | - | Sí | Sí | 0/1/0 | 0/1/0 | background: var(--primary-color) -> #e67e22; @media all | sass/pages/_cart.scss
.quantity-btn:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | background: var(--accent-color) -> #f39c12; @media all | sass/pages/_cart.scss
.remove-btn:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | background: var(--danger-color) -> #e74c3c; @media all | sass/pages/_cart.scss
.success-message | - | Sí | Sí | 0/1/0 | 0/1/0 | background-color: var(--success-color) -> #27ae60; @media all | sass/components/_modals.scss
.summary-line.total | - | Sí | Sí | 0/2/0 | 0/2/0 | border-top: 2px solid var(--light-gray) -> 2px solid #ecf0f1; @media all | sass/pages/_cart.scss
.user-menu | - | Sí | Sí | 0/1/0 | 0/1/0 | border: 1px solid var(--light-gray) -> 1px solid #ecf0f1; box-shadow: 0 5px 20px var(--shadow) -> 0 5px 20px rgba(0, 0, 0, 0.1); @media all | sass/components/_modals.scss
.user-menu-item | - | Sí | Sí | 0/1/0 | 0/1/0 | color: var(--secondary-color) -> #2c3e50; @media all | sass/components/_modals.scss
.user-menu-item.logout | - | Sí | Sí | 0/2/0 | 0/2/0 | color: var(--danger-color) -> #e74c3c; @media all | sass/components/_modals.scss
.user-menu-item:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | color: var(--primary-color) -> #e67e22; @media all | sass/components/_modals.scss
.user-menu-separator | - | Sí | Sí | 0/1/0 | 0/1/0 | border-top: 1px solid var(--light-gray) -> 1px solid #ecf0f1; @media all | sass/components/_modals.scss
:root | - | Sí | No | 0/1/0 | - | Regla ausente en compilado | 
body | - | Sí | Sí | 0/0/1 | 0/0/1 | font-family: var(--font-family) -> "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; color: var(--secondary-color) -> #2c3e50; background-color: var(--light-gray) -> #ecf0f1; font-size: var(--font-size-base) -> 1rem; @media all | 
#charCount | - | Sí | Sí | 1/0/0 | 1/0/0 | Ok | 
#noResults | - | Sí | Sí | 1/0/0 | 1/0/0 | Ok | 
#relatedProductsCarousel | - | Sí | Sí | 1/0/0 | 1/0/0 | Ok | 
#relatedProductsCarousel .carousel-control-next | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | sass/pages/_product-details.scss
#relatedProductsCarousel .carousel-control-next-icon | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | sass/pages/_product-details.scss
#relatedProductsCarousel .carousel-control-next:hover | - | Sí | Sí | 1/2/0 | 1/2/0 | Ok | sass/pages/_sobre-nosotros.scss
#relatedProductsCarousel .carousel-control-prev | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | sass/pages/_product-details.scss
#relatedProductsCarousel .carousel-control-prev-icon | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | sass/pages/_product-details.scss
#relatedProductsCarousel .carousel-control-prev:hover | - | Sí | Sí | 1/2/0 | 1/2/0 | Ok | sass/pages/_sobre-nosotros.scss
#relatedProductsCarousel .carousel-inner | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | sass/pages/_login.scss
#reviewText | - | Sí | Sí | 1/0/0 | 1/0/0 | Ok | 
#reviewText:focus | - | Sí | Sí | 1/1/0 | 1/1/0 | Ok | 
* | - | Sí | Sí | 0/0/0 | 0/0/0 | Ok | 
.about-hero | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_sobre-nosotros.scss
.about-hero h1 | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/components/_hero.scss
.about-hero p | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_sobre-nosotros.scss
.about-section | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/responsive/_media-queries.scss
.badge-featured-detail | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_product-details.scss
.badge-flash-detail | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_product-details.scss
.badge-flash-detail::before | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_product-details.scss
.breadcrumb-nav | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_login.scss
.breadcrumb-nav a | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_login.scss
.breadcrumb-nav a:hover | - | Sí | Sí | 0/2/1 | 0/2/1 | Ok | sass/pages/_login.scss
.breadcrumb-nav span | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_login.scss
.breadcrumbs | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_login.scss
.btn | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_home.scss
.btn-large | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_sobre-nosotros.scss
.btn-large:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_product-details.scss
.btn-primary | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_product-details.scss
.btn-primary:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_product-details.scss
.btn-secondary | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/components/_buttons.scss
.btn-secondary:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/components/_buttons.scss
.btn-view-related | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_sobre-nosotros.scss
.btn-view-related:hover | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_sobre-nosotros.scss
.carousel-btn | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_home.scss
.carousel-btn.disabled | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_home.scss
.carousel-btn:disabled | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_home.scss
.carousel-btn:hover:not(.disabled) | - | Sí | Sí | 0/4/0 | 0/4/0 | Ok | sass/pages/_home.scss
.carousel-container | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_home.scss
.carousel-track | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_home.scss
.carousel-track .product-card | - | Sí | Sí | 0/2/0 | 0/2/0 | Ok | sass/pages/_home.scss
.cart-content | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/base/_utilities.scss
.cart-item-image | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_cart.scss
.cart-items | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_cart.scss
.catalog-controls | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/components/_hero.scss
.catalog-hero | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/components/_hero.scss
.catalog-hero h1 | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_sobre-nosotros.scss
.catalog-hero p | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_sobre-nosotros.scss
.category-container | - | Sí | Sí | 0/1/0 | 0/1/0 | Ok | sass/pages/_sobre-nosotros.scss
.category-container label | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_sobre-nosotros.scss
.category-container select | - | Sí | Sí | 0/1/1 | 0/1/1 | Ok | sass/pages/_sobre-nosotros.scss

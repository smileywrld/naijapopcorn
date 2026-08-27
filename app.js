const CART_KEY = "naija-pop-cart";
const money = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
});
function getCart() {
	try {
		return JSON.parse(localStorage.getItem(CART_KEY)) || [];
	} catch {
		return [];
	}
}
function saveCart(cart) {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function formatPrice(price) {
	return money.format(price);
}
function productFor(id) {
	return PRODUCTS.find((product) => product.id === Number(id));
}
function cartCount() {
	return getCart().reduce((total, item) => total + item.quantity, 0);
}
function updateBadges() {
	document.querySelectorAll("[data-cart-count]").forEach((badge) => {
		badge.textContent = cartCount();
	});
}
function addToCart(id, size = "Small", quantity = 1) {
	const product = productFor(id);
	if (!product) return;
	const cart = getCart();
	const item = cart.find(
		(entry) => entry.id === product.id && entry.size === size,
	);
	if (item) item.quantity += quantity;
	else cart.push({ id: product.id, size, quantity });
	saveCart(cart);
	updateBadges();
}
function productCard(product) {
	const fromPrice = Math.min(...Object.values(product.prices));
	return `<article class="product-card product-card--link"><a class="product-card__media" href="product.html?id=${product.id}"><img class="product-card__image" src="${product.image}" alt="${product.name}"></a><div class="product-card__body"><span class="product-card__category">${product.category}</span><h3 class="product-card__name"><a href="product.html?id=${product.id}">${product.name}</a></h3><p class="product-card__price">From ${formatPrice(fromPrice)}</p><div class="product-card__actions"><div class="product-card__qty" aria-label="Quantity for ${product.name}"><button class="qty-btn" type="button" data-card-quantity="-1" aria-label="Decrease ${product.name} quantity">−</button><span class="qty-value" data-quantity-value>1</span><button class="qty-btn" type="button" data-card-quantity="1" aria-label="Increase ${product.name} quantity">+</button></div><a class="product-card__link" href="product.html?id=${product.id}">View details <span aria-hidden="true">→</span></a><button class="product-card__cta" type="button" data-card-add="${product.id}">Add to cart</button></div></div></article>`;
}
function renderProductGrid() {
	const grid = document.querySelector("[data-product-grid]");
	if (grid) grid.innerHTML = PRODUCTS.map(productCard).join("");
}
function setupProductPage() {
	const root = document.querySelector("[data-product-page]");
	if (!root) return;
	const product = productFor(
		new URLSearchParams(window.location.search).get("id"),
	);
	if (!product) {
		window.location.href = "index.html#shop";
		return;
	}
	document.title = `${product.name} | NAIJA POP`;
	root.innerHTML = `<div class="product-detail__image-wrap"><img src="${product.image}" alt="${product.name}"></div><div class="product-detail__copy"><a class="back-link" href="index.html#shop">← Back to shop</a><p class="eyebrow">${product.category}</p><h1>${product.name}</h1><p class="product-detail__intro">${product.description}</p><p class="product-detail__note">${product.note}</p><div class="size-picker"><span>Choose your size</span><div>${Object.entries(
		product.prices,
	)
		.map(
			([size, price], index) =>
				`<label><input type="radio" name="size" value="${size}" ${index === 0 ? "checked" : ""}><span>${size}<small>${formatPrice(price)}</small></span></label>`,
		)
		.join(
			"",
		)}</div></div><div class="product-detail__purchase"><div class="product-card__qty" aria-label="Quantity for ${product.name}"><button class="qty-btn" type="button" data-detail-quantity="-1" aria-label="Decrease quantity">−</button><span class="qty-value" data-detail-quantity-value>1</span><button class="qty-btn" type="button" data-detail-quantity="1" aria-label="Increase quantity">+</button></div><button class="primary-button" type="button" data-add-product="${product.id}">Add to cart <span>→</span></button></div><p class="product-detail__fineprint">Freshly made in small batches. Please allow time for a little happiness.</p></div>`;
}
function changeItem(id, size, adjustment) {
	const cart = getCart();
	const item = cart.find(
		(entry) => entry.id === Number(id) && entry.size === size,
	);
	if (!item) return;
	item.quantity += adjustment;
	saveCart(cart.filter((entry) => entry.quantity > 0));
	renderCart();
	updateBadges();
}
function renderCart() {
	const root = document.querySelector("[data-cart-page]");
	if (!root) return;
	const cart = getCart();
	const detailed = cart
		.map((item) => ({ ...item, product: productFor(item.id) }))
		.filter((item) => item.product);
	const total = detailed.reduce(
		(sum, item) => sum + item.product.prices[item.size] * item.quantity,
		0,
	);
	if (!detailed.length) {
		root.innerHTML = `<section class="cart-empty"><img src="./illustration-empty-cart.svg" alt=""><p class="eyebrow">Your bag is waiting</p><h1>Nothing here just yet.</h1><p>Find a flavour for the moment, then we’ll keep it safe here.</p><a class="primary-button" href="index.html#shop">Browse the collection <span>→</span></a></section>`;
		return;
	}
	root.innerHTML = `<div class="cart-layout"><section><p class="eyebrow">Your selection</p><h1>Your snack bag <span>(${cartCount()})</span></h1><div class="cart-list">${detailed
		.map((item) => {
			const price = item.product.prices[item.size];
			return `<article class="cart-row"><img src="${item.product.image}" alt="${item.product.name}"><div class="cart-row__info"><p>${item.product.name}</p><span>${item.size} bag · ${formatPrice(price)}</span><button data-remove="${item.id}" data-size="${item.size}">Remove</button></div><div class="cart-row__controls"><div><button aria-label="Remove one" data-change="-1" data-id="${item.id}" data-size="${item.size}">−</button><span>${item.quantity}</span><button aria-label="Add one" data-change="1" data-id="${item.id}" data-size="${item.size}">+</button></div><strong>${formatPrice(price * item.quantity)}</strong></div></article>`;
		})
		.join(
			"",
		)}</div><a class="continue-link" href="index.html#shop">← Continue shopping</a></section><aside class="order-summary"><p class="eyebrow">Order summary</p><h2>A little joy, on its way.</h2><div><span>Subtotal</span><strong>${formatPrice(total)}</strong></div><div><span>Delivery</span><span>Calculated at checkout</span></div><div class="order-summary__total"><span>Total</span><strong>${formatPrice(total)}</strong></div><button class="primary-button" type="button" data-checkout>Continue to checkout <span>→</span></button><p>Secure checkout · We’ll confirm delivery details next.</p></aside></div>`;
}
function showConfirmation() {
	const modal = document.querySelector("[data-confirmation]");
	if (!modal) return;
	modal.classList.add("is-visible");
	modal.setAttribute("aria-hidden", "false");
}
document.addEventListener("click", (event) => {
	const add = event.target.closest("[data-add-product]");
	if (add) {
		const size =
			document.querySelector('input[name="size"]:checked')?.value || "Small";
		addToCart(add.dataset.addProduct, size);
		add.textContent = "Added to your bag ✓";
		setTimeout(() => {
			add.innerHTML = "Add to cart <span>→</span>";
		}, 1600);
	}
	const change = event.target.closest("[data-change]");
	if (change)
		changeItem(
			change.dataset.id,
			change.dataset.size,
			Number(change.dataset.change),
		);
	const remove = event.target.closest("[data-remove]");
	if (remove) {
		saveCart(
			getCart().filter(
				(item) =>
					!(
						item.id === Number(remove.dataset.remove) &&
						item.size === remove.dataset.size
					),
			),
		);
		renderCart();
		updateBadges();
	}
	if (event.target.closest("[data-checkout]")) showConfirmation();
	if (event.target.closest("[data-new-order]")) {
		saveCart([]);
		window.location.href = "index.html#shop";
	}
	if (event.target.matches("[data-confirmation]"))
		event.target.classList.remove("is-visible");
});
renderProductGrid();
setupProductPage();
renderCart();
updateBadges();

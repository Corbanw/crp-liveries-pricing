// Quantity control functionality + total calculation
document.addEventListener('DOMContentLoaded', function () {
    const quantityControls = document.querySelectorAll('.quantity-control');
    const totalElement = document.querySelector('#totalPrice'); // The element showing the total price



    const formatCurrency = (value) => {
        return `${value} Robux`;
    };

    const updateCardActiveState = (control, quantity) => {
        const card = control.closest('.livery-item, .addon-item');
        if (quantity > 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    };

    const updateLiveTotal = (control, quantity, price) => {
        const card = control.closest('.livery-item, .addon-item, .bundle-item');
        if (!card) return;

        const liveTotalElement = card.querySelector('.live-total');
        if (!liveTotalElement) return;

        const calculationElement = liveTotalElement.querySelector('.calculation');
        const totalAmountElement = liveTotalElement.querySelector('.total-amount');

        if (!calculationElement || !totalAmountElement) return;

        if (quantity > 0) {
            const total = quantity * price;
            calculationElement.textContent = `${price} × ${quantity} = `;
            totalAmountElement.textContent = `${total} Robux`;
            liveTotalElement.classList.add('visible');
        } else {
            liveTotalElement.classList.remove('visible');
        }
    };

    const animateButton = (button) => {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    };

    const animateValueChange = (input) => {
        input.classList.add('changed');
        setTimeout(() => {
            input.classList.remove('changed');
        }, 300);

        // Also animate the price
        const priceElement = input.closest('.livery-item, .addon-item').querySelector('.price');
        if (priceElement) {
            priceElement.classList.add('highlight');
            setTimeout(() => {
                priceElement.classList.remove('highlight');
            }, 500);
        }
    };

    const updateProgressBar = (totalItems) => {
        const progressBar = document.querySelector('#progressBar');
        const progressText = document.querySelector('#progressText');

        if (!progressBar || !progressText) return;

        let progress = 0;
        let text = '';

        if (totalItems >= 10) {
            progress = 100;
            text = '🎉 10% Discount Unlocked!';
        } else if (totalItems >= 5) {
            progress = 100;
            text = '🎉 5% Discount Unlocked!';
        } else if (totalItems >= 3) {
            const remaining = 5 - totalItems;
            progress = (totalItems / 5) * 100;
            text = `${remaining} more items for 5% discount`;
        } else {
            progress = (totalItems / 5) * 100;
            text = 'Add 5 items for 5% discount';
        }

        progressBar.style.width = `${progress}%`;
        progressText.textContent = text;
    };

    const calculateTotal = () => {
        let subtotal = 0;
        let totalItems = 0;

        quantityControls.forEach(control => {
            const input = control.querySelector('.quantity-buttons .quantity-input');
            if (!input) return; // Skip if input not found

            const price = parseFloat(control.dataset.price) || 0;
            const quantity = parseInt(input.value) || 0;
            subtotal += price * quantity;
            totalItems += quantity;

            // Update card active state and live totals
            updateCardActiveState(control, quantity);
            updateLiveTotal(control, quantity, price);
        });

        // Update progress bar
        updateProgressBar(totalItems);

        // Animate total change
        if (totalElement) {
            totalElement.classList.add('updating');
            setTimeout(() => {
                totalElement.classList.remove('updating');
            }, 500);
        }

        // Apply discounts
        const discountInfo = document.querySelector('#discountInfo');
        const subtotalElement = document.querySelector('#subtotalPrice');
        const discountLine = document.querySelector('#discountLine');
        const discountAmount = document.querySelector('#discountAmount');

        let discount = 0;
        let discountText = 'No discount applied';

        if (totalItems >= 10) {
            discount = 0.10;
            discountText = '10% Discount Applied!';
        } else if (totalItems >= 5) {
            discount = 0.05;
            discountText = '5% Discount Applied!';
        }

        const savings = Math.round(subtotal * discount);
        const finalTotal = Math.round(subtotal * (1 - discount));

        // Update subtotal
        if (subtotalElement) {
            subtotalElement.innerHTML = `<span class="robux-icon"></span>${formatCurrency(subtotal)}`;
        }

        // Update discount info
        if (discountInfo) {
            if (discount > 0) {
                discountInfo.innerHTML = `<span class="discount-success">${discountText}</span><span class="savings-amount">Save ${savings} Robux</span>`;
                if (discountLine) discountLine.style.display = 'flex';
                if (discountAmount) discountAmount.textContent = `-${savings} Robux`;
            } else {
                discountInfo.textContent = discountText;
                discountInfo.className = '';
                if (discountLine) discountLine.style.display = 'none';
            }
        }

        // Update final total
        if (totalElement) {
            totalElement.innerHTML = `<span class="robux-icon"></span>${formatCurrency(finalTotal)}`;
        }
    };

    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.quantity-buttons .minus');
        const plusBtn = control.querySelector('.quantity-buttons .plus');
        const input = control.querySelector('.quantity-buttons .quantity-input');

        if (!minusBtn || !plusBtn || !input) {
            return; // Skip if elements are missing
        }

        const updateValue = (newValue) => {
            if (newValue < 0) newValue = 0;
            input.value = newValue;
            animateValueChange(input);
            calculateTotal(); // This will update totals and active states
        };

        minusBtn.addEventListener('click', function () {
            let currentValue = parseInt(input.value) || 0;
            animateButton(minusBtn);
            updateValue(currentValue - 1);
        });

        plusBtn.addEventListener('click', function () {
            let currentValue = parseInt(input.value) || 0;
            animateButton(plusBtn);
            updateValue(currentValue + 1);
        });

        input.addEventListener('input', function () {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 0) {
                updateValue(0);
            } else {
                updateValue(value);
            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateValue((parseInt(input.value) || 0) + 1);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateValue((parseInt(input.value) || 0) - 1);
            }
        });
    });

    // Bundle pack functionality - clickable cards
    const bundleItems = document.querySelectorAll('.bundle-item');
    bundleItems.forEach(item => {
        item.addEventListener('click', function() {
            const bundleType = this.dataset.bundle;

            // Toggle selected state
            const wasSelected = this.classList.contains('selected');

            // Remove selected from all bundles
            bundleItems.forEach(bundle => bundle.classList.remove('selected'));

            if (!wasSelected) {
                this.classList.add('selected');

                // Add bundle items based on type
                if (bundleType === 'starter') {
                    addBundleItems([
                        { price: '65', quantity: 1 }, // Basic Plus
                        { price: '15', quantity: 1 }  // Already Owned Seal
                    ]);
                } else if (bundleType === 'pro') {
                    addBundleItems([
                        { price: '120', quantity: 1 }, // Premium
                        { price: '150', quantity: 1 }  // New Seal
                    ]);
                } else if (bundleType === 'fleet') {
                    addBundleItems([
                        { price: '65', quantity: 5 } // 5 Basic Plus
                    ]);
                } else if (bundleType === 'ultimate') {
                    addBundleItems([
                        { price: '120', quantity: 1 }, // Premium
                        { price: '80', quantity: 2 },  // 2 Advanced
                        { price: '150', quantity: 1 }  // New Seal
                    ]);
                }
            }

            // Force recalculate total after bundle selection
            calculateTotal();
        });
    });

    const addBundleItems = (items) => {
        items.forEach(item => {
            const control = document.querySelector(`[data-price="${item.price}"]`);
            if (control) {
                const input = control.querySelector('.quantity-buttons .quantity-input');
                if (input) {
                    input.value = parseInt(input.value || 0) + item.quantity;
                    animateValueChange(input);
                }
            }
        });
    };

    // Initial total calculation
    setTimeout(() => {
        calculateTotal();
    }, 100); // Small delay to ensure all elements are loaded
});

// Enhanced CRP Liveries Pricing System with Step Navigation
document.addEventListener('DOMContentLoaded', function () {
    const quantityControls = document.querySelectorAll('.quantity-control');
    const totalElement = document.querySelector('#totalPrice');
    const subtotalElement = document.querySelector('#subtotalPrice');
    const discountAmount = document.querySelector('#discountAmount');
    const discountLine = document.querySelector('#discountLine');
    const sidebarTotal = document.querySelector('#sidebarTotal');
    const quickSummary = document.querySelector('#quickSummary');
    
    let currentStep = 1;
    let selectedVehicle = null;
    let cart = {};

    // Step Navigation
    const steps = document.querySelectorAll('.step');
    const stepPanels = document.querySelectorAll('.step-panel');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');

    // Utility Functions
    const formatCurrency = (value) => `${value} R$`;

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
        
        const priceElement = input.closest('.livery-item, .addon-item').querySelector('.price');
        if (priceElement) {
            priceElement.classList.add('highlight');
            setTimeout(() => {
                priceElement.classList.remove('highlight');
            }, 500);
        }
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
        const card = control.closest('.livery-item, .addon-item');
        if (!card) return;
        
        const liveTotalElement = card.querySelector('.live-total');
        if (!liveTotalElement) return;
        
        const calculationElement = liveTotalElement.querySelector('.calculation');
        const totalAmountElement = liveTotalElement.querySelector('.total-amount');
        
        if (!calculationElement || !totalAmountElement) return;
        
        if (quantity > 0) {
            const total = quantity * price;
            calculationElement.textContent = `${price} × ${quantity} = `;
            totalAmountElement.textContent = `${total} R$`;
            liveTotalElement.classList.add('visible');
        } else {
            liveTotalElement.classList.remove('visible');
        }
    };

    const updateProgressBar = (totalItems) => {
        const progressBar = document.querySelector('#progressBar');
        const progressText = document.querySelector('#progressText');
        const progressMiniBar = document.querySelector('#progressMiniBar');
        const discountMiniText = document.querySelector('#discountMiniText');
        
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
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = text;
        if (progressMiniBar) progressMiniBar.style.width = `${progress}%`;
        if (discountMiniText) discountMiniText.textContent = text;
    };

    const calculateTotal = () => {
        let subtotal = 0;
        let totalItems = 0;
        let itemSummary = [];
        
        quantityControls.forEach(control => {
            const input = control.querySelector('.quantity-buttons .quantity-input');
            if (!input) return;
            
            const price = parseFloat(control.dataset.price) || 0;
            const quantity = parseInt(input.value) || 0;
            
            if (quantity > 0) {
                subtotal += price * quantity;
                totalItems += quantity;
                
                const itemName = control.closest('.livery-item, .addon-item').querySelector('h3').textContent.split(' ')[0];
                itemSummary.push(`${quantity}x ${itemName}`);
            }
            
            updateCardActiveState(control, quantity);
            updateLiveTotal(control, quantity, price);
        });
        
        updateProgressBar(totalItems);
        
        // Animate total change
        if (totalElement) {
            totalElement.classList.add('updating');
            setTimeout(() => {
                totalElement.classList.remove('updating');
            }, 500);
        }
        
        // Apply discounts
        let discount = 0;
        if (totalItems >= 10) {
            discount = 0.10;
        } else if (totalItems >= 5) {
            discount = 0.05;
        }
        
        const savings = Math.round(subtotal * discount);
        const finalTotal = Math.round(subtotal * (1 - discount));
        
        // Update displays
        if (subtotalElement) {
            subtotalElement.textContent = formatCurrency(subtotal);
        }

        if (discount > 0) {
            if (discountLine) discountLine.style.display = 'flex';
            if (discountAmount) discountAmount.textContent = `-${savings} R$`;
        } else {
            if (discountLine) discountLine.style.display = 'none';
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(finalTotal);
        }

        if (sidebarTotal) {
            sidebarTotal.textContent = formatCurrency(finalTotal);
        }
        
        // Update quick summary
        if (quickSummary) {
            if (itemSummary.length > 0) {
                quickSummary.innerHTML = itemSummary.join('<br>');
            } else {
                quickSummary.innerHTML = '<p>No items selected</p>';
            }
        }
        
        // Check for bundle recommendations
        checkBundleRecommendations(subtotal, totalItems);
    };

    const checkBundleRecommendations = (subtotal, totalItems) => {
        // Check if user would save money with a bundle
        const modal = document.querySelector('#recommendationModal');
        const recommendationText = document.querySelector('#recommendationText');
        
        if (!modal || !recommendationText) return;
        
        // Example: If they have Premium + New Seal, suggest Pro Pack
        const premiumQty = getQuantity('[data-price="120"]');
        const newSealQty = getQuantity('[data-price="150"]');
        
        if (premiumQty >= 1 && newSealQty >= 1 && subtotal > 220) {
            const savings = subtotal - 220;
            recommendationText.textContent = `You've added Premium + New Seal. The Pro Pack saves you ${savings} R$!`;
            modal.classList.add('show');
        }
    };

    const getQuantity = (selector) => {
        const control = document.querySelector(selector);
        if (!control) return 0;
        const input = control.querySelector('.quantity-buttons .quantity-input');
        return parseInt(input?.value || 0);
    };

    // Step Navigation Functions
    const showStep = (stepNumber) => {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === stepNumber);
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        });
        
        stepPanels.forEach((panel, index) => {
            panel.classList.toggle('active', index + 1 === stepNumber);
        });
        
        currentStep = stepNumber;
    };

    const nextStep = () => {
        if (currentStep < 5) {
            showStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    };

    // Event Listeners
    
    // Step navigation
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            showStep(index + 1);
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStepNum = parseInt(button.dataset.next);
            showStep(nextStepNum);
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStepNum = parseInt(button.dataset.prev);
            showStep(prevStepNum);
        });
    });

    // Vehicle selection
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(card => {
        card.addEventListener('click', function() {
            vehicleCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedVehicle = this.dataset.vehicle;
        });
    });

    // Quantity controls
    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.quantity-buttons .minus');
        const plusBtn = control.querySelector('.quantity-buttons .plus');
        const input = control.querySelector('.quantity-buttons .quantity-input');
        
        if (!minusBtn || !plusBtn || !input) return;

        const updateValue = (newValue) => {
            if (newValue < 0) newValue = 0;
            input.value = newValue;
            animateValueChange(input);
            calculateTotal();
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
    });

    // Bundle functionality
    const bundleItems = document.querySelectorAll('.bundle-item');
    bundleItems.forEach(item => {
        item.addEventListener('click', function() {
            const bundleType = this.dataset.bundle;
            
            const wasSelected = this.classList.contains('selected');
            bundleItems.forEach(bundle => bundle.classList.remove('selected'));
            
            if (!wasSelected) {
                this.classList.add('selected');
                addBundleItems(bundleType);
            }
            
            calculateTotal();
        });
    });

    const addBundleItems = (bundleType) => {
        const bundles = {
            starter: [{ price: '65', quantity: 1 }, { price: '15', quantity: 1 }],
            pro: [{ price: '120', quantity: 1 }, { price: '150', quantity: 1 }],
            fleet: [{ price: '65', quantity: 5 }],
            ultimate: [{ price: '120', quantity: 1 }, { price: '80', quantity: 2 }, { price: '150', quantity: 1 }]
        };
        
        const items = bundles[bundleType] || [];
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

    // Banner close
    const bannerClose = document.querySelector('.banner-close');
    if (bannerClose) {
        bannerClose.addEventListener('click', function() {
            document.querySelector('.offer-banner').style.display = 'none';
        });
    }

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            document.querySelector('#recommendationModal').classList.remove('show');
        });
    }

    // Initial calculation
    setTimeout(() => {
        calculateTotal();
    }, 100);
});

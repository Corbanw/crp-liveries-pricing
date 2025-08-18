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
    let departments = [];
    let departmentVehicles = {}; // Object to store vehicles for each department
    let cart = {};

    // Step Navigation
    const steps = document.querySelectorAll('.step');
    const stepPanels = document.querySelectorAll('.step-panel');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');

    // Department Management Functions
    const addDepartment = (deptName) => {
        if (deptName.trim() && !departments.includes(deptName.trim())) {
            departments.push(deptName.trim());
            updateDepartmentDisplay();
            updateContinueButton();
        }
    };

    const removeDepartment = (deptName) => {
        departments = departments.filter(dept => dept !== deptName);
        updateDepartmentDisplay();
        updateContinueButton();
    };

    const updateDepartmentDisplay = () => {
        const container = document.querySelector('#departmentsContainer');
        if (!container) return;

        if (departments.length === 0) {
            container.innerHTML = '<p class="no-departments">No departments added yet</p>';
        } else {
            container.innerHTML = departments.map(dept =>
                `<div class="department-tag">
                    ${dept}
                    <button class="remove-dept" onclick="removeDepartment('${dept}')">×</button>
                </div>`
            ).join('');
        }
    };

    const updateContinueButton = () => {
        const continueBtn = document.querySelector('#continueBtn');
        if (continueBtn) {
            continueBtn.disabled = departments.length === 0;
        }
    };

    // Vehicle Management Functions
    const addVehicle = (department, vehicleName) => {
        if (!departmentVehicles[department]) {
            departmentVehicles[department] = [];
        }
        if (vehicleName.trim() && !departmentVehicles[department].includes(vehicleName.trim())) {
            departmentVehicles[department].push(vehicleName.trim());
            updateVehicleDisplay(department);
            updateVehicleContinueButton();
        }
    };

    const removeVehicle = (department, vehicleName) => {
        if (departmentVehicles[department]) {
            departmentVehicles[department] = departmentVehicles[department].filter(vehicle => vehicle !== vehicleName);
            updateVehicleDisplay(department);
            updateVehicleContinueButton();
        }
    };

    const updateVehicleDisplay = (department) => {
        const container = document.querySelector(`#vehicles-${department.replace(/\s+/g, '-')}`);
        if (!container) return;

        const vehicles = departmentVehicles[department] || [];
        if (vehicles.length === 0) {
            container.innerHTML = '<p class="no-vehicles">No vehicles added yet</p>';
        } else {
            container.innerHTML = vehicles.map(vehicle =>
                `<div class="vehicle-tag">
                    ${vehicle}
                    <button class="remove-vehicle" onclick="removeVehicle('${department}', '${vehicle}')">×</button>
                </div>`
            ).join('');
        }
    };

    const updateVehicleContinueButton = () => {
        const continueBtn = document.querySelector('#vehicleContinueBtn');
        if (continueBtn) {
            const hasVehicles = Object.values(departmentVehicles).some(vehicles => vehicles.length > 0);
            continueBtn.disabled = !hasVehicles;
        }
    };

    const generateVehicleSelectionHTML = () => {
        const section = document.querySelector('#vehicleSelectionSection');
        if (!section) return;

        const commonVehicles = [
            'Police Sedan', 'Police SUV', 'Police Motorcycle', 'Police Truck',
            'Fire Truck', 'Fire SUV', 'Ambulance', 'Paramedic SUV',
            'Sheriff Sedan', 'Sheriff SUV', 'Unmarked Vehicle', 'SWAT Van'
        ];

        section.innerHTML = departments.map(dept => {
            const deptId = dept.replace(/\s+/g, '-');
            return `
                <div class="department-vehicle-section">
                    <h3>${dept}</h3>
                    <div class="vehicle-input-container">
                        <input type="text" class="vehicle-input" placeholder="Enter vehicle name..." data-dept="${dept}">
                        <button class="add-vehicle-btn" data-dept="${dept}">Add Vehicle</button>
                    </div>
                    <div class="vehicles-list" id="vehicles-${deptId}">
                        <p class="no-vehicles">No vehicles added yet</p>
                    </div>
                    <div class="vehicle-suggestions">
                        <h4>Common Vehicles:</h4>
                        <div class="vehicle-suggestion-tags">
                            ${commonVehicles.map(vehicle =>
                                `<span class="vehicle-suggestion-tag" data-dept="${dept}" data-vehicle="${vehicle}">${vehicle}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for the new elements
        setupVehicleEventListeners();
    };

    const setupVehicleEventListeners = () => {
        // Add vehicle buttons
        document.querySelectorAll('.add-vehicle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dept = this.dataset.dept;
                const input = document.querySelector(`.vehicle-input[data-dept="${dept}"]`);
                if (input && input.value.trim()) {
                    addVehicle(dept, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Vehicle input enter key
        document.querySelectorAll('.vehicle-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const dept = this.dataset.dept;
                    if (this.value.trim()) {
                        addVehicle(dept, this.value.trim());
                        this.value = '';
                    }
                }
            });
        });

        // Vehicle suggestion tags
        document.querySelectorAll('.vehicle-suggestion-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const dept = this.dataset.dept;
                const vehicle = this.dataset.vehicle;
                addVehicle(dept, vehicle);
            });
        });
    };

    // Make functions globally accessible
    window.removeDepartment = removeDepartment;
    window.removeVehicle = removeVehicle;

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

        // Generate vehicle selection when moving to step 2
        if (stepNumber === 2) {
            generateVehicleSelectionHTML();
        }

        currentStep = stepNumber;
    };

    const nextStep = () => {
        if (currentStep < 6) {
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

    // Department input functionality
    const departmentInput = document.querySelector('#departmentInput');
    const addDepartmentBtn = document.querySelector('.add-department-btn');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    if (addDepartmentBtn) {
        addDepartmentBtn.addEventListener('click', function() {
            if (departmentInput) {
                addDepartment(departmentInput.value);
                departmentInput.value = '';
            }
        });
    }

    if (departmentInput) {
        departmentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addDepartment(this.value);
                this.value = '';
            }
        });
    }

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const deptName = this.dataset.dept;
            addDepartment(deptName);
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

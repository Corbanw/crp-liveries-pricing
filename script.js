// Quantity control functionality + total calculation
document.addEventListener('DOMContentLoaded', function () {
    const quantityControls = document.querySelectorAll('.quantity-control');
    const totalElement = document.querySelector('#totalPrice'); // The element showing the total price

    const formatCurrency = (value) => {
        return `${value} Robux`;
    };

    const animateButton = (button) => {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    };

    const animateValueChange = (input) => {
        input.style.transform = 'scale(1.1)';
        input.style.background = 'rgba(102, 126, 234, 0.1)';
        setTimeout(() => {
            input.style.transform = '';
            input.style.background = '';
        }, 200);
    };

    const calculateTotal = () => {
        let total = 0;
        quantityControls.forEach(control => {
            const input = control.querySelector('.quantity-input');
            const price = parseFloat(control.dataset.price) || 0;
            const quantity = parseInt(input.value) || 0;
            total += price * quantity;
        });
        totalElement.textContent = formatCurrency(total);
    };

    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const input = control.querySelector('.quantity-input');

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

    // Initial total calculation
    calculateTotal();
});

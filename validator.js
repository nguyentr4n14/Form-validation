// Validator object
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {

    }

    // Validate function
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage
        
        // Get rules from selector 
        var rules = selectorRules[rule.selector]

        // Loop through rules & check
        // If there is error, stop the checking
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default: 
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break;
        }
                    
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add("invalid")
        } else {
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
        }        

        return !errorMessage
    }

    // Get element from form that need to be validated
    var formElement = document.querySelector(options.form)

    if (formElement) {
        // When submitting the form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true;

            // Loop through each rule and validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                // When submitting with Javascript
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)

                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }

                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                // When submitting with default behaviour
                else {
                    formElement.submit()
                }
            } 
        }
        // Loop through each rule and handle (listen to blur, input,... event)
        options.rules.forEach(function(rule) {

            // Save rules for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement) {
                // Handle blur event
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                // Handle oninput event
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid")                    
                }
            })
        })
    }
}

// Define rules
// Principles of the rules:
// 1. When there is error => Return error message
// 2. When valid => Return nothing (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || "Vui lòng nhập trường này"
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || "Vui lòng nhập đúng email"
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}
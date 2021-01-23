// Constructor function
// Option is Validator object in index.html
function Validator(option) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
    
    // validate function
    function validate(inputElement, rule) {
        // console.log('blur' + rule.selector);
        // value: inputElement.value
        // test func: rule.test()
        // test() method returns true if it finds a match in the string "inputElement.value" , otherwise it return false.
        // return true if find rule in string inputElement.value 
        var errorMessage = rule.test(inputElement.value);
        var errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
        // Get all rules of selector
        var rules = selectorRules[rule.selector];
        // console.log(rule.selector);
        // console.log(rules);

        //Loop through all rules and check if there is any error message, stop checking 
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break; 
                default:
                    errorMessage = rules[i](inputElement.value);
                    // console.log(rule[i]);
                    // console.log(rules[i]);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            // parentElement property returns the parent element of the specified element
            // add class 'invalid' to 
            getParent(inputElement, option.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }
    // get "form" element that needs to be validated
    // option.form: option is object, form is a key of the object.
    var formElement = document.querySelector(option.form);
    
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true; 
            //Loop through all rules and validate
            option.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // submit with Javascript
                if (typeof option.onSubmit == 'function') {
                    // Query all selectors from formElement has name attribute and not be disabled.
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    // console.log(enableInputs);
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        // return values, learn again logical operators
                        // this line means
                        // values[input.name] = input.value;
                        // return values;
                        // if write like this return (values[input.name] = input.value) && values; 
                        // In case user doesn't fill any field => return empty string
                        // return (values[input.name] = input.value) && values;
                        // console.log(values[input.name]);

                        // 2 đoạn mã dưới tương đương nhau. Đoạn trên của f8, đoạn dưới tương đương

                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        // This line means if values[input.name] has value, we'll return values (don't get value of values[input.name] has value)
                        
                        // if (values[input.name]) {
                        //     return values;
                        // }
                        // switch (input.type) {
                        //     case 'radio':
                        //     case 'checkbox':
                        //         if (input.matches(':checked')) {
                        //             values[input.name] = input.value;
                        //         } else {
                        //             values[input.name] = '';
                        //         }
                        //         break;
                        //     default:
                        //         values[input.name] = input.value;
                        // }

                        // 2 đoạn mã trên tương đương nhau
                        return values;
                    }, {});
                    option.onSubmit(formValues);
                } 
                // submit with default behaviour
                else {
                    formElement.submit();
                }
            }
        }
        // Loop through all rules and listen blur event
        option.rules.forEach(function(rule) {

            // Save all rules for every input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test]; // if 
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach(function(inputElement) {
                // Handling the case when user bluring from input box 
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                // Handling the case when user focusing and typing from input box
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
                }                
            });
        });
        // console.log(selectorRules);
    }
}


// Define rules
// Return error massage if it has error.
// Return undefine when no error.
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            // console.log(typeof value);
            // When using trim() for gender, value return null ==> remove trim();
            // return value.trim() ? undefined : message || 'Please enter this field';
            return value ? undefined : message || 'Please enter this field';
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            // Email validation, check javascript email regex
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Enter an email';
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            // Using  `` characters to include a variable to a string (String Interpolation), '' characters can't include avariable
            return value.length >= min ? undefined : message || `Please enter a password of at least ${min} characters`;
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value == getConfirmValue() ? undefined : message || 'The input value is incorrect'
        }
    }
}
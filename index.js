var MyForm = {

    types: {
        isFullName: {
            validate: function (value) {
                var inp_arr = value.split(" "),
                    i,
                    res_arr = [],
                    counter_word = 0,
                    sum_word = 3;

                for (i in inp_arr) {
                    if (inp_arr[i] !== "") {
                        counter_word += 1;
                        if (/^([a-zа-яё]+|\d+)$/i.test(inp_arr[i])) {
                            res_arr.push(inp_arr[i]);
                        }
                    }
                }

                return (res_arr.length == sum_word && counter_word == sum_word);
            }
        },
        isEmail: {
            validate: function (value) {
                var allowable_domen = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'],
                    allowable_address,
                    address_arr;

                allowable_address = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(value);
                address_arr = value.split('@');

                return (allowable_address && allowable_domen.indexOf(address_arr[1]) != -1);
            }
        },
        isPhone: {
            validate: function (value) {
                var allowable_phone,
                    number_str,
                    number_arr,
                    number_sum = 0,
                    number_max = 30,
                    i;

                number_str = value.replace(/\D+/ig, '');
                number_arr = number_str.split(/(?=(?:\d{1})+(?!\d))/);
                for (i in number_arr) {
                    number_sum += Number(number_arr[i]);
                }

                allowable_phone = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value);

                return (allowable_phone && number_sum <= number_max);
            }
        },
    },

    config: {
        fio: 'isFullName',
        email: 'isEmail',
        phone: 'isPhone'
    },

    validate: function() {
        var data = this.getData(),
            is_valid = true,
            error_fields = [],
            i,
            type,
            checher,
            result_ok;

        for (i in data) {
            if (data.hasOwnProperty(i)) {
                type = this.config[i];
                checker = this.types[type];

                if (!type) {
                    continue;
                }
                if (!checker) {
                    throw {
                        name: 'Ошибка валидации',
                        message: 'Не найден тип валидации - ' + type
                    };
                }

                result_ok = checker.validate(data[i]);
                if (!result_ok) {
                    error_fields.push(i);
                    is_valid = false;
                }
            }

        }

        return {
            isValid: is_valid,
            errorFields: error_fields
        }
    },

    getData: function() {
        var inputs = $('#myForm input'),
            data = {};

        $.each(inputs, function(key,value) {
            data[$(value).attr('name')] = $(value).val();
        });

        return data;
    },

    setData: function(data) {
        var form = $('#myForm'),
            i;

        for (i in data) {
            if (data.hasOwnProperty(i) && this.config.hasOwnProperty(i)) {
                form.find('input[name="'+i+'"]').val(data[i]);
            }
        }
    },

    submit: function () {
        var result = this.validate(),
            form = $('#myForm'),
            submit_button = $('#submitButton'),
            result_container = $('#resultContainer'),
            i;

        form.find('input').removeClass('error');
        result_container.removeClass();

        if (result.isValid) {
            form.attr('action','response/success.json');
            submit_button.attr('disabled','disabled');
        } else {
            form.attr('action','response/error.json');
            for (i in result.errorFields) {
                form.find('input[name="'+result.errorFields[i]+'"]').addClass('error');
            }
        }

        $.ajax({url: form.attr('action'), success: function(result){
            var result = JSON.parse(result);

            result_container.addClass(result.status);

            if (result.status === 'error') {
                result_container.text(result.reason);
            } else if (result.status === 'success') {
                result_container.text('Success');
            } else if (result.status === 'progress') {
                if (result.timeout) {
                    setTimeout(function () {
                        this.submit();
                    }, result.timeout);
                }
            }
        }});
    }

};

function isValidate() {
    var label = '<label id="" class="error" for="email">This field is required.</label>'
    var validate = true;
    $.each($('input'), function (id, e) {
        console.log($(e).prop('required'))
        if ($(e).prop('required')) {
            var name = $(e).prop('name');
            var min = parseInt($(e).attr('data-min-length'));
            var max = parseInt($(e).attr('data-max-length'));
            var datacompare = $(e).attr('data-compare');
            if ($(e).val().length == 0 &&
                (isNaN(min) || $(e).val().length < min) &&
                (isNaN(max) || $(e).val().length > max)) {
                var labelErr = $('<label id="' + $(e).prop('id') + '" class="error fail-alert" for="' + $(e).prop('name') + '">This field is required.</label>')
                labelErr.insertAfter($(e))
                validate = false;
                $(e).keyup(function () {
                    console.log('do')
                    if ($(this).val().length > 0 &&
                        (isNaN(min) || $(this).val().length > min) &&
                        (isNaN(max) || $(this).val().length < max)) {
                        $(this).addClass('valid success-alert');
                        labelErr.hide();
                    } else {
                        $(this).removeClass('valid success-alert');
                        labelErr.show();
                    }
                })
            } 
        }
    })
    return validate;
}
$(document).ready(function () {
    $('#btnSave').click(function(){
        var save_data = [];
        $.each($('#system_content input'), function(index, item){
            save_data.push({name : $(item).prop('id'), value : $(item).val()});
        })
        console.log(save_data)
        $.ajax({
            url: "/admin/api/savesystemsetting",
            type: "POST",
            data: JSON.stringify({'setting': save_data}),
            success: function (data) {
            },
            complete: function (result) {
                $('#spanSuccessAlert').show()
                setTimeout(function () { $('#spanSuccessAlert').hide(); }, 3000);
            },
            cache: false,
            contentType:  'application/json; charset=UTF-8',
            processData: false,
        });
    })
});
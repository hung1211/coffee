$(document).ready(function () {
    getarea();
    $("#btnAdd").click(function () {
        $("#areaModal h5.modal-title").text('Thêm mới khu vực')
        $("#areaModal").modal('show');
        document.getElementById("areaName").value = ''
        $("#areaName").attr('data-id', '');
        $('#btnDeletearea').hide();
    });


});

//Insert area to database
function addarea() {
    const name = document.getElementById("areaName").value;
    const description = document.getElementById("areaDes").value;

    var id = $("#areaName").attr('data-id');
    var link = "/admin/addarea?name=" + name +
        "&des=" + description;
    if (id.length > 0 && parseInt(id) > 0) {
        link = "/admin/addarea?id=" + id + "&name=" + name +
            "&des=" + description;
    }
    $.get(link, function (data, status) {
        if (id.length > 0 && parseInt(id) > 0)
        $.showNotification({
            body:"Sửa thông tin khu vực thành công",
            duration: 2000,
            type:"success"
          })
        else
        $.showNotification({
            body:"Thêm khu vực thành công",
            duration: 2000,
            type:"success"
          })

        $("#areaModal").modal('hide');
        getarea();
    });
}


//Get area Details by ID
function areaDetails(id) {
    $('#btnDeletearea').show();
    $("#areaModal h5.modal-title").text('Sửa thông tin khu vực')

    var link = "/admin/areaDetails?id=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        if (_data != undefined) {
            const name = document.getElementById("areaName");
            const description = document.getElementById("areaDes");

            $(name).val(unescape(_data.AreaName));
            $(description).val(unescape(_data.Description));
            $(name).attr('data-id', id);
        }


    });
    $("#areaModal").modal('show');
}

//Delete area
function deletearea() {
    if (!confirm("Bạn có thật sự muốn xóa khu vực này?")) {
        return false;
    } else {
        var id = $("#areaName").attr('data-id');
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deletearea?id=" + id;

            $.get(link, function (data, status) {
                $.showNotification({
                    body:"Đã xóa",
                    duration: 2000,
                    type:"warning"
                  })
                $("#areaModal").modal('hide');
                getarea();
            });
        }
    }
}

//Get all area then add to select control. If e (selector) = undefined, get all area to list in area page
function getarea(e) {
    var link = "/admin/getarea"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#areaItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        
            $('#divareaList').html(htmlInner);
    });
}

$(document).ready(function () {
    getBrand();
    $("#btnAdd").click(function () {
        $("#brandModal").modal('show');
        document.getElementById("brandName").value = ''
        $("#brandName").attr('data-id', '');
        $('#btnDeleteBrand').hide();
    });


});

//Insert brand to database
function addBrand() {
    const name = document.getElementById("brandName").value;
    const address = document.getElementById("brandAddress").value;
    const description = document.getElementById("brandDes").value;

    var id = $("#brandName").attr('data-id');
    var link = "/admin/addbrand?name=" + name +
        "&address=" + address +
        "&des=" + description;
    if (id.length > 0 && parseInt(id) > 0) {
        link = "/admin/addbrand?id=" + id + "&name=" + name +
            "&address=" + address +
            "&des=" + description;
    }
    $.get(link, function (data, status) {
        if (id.length > 0 && parseInt(id) > 0)
        $.showNotification({
            body:"Edit Distributor Success",
            duration: 2000,
            type:"success"
          })
        else
        $.showNotification({
            body:"Add Distributor Success",
            duration: 2000,
            type:"success"
          })

        $("#brandModal").modal('hide');
        getBrand();
    });
}


//Get Brand Details by ID
function brandDetails(id) {
    $('#btnDeleteBrand').show();

    var link = "/admin/brandDetails?id=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        if (_data != undefined) {
            const name = document.getElementById("brandName");
            const description = document.getElementById("brandDes");
            const address = document.getElementById("brandAddress");

            $(name).val(unescape(_data.BrandName));
            $(description).val(unescape(_data.Description));
            $(address).val(unescape(_data.Address));
            $(name).attr('data-id', id);
        }


    });
    $("#brandModal").modal('show');
}

//Delete Brand
function deleteBrand() {
    if (!confirm("Do you want to delete this Brand?")) {
        return false;
    } else {
        var id = $("#brandName").attr('data-id');
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deletebrand?id=" + id;

            $.get(link, function (data, status) {
                $.showNotification({
                    body:"Deleted Distributor",
                    duration: 2000,
                    type:"warning"
                  })
                $("#myModal").modal('hide');
                getBrand();
            });
        }
    }
}

//Get all brand then add to select control. If e (selector) = undefined, get all brand to list in brand page
function getBrand(e) {
    var link = "/admin/getBrand"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#brandItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        
            $('#divBrandList').html(htmlInner);
    });
}

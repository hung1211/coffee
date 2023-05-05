$(document).ready(function () {
    getCategory();
    getProductDetails();
    //getBrand();
});

function getProductDetails() {
    var id = document.getElementById("proID").value;
    if (id != null && id.length > 0 && parseInt(id) > 0) {
        $('#page-title').attr('key', 'editproduct')
        var link = "/admin/getProductByID?id=" + id;
        $.get(link, function (data, status) {
            var _data = JSON.parse(data)
            if (_data != undefined) {
                const name = document.getElementById("proName");
                const description = document.getElementById("proDescription");
                const price = document.getElementById("proPrice");
                const category = document.getElementById("proCategory");
                $(name).val(unescape(_data.ProductName));
                $(description).val(unescape(_data.Description));
                $(price).val(unescape(_data.Price));
                $(category).val(_data.CategoryID);
                callingUpload(JSON.parse(_data.ImageUrl))
                $('#btnAdd').text('OK');
                $('#btnDelete').show();
            }


        });
    } else
        callingUpload();

}

function callingUpload(data) {
    var imagesloader = $('[data-type=imagesloader]').imagesloader({
        maxFiles: 4
        , minSelect: 1
        , imagesToLoad: (data != undefined && data.length > 0) ? data : []
    });
    $frm = $('#frmUploadImg');

    // Form submit
    $frm.submit(function (e) {
        e.preventDefault();
        e.stopPropagation();


        const id = document.getElementById("proID").value;
        const name = document.getElementById("proName");
        const description = document.getElementById("proDescription");
        const price = document.getElementById("proPrice");
        const category = document.getElementById("proCategory");

        var $form = $(this);

        var files = imagesloader.data('format.imagesloader').AttachmentArray;

        var oldFiles = imagesloader.data('format.imagesloader').imagesToLoad;

        var il = imagesloader.data('format.imagesloader');

        const formData = new FormData();
        if (id != undefined && id.length > 0)
            formData.append("id", id);
        formData.append("name", (name.value));
        formData.append("description", (description.value));
        formData.append("price", price.value);
        formData.append("category", category.value);
        if (oldFiles.length > 0) {
            var remainFile = [];
            $.each(oldFiles, function (index, item) {
                if (item.Url != undefined && item.Url.length > 0) {
                    remainFile.push(item);
                } else if (item.FileName != undefined && item.FileName.length > 0) {
                    remainFile.push({ "Url": ("/uploads/" + item.FileName), "Name": item.FileName });
                }
            });
            formData.append("remainImage", JSON.stringify(remainFile));
        }
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i].File);
        }
        $.ajax({
            url: "/admin/addproduct", // send ajax
            type: "POST", // choose method
            data: formData,
            success: function (result) {

            },
            complete: function (result) {
                console.log(result.responseText);
                if (result.responseText == '1') {
                    $.showNotification({
                        body: "Edit Success",
                        duration: 2000,
                        type: "success"
                    })
                } else {
                    $('#cofirmAdd-modal').modal('show')
                }
            },
            cache: false,
            contentType: false,
            processData: false,
        });
    });
}

function addProduct() {
    $('#frmUploadImg').submit();
}

//Delete Category
function deleteProduct() {
    if (!confirm("Do you want to delete this Product?")) {
        return false;
    } else {
        var id = document.getElementById("proID").value;
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deleteproduct?id=" + id;

            $.get(link, function (data, status) {
                console.log(data)
            });
        }
    }
}

function getCategory() {
    var link = "/admin/getCategory"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = '<option value="{{ID}}">{{CategoryName}}</option>'
        var htmlInner = '<option value="0">Select Category</option>';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        console
        $('#proCategory').html(htmlInner);
    });
}

/*function getBrand() {
    var link = "/admin/getBrand"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = '<option value="{{BrandID}}">{{BrandName}}</option>'
        var htmlInner = '<option value="0">Select Distributor</option>';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        console
        $('#proBrand').html(htmlInner);
    });
}*/
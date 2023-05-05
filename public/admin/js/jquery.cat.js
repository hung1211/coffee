$(document).ready(function () {

    $('#catImageArea').load("template/upload-file.html")
    getCategory();
    $("#btnAdd").click(function () {
        $("#categoryModal").modal('show');
        document.getElementById("categoryName").value = ''
        $("#categoryName").attr('data-id', '');
        $('#btnDeleteCategory').hide();
        callingUpload();

    });


});

$("#categoryModal").on('hide.bs.modal', function () {
    $('#catImageArea').load("template/upload-file.html")
});

function callingUpload(data) {
    console.log(data)
    var imagesloader = $('[data-type=imagesloader]').imagesloader({
        maxFiles: 4
        , minSelect: 1
        , imagesToLoad: (data != undefined && data.length > 0) ? data : []
    });
    $frm = $('#frmUploadImg');
    console.log(imagesloader.data('format.imagesloader').imagesToLoad)
    console.log(imagesloader.data('format.imagesloader').AttachmentArray)

    // Form submit
    $frm.submit(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var id = $("#categoryName").attr('data-id');
        const name = document.getElementById("categoryName");
        const description = document.getElementById("categoryDes");
        const discount = document.getElementById("categoryDiscount");

        var $form = $(this);

        var files = imagesloader.data('format.imagesloader').AttachmentArray;

        var oldFiles = imagesloader.data('format.imagesloader').imagesToLoad;

        var il = imagesloader.data('format.imagesloader');

        const formData = new FormData();
        if (id != undefined && id.length > 0)
            formData.append("id", id);
        formData.append("name", (name.value));
        formData.append("description", (description.value));
        formData.append("discount", discount.value);
        if (oldFiles.length > 0){
            var remainFile = [];
            $.each(oldFiles, function(index, item){
                if(item.Url!=undefined && item.Url.length>0){
                    remainFile.push(item);
                }else if (item.FileName!=undefined && item.FileName.length>0){
                    remainFile.push({ "Url": ("/uploads/" + item.FileName), "Name": item.FileName });
                }
            });
            formData.append("remainImage", JSON.stringify(remainFile));
        }
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i].File);
        }
        $.ajax({
            url: "/admin/addcategory", // send ajax
            type: "POST", // choose method
            data: formData,
            success: function (result) {

            },
            complete: function (result) {
                var id = parseInt(result.responseText)
                $("#categoryModal").modal('hide');
                getCategory()
            },
            cache: false,
            contentType: false,
            processData: false,
        });
    });
}

function addCategory() {
    $('#frmUploadImg').submit();
}

//Get Category Details by ID
function categoryDetails(id) {
    $('#btnDeleteCategory').show();

    var link = "/admin/categoryDetails?id=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        if (_data != undefined) {
            $('#btnDeleteSlider').show();
            const name = document.getElementById("categoryName");
            const description = document.getElementById("categoryDes");
            const discount = document.getElementById("categoryDiscount");

            $(name).val(unescape(_data.CategoryName));
            $(description).val(unescape(_data.Description));
            $(discount).val(unescape(_data.Discount));
            $(name).attr('data-id', id);
            console.log(_data.ImageUrl)
            callingUpload(JSON.parse(_data.ImageUrl))
        }


    });
    $("#categoryModal").modal('show');
}

//Delete Category
function deleteCategory() {
    if (!confirm("Do you want to delete this Category?")) {
        return false;
    } else {
        var id = $("#categoryName").attr('data-id');
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deletecategory?id=" + id;

            $.get(link, function (data, status) {
                showSuccess('Delete Complete');
                $("#categoryModal").modal('hide');
                getCategory();
            });
        }
    }
}

function getCategory() {
    var link = "/admin/getCategory"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#productItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                if (isJsonString(item.ImageUrl) && JSON.parse(item.ImageUrl).length > 0) {

                    item.ThumbImage = JSON.parse(item.ImageUrl)[0].Url;
                }
                else
                    item.ThumbImage = "../img/no-image.jpg";
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        console
        $('#divCatList').html(htmlInner);
    });
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
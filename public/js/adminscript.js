function addProduct(e) {
    e.preventDefault();
    showLoading();
    const id = document.getElementById("proID");
    const name = document.getElementById("proName");
    const description = document.getElementById("proDescription");
    const brand = document.getElementById("proBrand");
    const category = document.getElementById("proCategory");
    const price = document.getElementById("proPrice");
    const files = document.getElementById("files");
    const formData = new FormData();
    if (id != undefined && id.value.length > 0)
        formData.append("id", id.value);
    formData.append("name", escape(name.value));
    formData.append("description", escape(description.value));
    formData.append("brand", brand.value);
    formData.append("category", category.value);
    formData.append("price", price.value);
    formData.append("remainImage", getRemainImage());
    for (let i = 0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
    }
    $.ajax({
        url: "/admin/addproduct", // send ajax
        type: "POST", // choose method
        data: formData,
        success: function (result) {

        },
        complete: function (result) {
            var id = parseInt(result.responseText)
            if (id != 'NaN' && id > 0) {
                setTimeout(function () { window.location.replace('/admin/productlist'); }, 1000);

            }
        },
        cache: false,
        contentType: false,
        processData: false,
    });
}

//Get list of image still in product
function getRemainImage() {
    var imageUrl = [];
    $.each($('.imgStill'), function (index, item) {
        var isThumb = $($($(item)).parent().parent()).find('input:checkbox')[0]
        imageUrl.push({ image: $(item).attr('data-value'), isThumb: (isThumb != undefined && $(isThumb).prop('checked') ? '1' : '0') });
    })
    return JSON.stringify(imageUrl);

}

function deleteImage(e) {
    $(e).parent().remove();
}

function deleteProduct() {
    showLoading(1000);
    var id = $("#proID").val();
    $.ajax({
        url: "/admin/deleteproduct", // send ajax
        type: "POST", // choose method
        data: { id: id },
        success: function (result) {

        },
        complete: function (result) {
            var id = parseInt(result.responseText)
            if (id != 'NaN' && id > 0) {
                setTimeout(function () { window.location.replace('/admin/productlist'); }, 1000);

            }
        },
    });
}

//Slider
function addSlider() {
    showLoading(1000);
    const id = $("#sliderTitle").attr('data-id');
    const title = document.getElementById("sliderTitle");
    const subtitle = document.getElementById("sliderSubTitle");
    const description = document.getElementById("sliderDes");
    const files = document.getElementById("silderimage");
    const formData = new FormData();
    if (id.length > 0 && parseInt(id) > 0)
        formData.append("id", id);
    formData.append("title", escape(title.value));
    formData.append("subtitle", escape(subtitle.value));
    formData.append("description", escape(description.value));
    if (files.files != undefined && files.files.length > 0)
        formData.append("file", files.files[0]);
    $.ajax({
        url: "/admin/addslider", // send ajax
        type: "POST", // choose method
        data: formData,
        success: function (result) {

        },
        complete: function (result) {
            //var id = parseInt(result.responseText)
            if (id != 'NaN' && id > 0) {

                $("#myModal").modal('hide');
            }
        },
        cache: false,
        contentType: false,
        processData: false,
    });
}

//Get all slider and show in Slider page
function getSlider() {
    var link = "/admin/getSlider"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                //Fill data to Slider Page
                htmlInner += '<a href="#" onclick="sliderDetails(this)" data-id="' + item.ID + '" class="list-group-item list-group-item-action">' + unescape(item.SliderTitle) + '</a>';
            });
        $('#listSlider').html(htmlInner);
    });
}

//Get Slider Details by ID
function sliderDetails(e) {
    var id = $(e).attr('data-id')

    var link = "/admin/sliderDetails?ID=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var htmlInner = '';
        if (_data != undefined) {
            $('#btnDeleteSlider').show();
            const title = document.getElementById("sliderTitle");
            const subtitle = document.getElementById("sliderSubTitle");
            const description = document.getElementById("sliderDes");
            const imageView = document.getElementById("imgSliderView");
            $('#imgSliderView').parent().show();
            $(title).val(unescape(_data.SliderTitle));
            $(subtitle).val(unescape(_data.SliderSubTitle));
            $(description).val(unescape(_data.Description));
            $(imageView).attr('src', "/uploads/" + unescape(_data.ImageUrl));
            $(title).attr('data-id', id);
        }


    });
    $("#myModal").modal('show');
}

//Delete Slider
function deleteSlider() {
    if (!confirm("Do you want to delete this Slider?")) {
        return false;
    } else {
        var id = $("#sliderTitle").attr('data-id');
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deleteslider?id=" + id;

            $.get(link, function (data, status) {
                showSuccess('Delete Complete');
                $("#myModal").modal('hide');
                getSlider();
            });
        }
    }
}


//Brand Page
//Insert brand to database
function addBrand() {
    const name = document.getElementById("brandName").value;
    const isShow = $('#cbShowHomePage').is(":checked") ? '1' : '0';

    var id = $("#brandName").attr('data-id');
    var link = "/admin/addbrand?name=" + name + "&isShow=" + isShow;
    if (id.length > 0 && parseInt(id) > 0) {
        link = "/admin/addbrand?id=" + id + "&name=" + name + "&isShow=" + isShow;
    }
    $.get(link, function (data, status) {
        if (id.length > 0 && parseInt(id) > 0)
            showSuccess('Edit Brand Success!');
        else
            showSuccess('Add Brand Success!');

        $("#myModal").modal('hide');
        getBrand();
    });
}


//Get Brand Details by ID
function brandDetails(e) {
    var name = e.text
    $('#btnDeleteBrand').show();
    $("#brandName").val(name);
    $("#brandName").attr('data-id', $(e).attr('data-id'));
    $("#brandName").focus();
    var isCheck = $(e).attr('data-isShow')
    isCheck == '1' ? $('#cbShowHomePage').prop('checked', true) : $('#cbShowHomePage').prop('checked', false);
    $("#myModal").modal('show');
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
                showSuccess('Delete Complete');
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
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                //Fill data to select
                if (e != undefined)
                    htmlInner += '<option value="' + item.ID + '">' + item.BrandName + "</option>";
                //Fill data to Brand Page
                else
                    htmlInner += '<a href="#" onclick="brandDetails(this)" ontouchstart="brandDetails(this)" data-id="' + item.ID + '" data-isShow="' + item.IsShow + '" class="list-group-item list-group-item-action">' + item.BrandName + '</a>';
            });
        if (e != undefined) {
            $(e).html(htmlInner)
            $('#proBrand').val($('#proBrand').attr('data-id')).change();
        }
        else
            $('#listBrand').html(htmlInner);
    });
}

//Category Page
function addCategory() {
    const name = document.getElementById("categoryName").value;

    var id = $("#categoryName").attr('data-id');
    var link = "/admin/addCategory?name=" + name
    if (id.length > 0 && parseInt(id) > 0) {
        link = "/admin/addCategory?id=" + id + "&name=" + name
    }
    $.get(link, function (data, status) {
        showSuccess('Add Category Success!');
        $("#myModal").modal('hide');
        getCategory();
    });
}

function categoryDetails(e) {
    var name = e.text
    $('#btnDeleteCategory').show();
    $("#categoryName").val(name);
    $("#categoryName").attr('data-id', $(e).attr('data-id'));
    $("#categoryName").focus();
    $("#myModal").modal('show');
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
                $("#myModal").modal('hide');
                getCategory();
            });
        }
    }
}

function getCategory(e) {
    var link = "/admin/getCategory"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                if (e != undefined)
                    htmlInner += '<option value="' + item.ID + '">' + item.CategoryName + "</option>";
                else
                    htmlInner += '<a href="#" onclick="categoryDetails(this)" data-id="' + item.ID + '" class="list-group-item list-group-item-action">' + item.CategoryName + '</a>';
            });
        if (e != undefined) {
            $(e).html(htmlInner);
            $('#proCategory').val($('#proCategory').attr('data-id')).change();
        }
        else
            $('#listCategory').html(htmlInner);
    });
}

$('.noti_close').on('click', function () {
    closeSuccess();
});

function showSuccess(s) {
    var alertBox = $('#noti_Success');
    var content = $('#pAlertContent');
    if (s != undefined && s.length > 0)
        $(content).text(s)
    alertBox.show();
    alertBox.removeClass('bounceOutRight');
    alertBox.addClass('bounceInRight');
    setTimeout(function () { closeSuccess(); }, 2000);
}
function closeSuccess() {
    var alertBox = $('#noti_Success');
    alertBox.removeClass('bounceInRight');
    alertBox.addClass('bounceOutRight');
    alertBox.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        alertBox.hide();
    });
}

function showLoading(time) {
    $('#loadingPage').show();
    if (time != undefined)
        setTimeout(function () { hideLoading(); }, time);
}
function hideLoading() {
    $('#loadingPage').hide();
}

const orderStatus = [
    { id: 0, name: 'New', msg: 'This order has been paid?', color:'btn btn-primary btn-sm' },
    { id: 1, name: 'Payment Accept', msg: 'This Orders are being delivered?', color:'btn btn-info btn-sm' },
    { id: 2, name: 'Shipping', msg: 'This order are delivered?', color:'btn btn-warning btn-sm' },
    { id: 3, name: 'Success', msg: '', color:'btn btn-success btn-sm' },
    { id: 4, name: 'Canceled', msg: '', color:'btn btn-danger btn-sm' }
];

function getCssOrderStatus(status){
    return orderStatus.find(x => x.id == status).color
}
function getOrderStatusName(status){
    return orderStatus.find(x => x.id == status).name
}

function ShowCartDetails(id) {
    var link = "/admin/getOrderDetails?id=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        if (_data != undefined) {
            $("#cusName").attr('data-id', id);
            $('#cusName').val(_data.CustomerName);
            $('#address').val(_data.Address);
            $('#totalprice').val(_data.TotalPrice);
            $('#lbStatus').text(orderStatus.find(x => x.id == _data.Status).name)
            $("#lbStatus").attr('data-id', _data.Status);
            if (_data.Status == 4) {
                $("#btnUpdatStatus").hide();
                $("#btnCancelStatus").hide();
            } else if (_data.Status == 3) {
                $("#btnUpdatStatus").hide();
                $("#btnCancelStatus").hide();
            } else {
                $("#btnUpdatStatus").show();
                $("#btnCancelStatus").show();
            }
            $('#lbStatus').removeClass().addClass(orderStatus.find(x => x.id == _data.Status).color)
            $('#paymentMethod').val(getPaymentMethodName(_data.PaymentMethod));
            $('#tbOrderDetails').DataTable({
                processing: true,
                paging: false,
                searching: false,
                responsive: true,
                //Call 'Get' Method to get all row in table tb_product
                data: JSON.parse(_data.CartDetails),

                //Fill data each column
                columns: [
                    {
                        data: null,
                        render: (data, type, row, meta) => meta.row + 1,
                    },
                    { data: 'name' },
                    { data: 'image' },
                    { data: 'num' },
                    { data: 'price' },
                    { data: 'totalprice' },
                ],
                //Modify column 
                columnDefs: [
                    {
                        render: function (data, type, row) {
                            return '<img src="' + data + '" alt="" width="100" height="100">';
                        },
                        targets: 2,
                    },
                    {
                        render: function (data, type, row) {
                            return parseInt(row.num) * parseInt(row.price)
                        },
                        targets: 5,
                    },
                ],
            });
            $('#cart-details-Modal').modal('show')
        }
    });


}

function changeOrderStatus() {
    var status = $("#lbStatus").attr('data-id');
    if (!confirm(orderStatus.find(x => x.id == status).msg)) {
        return false;
    } else {
        var id = $("#cusName").attr('data-id');
        var status = $("#lbStatus").attr('data-id');
        var link = "/admin/changeOrderStatus?id=" + id + '&status=' + status;
        $.get(link, function (data, status) {
            if (data != undefined && data > 0) {
                $('#lbStatus').text(orderStatus.find(x => x.id == data).name)
                updateStatusWith_trIndex(currentTrSelected, data)
                if (data == 4) {
                    $("#btnUpdatStatus").hide();
                    $("#btnCancelStatus").hide();
                } else if (data == 3) {
                    $("#btnUpdatStatus").hide();
                    $("#btnCancelStatus").hide();
                } else {
                    $("#btnUpdatStatus").show();
                    $("#btnCancelStatus").show();
                }
                $('#lbStatus').removeClass().addClass(orderStatus.find(x => x.id == data.Status).color)

            }
        })
    }
}

function updateStatusWith_trIndex(index, status){
    var _td=$('#tbList tr').eq(index).find('button').parent();
    $(_td).html('<button style="pointer-events: none;" class="' + getCssOrderStatus(status) + '">' + getOrderStatusName(status) + '</button>')

}

function cancelOrder() {
    if (!confirm("Do you want to CANCEL this ORDER?")) {
        return false;
    } else {
        var id = $("#cusName").attr('data-id');
        var link = "/admin/cancelOrder?id=" + id;
        $.get(link, function (data, status) {
            if (data != undefined && data == '1') {
                $('#lbStatus').text(orderStatus.find(x => x.id == 4).name)
                $('#lbStatus').removeClass().addClass(orderStatus.find(x => x.id == 4).color)
                $("#btnUpdatStatus").hide();
                $("#btnCancelStatus").hide();
                updateStatusWith_trIndex(currentTrSelected, 4)
            }
        })
    }
}


function getPaymentMethodName(val) {
    switch (val) {
        case 1:
            return 'Visa Debit';
        case 2:
            return 'Momo';
        case 3:
            return 'Paypal';// code block
        default:
            return 'None';
    }
}
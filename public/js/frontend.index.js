
$(document).ready(function () {
    gettable();
    getProductList();
});
function gettable() {
    var link = "/api/getcurrenttable"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#table-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                if (item.TotalPrice > 0) { item.StatusColor = 'bg-success'; item.Status = 'Có khách' }
                else { item.StatusColor = 'bg-secondary'; item.Status = 'Trống'; item.TotalPrice = '' }
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });

        $('#tableList').html(htmlInner);
        $('.table-item').click(function () {
            tableDetails($(this).attr('data-id'), $(this).attr('data-name'), $(this).hasClass('bg-success'));
        })
    });
}

function getProductList() {
    var link = "/api/getproduct"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempCatHtml = $('#category-tab-template').html();
        var tempHtml = $('#product-template').html();
        var htmlCatInner = '';
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
        console.log(_data)
            $.each(_data, function (index, item) {
                item.productlist = JSON.parse(item.productlist)
                if(item.catid==0) {item.active = 'active';item.show = 'show';}
                //if (item.Price > 0) {item.StatusColor = 'bg-success'; item.Status = 'Có khách'}
                //else{ item.StatusColor = 'bg-secondary'; item.Status = 'Trống'; item.Price=''}
                let renderedCat = Mustache.render(tempCatHtml, item);
                htmlCatInner += renderedCat;

                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;

                
            });

        $('#orderModal-listproduct ul.nav').html(htmlCatInner);
        $('#orderModal-listproduct div.tab-content').html(htmlInner);
        callingEventProductClick();
    });
}

function callingEventProductClick() {
    $('.product-item').click(function () {
        var proID = $(this).attr('data-id');
        curProID = $('#order-details').attr('data-current');
        var listID = curProID ? curProID.split(',') : [];
        if (listID != undefined && listID.length > 0 && listID.includes(proID)) {
            var item = $('#order-details div[data-id=' + proID + ']');
            if (item.length > 0) {
                var qtyItem = item.find('.productQuantity')
                var newQty = parseInt(qtyItem.val()) + 1;
                qtyItem.val(newQty)
                calPriceProduct(qtyItem);
                $('.product-in-order[data-id=' + proID + ']').text(newQty)
            }

        } else {
            var name = $(this).attr('data-name');
            var price = $(this).attr('data-price');
            var tempHtml = $('#order-template').html();
            var item = { proID: proID, name: name, price: price, qty: 1, calPrice: parseInt(price).toLocaleString(window.document.documentElement.lang) }
            let rendered = Mustache.render(tempHtml, item);
            $('#order-details').append(rendered);
            listID.push(proID);
            $('.product-in-order[data-id=' + proID + ']').show();
            $('.product-in-order[data-id=' + proID + ']').text('1')
            $('#order-details').attr('data-current', listID.join());
            calTotalPrice()
        }
    })
}

function minusquantity(e) {
    var qty = $(e).parent().find('input.productQuantity').val()
    var newQty = parseInt(qty) - 1; newQty == 0 ? newQty = 1 : true;
    var proID = $(e).parent().attr('data-id');
    $('.product-in-order[data-id=' + proID + ']').text(newQty)
    $(e).parent().find('input.productQuantity').val(newQty)
    calPriceProduct(e)
}
function addquantity(e) {
    var qty = $(e).parent().find('input.productQuantity').val()
    var newQty = parseInt(qty) + 1;
    var proID = $(e).parent().attr('data-id');
    $('.product-in-order[data-id=' + proID + ']').text(newQty)
    $(e).parent().find('input.productQuantity').val(newQty)
    calPriceProduct(e)
}

function removeItem(e) {
    var id = $(e).parent().attr('data-id');
    curProID = $('#order-details').attr('data-current');
    var listID = curProID ? curProID.split(',') : [];
    listID = jQuery.grep(listID, function (value) {
        return value != id;
    });
    curProID = $('#order-details').attr('data-current', listID.join())
    $('.product-in-order[data-id=' + id + ']').hide();
    $('.product-in-order[data-id=' + id + ']').text('')
    $(e).parent().remove();
    calTotalPrice()
}

function calPriceProduct(e) {
    var qty = $(e).parent().find('input.productQuantity').val();
    if (qty.length == 0 || parseInt(qty) <= 0) {
        $(e).parent().find('input.productQuantity').val(1)
        qty = 1
    }

    var price = $(e).parent().find('input.productPrice').val();

    calTotalPrice()
}

function calTotalPrice() {
    var total = 0;
    $.each($('#order-details div.order-item'), function (index, item) {
        var qty = $(item).find('input.productQuantity').val();
        var price = $(item).find('input.productPrice').val();
        total += (parseInt(qty) * parseInt(price));

    })
    $('#orderModal div.card-footer').html('Tổng Tiền: ' + total.toLocaleString(window.document.documentElement.lang) + ' VND')
}

function getProductInCurrentOrder(id, name) {
    var link = "/api/getProductInCurrentOrder?id=" + id
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        $("#orderModal-title").text('Bàn ' + name);
        if (_data.CreateTime != null) {
            createtime = new Date(_data.CreateTime);
            $('#order-details').attr('data-creattime', _data.CreateTime);
            $("#orderModal-title").text('Bàn ' + name + ' - Giờ vào: ' + getTimeString(createtime))
        }
        if (_data.ProductList.length > 0) {
            $('#orderModal div.modal-footer').removeClass('justify-content-end')
            $('#orderModal div.modal-footer').addClass('justify-content-between')
            var productList = JSON.parse(_data.ProductList)
            var tempHtml = $('#order-template').html();

            var htmlInner = '';
            if (productList != undefined && productList.length > 0)
                $.each(productList, function (index, item) {
                    item.calPrice = (parseInt(item.price) * parseInt(item.qty)).toLocaleString(window.document.documentElement.lang)
                    //if (item.Price > 0) {item.StatusColor = 'bg-success'; item.Status = 'Có khách'}
                    //else{ item.StatusColor = 'bg-secondary'; item.Status = 'Trống'; item.Price=''}
                    let rendered = Mustache.render(tempHtml, item);
                    htmlInner += rendered;
                    $('.product-in-order[data-id=' + item.proID + ']').show();
                    $('.product-in-order[data-id=' + item.proID + ']').text(item.qty)
                });
            $('#orderModal div.card-footer').html('Tổng Tiền: ' + _data.TotalPrice.toLocaleString(window.document.documentElement.lang) + ' VND')
            $('#order-details').attr('data-current', _data.ProductIDList);
            $('#order-details').html(htmlInner);
            $('#btnCompleteOrder').show();
            $('#btnDeletetable').show();
        } else {
            $('#orderModal div.modal-footer').addClass('justify-content-end')
            $('#orderModal div.modal-footer').removeClass('justify-content-between')

            $('#btnCompleteOrder').hide();
            $('#btnDeletetable').hide();
        }
    });
}

function tableDetails(id, name, status) {
    //$('#btnDeletetable').show();
    $('#orderModal').attr('data-id', id)
    $('#orderModal').attr('data-name', name)
    $('#orderModal').attr('data-status', status ? 1 : 0)
    getProductInCurrentOrder(id, name);

    $("#orderModal").modal('show');
}

$('#orderModal').on('hide.bs.modal', function () {

    var total = 0;
    var productlist = []
    var id = $('#orderModal').attr('data-id');
    var curProID = $('#order-details').attr('data-current');
    $.each($('#order-details div.order-item'), function (index, item) {
        var proID = $(item).attr('data-id')
        var name = $(item).attr('data-name');
        var qty = $(item).find('input.productQuantity').val();
        var price = $(item).find('input.productPrice').val();

        productlist.push({ proID: proID, name: name, price: price, qty: qty })
        total += (parseInt(qty) * parseInt(price));

    })
    if (productlist.length > 0) {
        var status = $('#orderModal').attr('data-status')
        var link = "/api/setproductcurrentorder?id=" + id
            + "&proList=" + JSON.stringify(productlist)
            + "&total=" + total
            + "&curProID=" + curProID
            + "&status=" + status;
        $.get(link, function (data, status) {
            console.log('Save Order')
            gettable();
        });
    } else if (!isNaN(id) && parseInt(id) > 0) deleteOrder();

    $('.product-in-order').hide();
    $('.product-in-order').text('')
    $('#order-details').html('');
    $('#order-details').attr('data-current', '')
    $('#orderModal').attr('data-id', '');
    $('#orderModal div.card-footer').html('Tổng Tiền: ')

})

function deleteOrder() {
    var id = $('#orderModal').attr('data-id');
    var link = "/api/deletecurrentorder?id=" + id
    $.get(link, function (data, status) {
        console.log('Delete Order')
        gettable();
    });
    $('#order-details').html('');
    $('#order-details').attr('data-current', '');
    $('#orderModal').attr('data-id', '');
    $('#orderModal div.card-footer').html('Tổng Tiền: ')
    $('#orderModal').modal('hide');
}

function completeOrder() {
    showLoading();
    var total = 0;
    var productlist = []
    var id = $('#orderModal').attr('data-id');
    var tableName = $('#orderModal').attr('data-name');
    var createtime = $('#order-details').attr('data-creattime');
    $.each($('#order-details div.order-item'), function (index, item) {
        var proID = $(item).attr('data-id')
        var name = $(item).attr('data-name');
        var qty = $(item).find('input.productQuantity').val();
        var price = $(item).find('input.productPrice').val();
        var priceSystem = $(item).parent().attr('data-price');

        productlist.push({ proID: proID, name: name, price: price, price_sys: priceSystem, qty: qty, calPrice: (parseInt(price) * parseInt(qty)).toLocaleString(window.document.documentElement.lang) })
        total += (parseInt(qty) * parseInt(price));

    })
    var dataPrint = {
        tableName: tableName,
        CreateDate: getDateForPrint(new Date(createtime)),
        CreateTime: getTimeString(new Date(createtime)),
        LeaveTime: getTimeString(new Date()),
        productList: productlist,
        TotalPrice: total.toLocaleString(window.document.documentElement.lang)
    }

    if (productlist.length > 0) {
        $.ajax({
            url: "/api/completecurrentorder",
            type: "POST",
            data: {
                'id': id,
                'name': tableName,
                'proList': JSON.stringify(productlist),
                'total': total,
                'createtime': getFullDateTimeString(new Date(createtime)),
                'dataPrint': JSON.stringify(dataPrint),
            },
            success: function (data) {
                console.log(data);
            },
            complete: function (result) {
                console.log(result.responseText);
                printReceipt(dataPrint);
                gettable();
            },
        });
        
    }
    $('#order-details').html('');
    $('#order-details').attr('data-current', '')
    $('#orderModal').attr('data-id', '');
    $('#orderModal').modal('hide');
}

function printReceipt(data) {
    $.get('print-template/receipt.htm', function (template) {

        let rendered = Mustache.render(template, data);
        $(rendered).printThis({
            importCSS: false,
            loadCSS: "../print-template/css/receipt.css",
            afterPrint: function () {
                hideLoading()
            }
        });
    });
}